import { Agent, request } from 'undici';
import type { UrlChecker, Delayer } from './job-processor.service';

const TIMEOUT_MS = 5_000;

// Агент с явными таймаутами: connect/headers/body = 5с.
// Таймаут на connect критичен — иначе «висящий» TCP-коннект рвётся только
// дефолтным connectTimeout undici (10с), и наш лимит 5с не соблюдается.
const agent = new Agent({
  connect: { timeout: TIMEOUT_MS },
  headersTimeout: TIMEOUT_MS,
  bodyTimeout: TIMEOUT_MS,
});

// Реальная HTTP-проверка: HEAD, таймаут 5с, следуем редиректам.
// Внешний signal позволяет оборвать запрос при отмене задания.
export const httpUrlChecker: UrlChecker = async (url, signal) => {
  const res = await request(url, {
    method: 'HEAD',
    maxRedirections: 5,
    dispatcher: agent,
    signal,
  });
  // Сливаем тело, чтобы не держать соединение
  await res.body.dump();
  return { httpStatus: res.statusCode };
};

// Реальная задержка через setTimeout
export const realDelayer: Delayer = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));
