import { JobProcessorService, UrlChecker } from './job-processor.service';
import { JobsStore } from './jobs.store';
import type { Job } from '@url-checker/shared';

const makeJob = (urls: string[]): Job => ({
  id: 'j1',
  createdAt: new Date().toISOString(),
  status: 'pending',
  results: urls.map((url) => ({ url, status: 'pending' })),
});

describe('JobProcessorService', () => {
  it('обрабатывает все URL и ставит completed', async () => {
    const store = new JobsStore();
    const job = makeJob(['https://a.com', 'https://b.com']);
    store.save(job);
    const checker: UrlChecker = async () => ({ httpStatus: 200 });
    const proc = new JobProcessorService(store, checker, () => Promise.resolve());

    await proc.process('j1');

    const done = store.get('j1')!;
    expect(done.status).toBe('completed');
    expect(done.results.every((r) => r.status === 'success')).toBe(true);
    expect(done.results[0].httpStatus).toBe(200);
  });

  it('URL с ошибкой получает status error, задание всё равно completed', async () => {
    const store = new JobsStore();
    store.save(makeJob(['https://bad.com']));
    const checker: UrlChecker = async () => {
      throw new Error('ENOTFOUND');
    };
    const proc = new JobProcessorService(store, checker, () => Promise.resolve());

    await proc.process('j1');

    const done = store.get('j1')!;
    expect(done.status).toBe('completed');
    expect(done.results[0].status).toBe('error');
    expect(done.results[0].error).toContain('ENOTFOUND');
  });

  it('не запускает более 5 проверок одновременно', async () => {
    const store = new JobsStore();
    store.save(makeJob(Array.from({ length: 12 }, (_, i) => `https://h${i}.com`)));
    let active = 0;
    let maxActive = 0;
    const checker: UrlChecker = async () => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      await new Promise((r) => setTimeout(r, 10));
      active -= 1;
      return { httpStatus: 200 };
    };
    const proc = new JobProcessorService(store, checker, () => Promise.resolve());

    await proc.process('j1');

    expect(maxActive).toBeLessThanOrEqual(5);
    expect(store.get('j1')!.status).toBe('completed');
  });

  it('после отмены не начатые URL получают cancelled, статус cancelled', async () => {
    const store = new JobsStore();
    const job = makeJob(Array.from({ length: 10 }, (_, i) => `https://h${i}.com`));
    (job as Job & { cancelled?: boolean }).cancelled = false;
    store.save(job);
    const checker: UrlChecker = async () => {
      // Помечаем задание отменённым в процессе обработки первой пачки
      const j = store.get('j1') as Job & { cancelled?: boolean };
      j.status = 'cancelled';
      j.cancelled = true;
      return { httpStatus: 200 };
    };
    const proc = new JobProcessorService(store, checker, () => Promise.resolve());

    await proc.process('j1');

    const done = store.get('j1')!;
    expect(done.status).toBe('cancelled');
    expect(done.results.some((r) => r.status === 'cancelled')).toBe(true);
  });
});
