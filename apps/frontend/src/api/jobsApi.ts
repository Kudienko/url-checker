import type { CreateJobResponse, Job, JobSummary } from '@url-checker/shared';

const BASE = '/api/jobs';

async function asJson<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

// Создать задание из списка URL
export const createJob = (urls: string[]): Promise<CreateJobResponse> =>
  fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ urls }),
  }).then(asJson<CreateJobResponse>);

// Список заданий (сводки)
export const getJobs = (): Promise<JobSummary[]> =>
  fetch(BASE).then(asJson<JobSummary[]>);

// Детали задания; signal — для отмены устаревшего опроса
export const getJob = (id: string, signal?: AbortSignal): Promise<Job> =>
  fetch(`${BASE}/${id}`, { signal }).then(asJson<Job>);

// Отмена задания
export const cancelJob = (id: string): Promise<void> =>
  fetch(`${BASE}/${id}`, { method: 'DELETE' }).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });
