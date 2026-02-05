# FindOrigin

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
- `GOOGLE_CSE_API_KEY` — ключ Google Custom Search API ([Credentials](https://console.cloud.google.com/apis/credentials))
- `GOOGLE_CSE_ENGINE_ID` — ID поисковой системы ([Programmable Search Engine](https://programmablesearchengine.google.com/))

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
- ✅ Обработка ввода (текст и ссылки t.me / telegram.me)
- ✅ Поиск через Google Custom Search API
- ✅ AI-ранжирование через OpenAI gpt-4o-mini (сравнение смысла)
- ✅ Отправка 1–3 источников с оценкой уверенности
