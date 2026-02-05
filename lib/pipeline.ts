/**
 * Пайплайн: ввод → поиск (Google) → AI-ранжирование (OpenAI gpt-4o-mini) → результат
 * Без предварительного анализа текста
 */

import {
  parseInput,
  getTextForAnalysis,
  isUnfetchableTelegramLink,
} from "@/lib/input";
import { searchWeb } from "@/lib/search";
import { rankSourcesByMeaning, type RankedSource } from "@/lib/ai";

export type PipelineResult =
  | { success: true; message: string }
  | { success: false; message: string };

/**
 * Запускает пайплайн: поиск → AI-ранжирование → форматирование
 */
export async function runPipeline(rawInput: string): Promise<PipelineResult> {
  const parsed = parseInput(rawInput);

  if (parsed.type === "text" && (!parsed.text || parsed.text.length === 0)) {
    return {
      success: false,
      message:
        "Введите текст для анализа или ссылку на Telegram-пост.\n\n" +
        "По ссылке бот не может получить текст — скопируйте текст поста и отправьте сюда.",
    };
  }

  if (isUnfetchableTelegramLink(parsed)) {
    return {
      success: false,
      message:
        "Это ссылка на Telegram-пост. Бот не может получить текст по ссылке.\n\n" +
        "Скопируйте текст поста и отправьте его сюда для анализа.",
    };
  }

  const text = getTextForAnalysis(parsed);
  if (!text) {
    return { success: false, message: "Не удалось получить текст для анализа." };
  }

  const searchRes = await searchWeb(text, { num: 10 });
  if (!searchRes.success || !searchRes.items?.length) {
    return {
      success: false,
      message: searchRes.error
        ? `Ошибка поиска: ${searchRes.error}`
        : "Поиск не нашёл подходящих результатов.",
    };
  }

  const rankRes = await rankSourcesByMeaning(text, searchRes.items, 3);
  if (!rankRes.success || !rankRes.sources?.length) {
    return {
      success: false,
      message: rankRes.error
        ? `Ошибка AI: ${rankRes.error}`
        : "Не удалось отранжировать источники.",
    };
  }

  const formatted = formatResultForUser(text, rankRes.sources);
  return { success: true, message: formatted };
}

function formatResultForUser(originalText: string, sources: RankedSource[]): string {
  const parts: string[] = ["<b>Возможные источники:</b>\n"];

  sources.forEach((s, i) => {
    parts.push(`${i + 1}. ${s.title}`);
    parts.push(`   <a href="${s.link}">${s.link}</a>`);
    parts.push(`   Уверенность: ${s.confidence}%`);
    if (s.reason) {
      parts.push(`   ${s.reason}`);
    }
    parts.push("");
  });

  return parts.join("\n").trim();
}
