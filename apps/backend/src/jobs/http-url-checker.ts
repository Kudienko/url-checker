import { request } from 'undici';
import type { UrlChecker, Delayer } from './job-processor.service';

const TIMEOUT_MS = 5_000;

// Реальная HTTP-проверка: HEAD, таймаут 5с, следуем редиректам.
// Внешний signal позволяет оборвать запрос при отмене задания.
export const httpUrlChecker: UrlChecker = async (url, signal) => {
  const ac = new AbortController();
  const onAbort = () => ac.abort();
  signal.addEventListener('abort', onAbort);
  const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);

  try {
    const res = await request(url, {
      method: 'HEAD',
      maxRedirections: 5,
      signal: ac.signal,
    });
    // Сливаем тело, чтобы не держать соединение
    await res.body.dump();
    return { httpStatus: res.statusCode };
  } finally {
    clearTimeout(timer);
    signal.removeEventListener('abort', onAbort);
  }
};

// Реальная задержка через setTimeout
export const realDelayer: Delayer = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));
