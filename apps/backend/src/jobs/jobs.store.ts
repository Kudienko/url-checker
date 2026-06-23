import { Injectable } from '@nestjs/common';
import type { Job } from '@url-checker/shared';

// Изоляция in-memory хранилища заданий за тонким интерфейсом
@Injectable()
export class JobsStore {
  private readonly jobs = new Map<string, Job>();

  save(job: Job): void {
    this.jobs.set(job.id, job);
  }

  get(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  // Все задания, отсортированные по дате создания (новые сверху)
  list(): Job[] {
    return [...this.jobs.values()].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  }
}
