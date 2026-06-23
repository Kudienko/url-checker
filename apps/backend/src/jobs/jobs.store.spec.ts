import { JobsStore } from './jobs.store';
import type { Job } from '@url-checker/shared';

const makeJob = (id: string): Job => ({
  id,
  createdAt: new Date().toISOString(),
  status: 'pending',
  results: [{ url: 'https://a.com', status: 'pending' }],
});

describe('JobsStore', () => {
  it('сохраняет и достаёт задание по id', () => {
    const store = new JobsStore();
    store.save(makeJob('1'));
    expect(store.get('1')?.id).toBe('1');
  });

  it('get несуществующего возвращает undefined', () => {
    expect(new JobsStore().get('nope')).toBeUndefined();
  });

  it('list возвращает задания, новые сверху', () => {
    const store = new JobsStore();
    const older = makeJob('1');
    older.createdAt = '2020-01-01T00:00:00.000Z';
    const newer = makeJob('2');
    newer.createdAt = '2021-01-01T00:00:00.000Z';
    store.save(older);
    store.save(newer);
    expect(store.list().map((j) => j.id)).toEqual(['2', '1']);
  });
});
