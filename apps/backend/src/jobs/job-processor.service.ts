import { Injectable } from '@nestjs/common';
import pLimit from 'p-limit';
import { JobsStore } from './jobs.store';
import type { Job, UrlResult } from '@url-checker/shared';

// Результат проверки одного URL чекером
export interface CheckOutcome {
  httpStatus: number;
}

// Зависимость: реальная HTTP-проверка (мокается в тестах)
export type UrlChecker = (url: string, signal: AbortSignal) => Promise<CheckOutcome>;

// Зависимость: искусственная задержка (мокается в тестах)
export type Delayer = (ms: number) => Promise<void>;

const MAX_CONCURRENCY = 5;

// Внутренний флаг отмены живёт на объекте Job
type JobWithCancel = Job & { cancelled?: boolean };

@Injectable()
export class JobProcessorService {
  constructor(
    private readonly store: JobsStore,
    private readonly checkUrl: UrlChecker,
    private readonly delay: Delayer,
  ) {}

  // Запуск обработки задания в фоне (fire-and-forget из сервиса)
  async process(jobId: string): Promise<void> {
    const job = this.store.get(jobId) as JobWithCancel | undefined;
    if (!job) return;
    if (job.status === 'pending') job.status = 'in_progress';

    const limit = pLimit(MAX_CONCURRENCY);
    let unexpectedFailures = 0;

    await Promise.all(
      job.results.map((result) =>
        limit(async () => {
          if (job.cancelled) {
            if (result.status === 'pending') result.status = 'cancelled';
            return;
          }
          try {
            await this.processOne(job, result);
          } catch {
            unexpectedFailures += 1;
          }
        }),
      ),
    );

    job.status = this.resolveJobStatus(job, unexpectedFailures);
  }

  private async processOne(job: JobWithCancel, result: UrlResult): Promise<void> {
    const controller = new AbortController();
    const startedAt = Date.now();
    result.status = 'in_progress';
    result.startedAt = new Date(startedAt).toISOString();

    try {
      const outcome = await this.checkUrl(result.url, controller.signal);
      // Искусственная задержка 0–10с внутри слота (слот занят до её конца)
      await this.delay(Math.floor(Math.random() * 10_001));
      result.status = 'success';
      result.httpStatus = outcome.httpStatus;
    } catch (e) {
      await this.delay(Math.floor(Math.random() * 10_001));
      result.status = 'error';
      result.error = e instanceof Error ? e.message : String(e);
    } finally {
      const finishedAt = Date.now();
      result.finishedAt = new Date(finishedAt).toISOString();
      result.durationMs = finishedAt - startedAt;
    }
  }

  private resolveJobStatus(job: JobWithCancel, unexpectedFailures: number): Job['status'] {
    if (job.cancelled) return 'cancelled';
    if (unexpectedFailures === job.results.length && job.results.length > 0) return 'failed';
    return 'completed';
  }
}
