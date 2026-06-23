import { useJobsStore } from '../store/jobsStore';

// Список заданий: id, дата, статус, статистика; клик выбирает активное
export function JobsList() {
  const jobs = useJobsStore((s) => s.jobs);
  const activeJobId = useJobsStore((s) => s.activeJobId);
  const selectJob = useJobsStore((s) => s.selectJob);

  if (jobs.length === 0) {
    return <p className="text-sm text-gray-500">Заданий пока нет</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {jobs.map((job) => (
        <li key={job.id}>
          <button
            className={`w-full rounded border p-2 text-left text-sm ${
              job.id === activeJobId ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
            }`}
            onClick={() => selectJob(job.id)}
          >
            <div className="flex justify-between">
              <span className="font-mono">{job.id.slice(0, 8)}</span>
              <span className="font-semibold">{job.status}</span>
            </div>
            <div className="text-xs text-gray-500">
              {new Date(job.createdAt).toLocaleString()} · всего {job.total} · ок{' '}
              {job.success} · ошибок {job.error}
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
