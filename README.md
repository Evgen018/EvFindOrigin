# EvFindOrigin

Telegram-бот для поиска источников информации. Получает текст или ссылку на пост и находит возможные источники.

## Стек

- Next.js (App Router)
- TypeScript
- Деплой: Vercel

## Установка

```powershell
npm install
```

## Конфигурация

Скопируйте `.env.example` в `.env` и заполните:

```powershell
Copy-Item .env.example .env
```

- `TELEGRAM_BOT_TOKEN` — токен от [@BotFather](https://t.me/BotFather)
- `OPENROUTER_API_KEY` — ключ OpenRouter ([бесплатные модели](https://openrouter.ai/models?q=free))
- `SERPER_API_KEY` — ключ Serper ([serper.dev](https://serper.dev), бесплатно 2500 запросов/месяц)

## Запуск

```powershell
npm run dev
```

## Webhook

После деплоя на Vercel установите webhook:

```powershell
$env:TELEGRAM_BOT_TOKEN = "YOUR_TOKEN"
.\scripts\set-webhook.ps1 -Url "https://your-app.vercel.app/api/telegram/webhook"
```

## Реализовано

- ✅ Webhook-эндпоинт `/api/telegram/webhook`
- ✅ **Telegram Mini App** — UI на `/mini`
- ✅ API поиска `/api/search` (JSON)
- ✅ Обработка ввода (текст и ссылки t.me / telegram.me)
- ✅ Поиск через Serper API
- ✅ AI-ранжирование через OpenRouter (сравнение смысла)
- ✅ Отправка 1–3 источников с оценкой уверенности

## Telegram Mini App

Откройте бота → нажмите «Открыть EvFindOrigin» или установите Menu Button:

```powershell
$env:TELEGRAM_BOT_TOKEN = "YOUR_TOKEN"
.\scripts\set-menu-button.ps1 -Url "https://ev-find-origin-ruddy.vercel.app/mini"
```
