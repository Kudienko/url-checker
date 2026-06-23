import type { UrlResult } from '@url-checker/shared';
import { isFinalStatus } from '@url-checker/shared';
import { useJobsStore } from '../store/jobsStore';

const processedCount = (results: UrlResult[]): number =>
  results.filter((r) => ['success', 'error', 'cancelled'].includes(r.status)).length;

// Детали активного задания: общий статус, прогресс «X из Y», таблица URL, отмена
export function JobDetails() {
  const job = useJobsStore((s) => s.activeJobDetails);
  const cancelActiveJob = useJobsStore((s) => s.cancelActiveJob);

  if (!job) {
    return <p className="text-sm text-gray-500">Выберите задание</p>;
  }

  const processed = processedCount(job.results);
  const canCancel = !isFinalStatus(job.status);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-semibold">Статус: {job.status}</span>
          <span className="ml-3 text-sm text-gray-600">
            {processed} из {job.results.length} обработано
          </span>
        </div>
        <button
          className="rounded bg-red-600 px-3 py-1 text-sm text-white disabled:opacity-40"
          onClick={cancelActiveJob}
          disabled={!canCancel}
        >
          Отменить задание
        </button>
      </div>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b text-gray-500">
            <th className="py-1">URL</th>
            <th>Статус</th>
            <th>HTTP</th>
            <th>Длительность</th>
            <th>Ошибка</th>
          </tr>
        </thead>
        <tbody>
          {job.results.map((r) => (
            <tr key={r.url} className="border-b border-gray-100">
              <td className="py-1 font-mono">{r.url}</td>
              <td>{r.status}</td>
              <td>{r.httpStatus ?? '—'}</td>
              <td>{r.durationMs != null ? `${r.durationMs} мс` : '—'}</td>
              <td className="text-red-600">{r.error ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
