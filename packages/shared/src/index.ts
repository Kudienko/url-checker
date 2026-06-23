// Статусы задания и отдельного URL — единый источник для бэка и фронта
export type JobStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'failed';
export type UrlStatus = 'pending' | 'in_progress' | 'success' | 'error' | 'cancelled';

export const FINAL_JOB_STATUSES: JobStatus[] = ['completed', 'cancelled', 'failed'];

export const isFinalStatus = (s: JobStatus): boolean => FINAL_JOB_STATUSES.includes(s);

// Результат проверки одного URL
export interface UrlResult {
  url: string;
  status: UrlStatus;
  httpStatus?: number;
  error?: string;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
}

// Полное задание (ответ GET /api/jobs/:id)
export interface Job {
  id: string;
  createdAt: string;
  status: JobStatus;
  results: UrlResult[];
}

// Краткая информация (элемент ответа GET /api/jobs)
export interface JobSummary {
  id: string;
  createdAt: string;
  status: JobStatus;
  total: number;
  success: number;
  error: number;
}

// Тело POST /api/jobs
export interface CreateJobRequest {
  urls: string[];
}

export interface CreateJobResponse {
  jobId: string;
}
