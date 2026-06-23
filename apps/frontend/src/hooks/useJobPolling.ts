import { useEffect } from 'react';
import { isFinalStatus } from '@url-checker/shared';
import { getJob } from '../api/jobsApi';
import { useJobsStore } from '../store/jobsStore';

const POLL_INTERVAL_MS = 1500;

// Опрашивает активное задание каждые 1.5с, пока статус не финальный.
// При смене activeJobId предыдущий опрос корректно останавливается,
// ответы по старому jobId не пишутся в стор (setActiveDetails сверяет id).
export function useJobPolling(activeJobId: string | null): void {
  const setActiveDetails = useJobsStore((s) => s.setActiveDetails);
  const loadJobs = useJobsStore((s) => s.loadJobs);

  useEffect(() => {
    if (!activeJobId) return;

    let cancelled = false;
    const controller = new AbortController();

    const tick = async () => {
      try {
        const job = await getJob(activeJobId, controller.signal);
        if (cancelled) return;
        setActiveDetails(job);
        await loadJobs();
        if (isFinalStatus(job.status)) {
          clearInterval(timer);
        }
      } catch {
        // Прерванный запрос (AbortError) или сетевая ошибка — молча игнорируем
      }
    };

    void tick();
    const timer = setInterval(tick, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      controller.abort();
      clearInterval(timer);
    };
  }, [activeJobId, setActiveDetails, loadJobs]);
}
