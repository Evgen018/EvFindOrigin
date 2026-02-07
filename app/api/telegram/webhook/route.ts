/**
 * Webhook для Telegram Bot API
 * Принимает POST с update, возвращает 200 OK сразу,
 * основную логику выполняет асинхронно
 */

import { NextRequest, NextResponse } from "next/server";
import { sendMessage } from "@/lib/telegram";
import { runPipeline } from "@/lib/pipeline";

interface TelegramUpdate {
  message?: {
    chat: { id: number };
    text?: string;
    caption?: string;
  };
}

function getTextFromUpdate(update: TelegramUpdate): string | null {
  const msg = update?.message;
  if (!msg) return null;
  return msg.text ?? msg.caption ?? null;
}

function getChatId(update: TelegramUpdate): number | null {
  return update?.message?.chat?.id ?? null;
}

export async function POST(request: NextRequest) {
  let update: TelegramUpdate;
  try {
    update = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const chatId = getChatId(update);
  const text = getTextFromUpdate(update);

  if (chatId == null) {
    return NextResponse.json({ error: "No chat id" }, { status: 400 });
  }

  // На Vercel функция завершается после return — нужно дождаться обработки
  await processUpdate(chatId, text ?? "");

  return new NextResponse(null, { status: 200 });
}

async function processUpdate(chatId: number, rawInput: string): Promise<void> {
  try {
    const trimmed = rawInput.trim();
    if (trimmed === "/start" || trimmed === "/help") {
      const appUrl =
        process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : process.env.APP_URL ?? "https://ev-find-origin-ruddy.vercel.app";
      await sendMessage(
        chatId,
        "<b>EvFindOrigin</b>\n\n" +
          "Отправьте текст или утверждение — я найду возможные источники и оценю их релевантность.\n\n" +
          "Или откройте веб-приложение для удобного поиска:",
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "🔄 Открыть EvFindOrigin", web_app: { url: `${appUrl}/mini` } }],
            ],
          },
        }
      );
      return;
    }

    const result = await runPipeline(rawInput);

    if (!result.success) {
      await sendMessage(chatId, result.message);
      return;
    }

    await sendMessage(chatId, result.message);
  } catch (err) {
    console.error("[webhook] Error:", err);
    try {
      await sendMessage(
        chatId,
        "Произошла ошибка при обработке. Попробуйте позже."
      );
    } catch (sendErr) {
      console.error("[webhook] Failed to send error message:", sendErr);
    }
  }
}
