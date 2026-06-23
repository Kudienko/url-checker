# URL Checker

> **🌐 Живое демо:** http://89.125.78.214/ — можно потыкать без локального развёртывания.

Сервис асинхронной проверки списка URL. Бэкенд (NestJS, in-memory) принимает список URL,
асинхронно делает HEAD-запросы (не более 5 параллельно на задание, с искусственной задержкой
0–10с), фронтенд (React + Zustand + Tailwind) создаёт задания, показывает прогресс и позволяет
отменять.

## Стек

- Монорепо: pnpm + Turborepo
- Бэкенд: Node 20, NestJS, TypeScript, undici, p-limit
- Фронтенд: React 18, Vite, Zustand, Tailwind
- Общие типы: `packages/shared`

## Запуск через Docker (рекомендуется)

```bash
docker compose up --build
```

- UI: http://localhost:8080
- API: http://localhost:3000/api

## Локальный запуск

```bash
pnpm install
pnpm dev          # turbo поднимает backend (:3000) и frontend (:5173)
```

Фронт в dev-режиме проксирует `/api` на `localhost:3000` (см. `apps/frontend/vite.config.ts`).
Открыть UI: http://localhost:5173

## API

| Метод  | Путь            | Описание                                                     |
| ------ | --------------- | ------------------------------------------------------------ |
| POST   | `/api/jobs`     | Создать задание `{ "urls": ["..."] }` → `{ "jobId": "..." }` |
| GET    | `/api/jobs`     | Список заданий со статистикой                                 |
| GET    | `/api/jobs/:id` | Детали задания по всем URL                                    |
| DELETE | `/api/jobs/:id` | Отменить задание                                             |

### Статусы

- Задание: `pending` → `in_progress` → `completed` / `cancelled` / `failed`
- URL: `pending` → `in_progress` → `success` / `error` / `cancelled`

## Логика обработки

- На каждый URL — HTTP HEAD-запрос, таймаут 5с, следуем редиректам.
- Перед сохранением результата — искусственная задержка 0–10с (внутри слота конкуренции).
- Не более 5 одновременных проверок на одно задание; несколько заданий идут параллельно.
- Отмена кооперативная: не начатые URL помечаются `cancelled`, летящие запросы прерываются.

## Тесты

```bash
pnpm test         # юнит-тесты бэка (store, processor, service)
```

## Структура

```
apps/backend/     # NestJS API (in-memory)
apps/frontend/    # React SPA
packages/shared/  # Общие TS-типы и статусы
```

## Переменные окружения

- `PORT` (бэк, по умолчанию 3000)
