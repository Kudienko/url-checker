import { useEffect } from 'react';
import { CreateJobForm } from './components/CreateJobForm';
import { JobsList } from './components/JobsList';
import { JobDetails } from './components/JobDetails';
import { useJobPolling } from './hooks/useJobPolling';
import { useJobsStore } from './store/jobsStore';

export function App() {
  const loadJobs = useJobsStore((s) => s.loadJobs);
  const activeJobId = useJobsStore((s) => s.activeJobId);
  const error = useJobsStore((s) => s.error);

  // Первичная загрузка списка
  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  // Опрос активного задания
  useJobPolling(activeJobId);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-2xl font-bold">URL Checker</h1>
      {error && <p className="mb-3 rounded bg-red-100 p-2 text-sm text-red-700">{error}</p>}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_1.5fr]">
        <div className="flex flex-col gap-6">
          <CreateJobForm />
          <div>
            <h2 className="mb-2 text-lg font-semibold">Задания</h2>
            <JobsList />
          </div>
        </div>
        <div>
          <h2 className="mb-2 text-lg font-semibold">Детали</h2>
          <JobDetails />
        </div>
      </div>
    </div>
  );
}
