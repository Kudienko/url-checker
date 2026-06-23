import { useState } from 'react';
import { useJobsStore } from '../store/jobsStore';

// Форма: textarea (URL построчно) + кнопка «Запустить проверку»
export function CreateJobForm() {
  const [raw, setRaw] = useState('');
  const submitUrls = useJobsStore((s) => s.submitUrls);
  const loading = useJobsStore((s) => s.loading);

  const handleSubmit = async () => {
    const urls = raw
      .split('\n')
      .map((u) => u.trim())
      .filter(Boolean);
    if (urls.length === 0) return;
    await submitUrls(urls);
    setRaw('');
  };

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">Новая проверка</h2>
      <textarea
        className="h-40 w-full rounded border border-gray-300 p-2 font-mono text-sm"
        placeholder={'https://example.com\nhttps://google.com'}
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
      />
      <button
        className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        onClick={handleSubmit}
        disabled={loading || raw.trim().length === 0}
      >
        Запустить проверку
      </button>
    </div>
  );
}
