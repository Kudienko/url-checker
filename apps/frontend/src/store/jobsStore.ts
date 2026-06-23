import { create } from 'zustand';
import type { Job, JobSummary } from '@url-checker/shared';
import { cancelJob, createJob, getJob, getJobs } from '../api/jobsApi';

interface JobsState {
  jobs: JobSummary[];
  activeJobId: string | null;
  activeJobDetails: Job | null;
  loading: boolean;
  error: string | null;

  submitUrls: (urls: string[]) => Promise<void>;
  loadJobs: () => Promise<void>;
  selectJob: (id: string) => void;
  // Запись деталей с защитой от гонок: пишем, только если id совпадает с активным
  setActiveDetails: (job: Job) => void;
  cancelActiveJob: () => Promise<void>;
}

export const useJobsStore = create<JobsState>((set, get) => ({
  jobs: [],
  activeJobId: null,
  activeJobDetails: null,
  loading: false,
  error: null,

  submitUrls: async (urls) => {
    set({ loading: true, error: null });
    try {
      const { jobId } = await createJob(urls);
      // Новое задание становится активным, детали сбрасываем
      set({ activeJobId: jobId, activeJobDetails: null });
      await get().loadJobs();
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Ошибка создания задания' });
    } finally {
      set({ loading: false });
    }
  },

  loadJobs: async () => {
    try {
      set({ jobs: await getJobs() });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Ошибка загрузки списка' });
    }
  },

  selectJob: (id) => {
    if (get().activeJobId === id) return;
    // Смена активного — сбрасываем детали, чтобы не показывать чужие
    set({ activeJobId: id, activeJobDetails: null });
  },

  setActiveDetails: (job) => {
    // Защита от гонок: ответ по старому jobId игнорируем
    if (get().activeJobId !== job.id) return;
    set({ activeJobDetails: job });
  },

  cancelActiveJob: async () => {
    const id = get().activeJobId;
    if (!id) return;
    try {
      await cancelJob(id);
      await get().loadJobs();
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Ошибка отмены' });
    }
  },
}));
