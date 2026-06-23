import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import type { CreateJobResponse, Job, JobSummary } from '@url-checker/shared';
import { JobsStore } from './jobs.store';
import { JobProcessorService } from './job-processor.service';

type JobWithCancel = Job & { cancelled?: boolean };

@Injectable()
export class JobsService {
  constructor(
    private readonly store: JobsStore,
    private readonly processor: JobProcessorService,
  ) {}

  // Создаёт задание pending и запускает фоновую обработку (fire-and-forget)
  create(urls: string[]): CreateJobResponse {
    const job: JobWithCancel = {
      id: uuid(),
      createdAt: new Date().toISOString(),
      status: 'pending',
      cancelled: false,
      results: urls.map((url) => ({ url, status: 'pending' })),
    };
    this.store.save(job);
    // Не ждём завершения — обработка идёт в фоне
    void this.processor.process(job.id);
    return { jobId: job.id };
  }

  getJob(id: string): Job | undefined {
    return this.store.get(id);
  }

  listSummaries(): JobSummary[] {
    return this.store.list().map((job) => ({
      id: job.id,
      createdAt: job.createdAt,
      status: job.status,
      total: job.results.length,
      success: job.results.filter((r) => r.status === 'success').length,
      error: job.results.filter((r) => r.status === 'error').length,
    }));
  }

  // Кооперативная отмена: флаг подхватывает процессор перед каждым URL
  cancel(id: string): boolean {
    const job = this.store.get(id) as JobWithCancel | undefined;
    if (!job) return false;
    job.cancelled = true;
    job.status = 'cancelled';
    return true;
  }
}
