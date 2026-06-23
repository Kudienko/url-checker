import { JobsService } from './jobs.service';
import { JobsStore } from './jobs.store';
import { JobProcessorService } from './job-processor.service';

describe('JobsService', () => {
  const makeService = () => {
    const store = new JobsStore();
    // Процессор-заглушка: ничего не делает асинхронно
    const processor = {
      process: vi.fn().mockResolvedValue(undefined),
    } as unknown as JobProcessorService;
    return { service: new JobsService(store, processor), store, processor };
  };

  it('create сохраняет задание pending со всеми URL и запускает обработку', () => {
    const { service, store, processor } = makeService();
    const { jobId } = service.create(['https://a.com', 'https://b.com']);
    const job = store.get(jobId)!;
    expect(job.status).toBe('pending');
    expect(job.results).toHaveLength(2);
    expect(job.results[0].status).toBe('pending');
    expect(processor.process).toHaveBeenCalledWith(jobId);
  });

  it('listSummaries считает total/success/error', () => {
    const { service, store } = makeService();
    const { jobId } = service.create(['https://a.com', 'https://b.com', 'https://c.com']);
    const job = store.get(jobId)!;
    job.results[0].status = 'success';
    job.results[1].status = 'error';
    const [summary] = service.listSummaries();
    expect(summary).toMatchObject({ total: 3, success: 1, error: 1 });
  });

  it('cancel помечает задание cancelled', () => {
    const { service, store } = makeService();
    const { jobId } = service.create(['https://a.com']);
    const ok = service.cancel(jobId);
    expect(ok).toBe(true);
    const job = store.get(jobId) as { cancelled?: boolean; status: string };
    expect(job.status).toBe('cancelled');
    expect(job.cancelled).toBe(true);
  });

  it('cancel несуществующего возвращает false', () => {
    const { service } = makeService();
    expect(service.cancel('nope')).toBe(false);
  });
});
