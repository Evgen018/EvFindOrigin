/**
 * AI-анализ через OpenAI gpt-4o-mini: сравнение смысла и ранжирование источников
 */

import OpenAI from "openai";
import type { SearchResult } from "@/lib/search";

export interface RankedSource {
  link: string;
  title: string;
  confidence: number;
  reason?: string;
}

const MODEL = "gpt-4o-mini";

function getClient(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

export async function rankSourcesByMeaning(
  originalText: string,
  candidates: SearchResult[],
  maxResults: number = 3
): Promise<{ success: boolean; sources?: RankedSource[]; error?: string }> {
  const client = getClient();
  if (!client) {
    return { success: false, error: "OPENAI_API_KEY не задан" };
  }

  if (candidates.length === 0) {
    return { success: true, sources: [] };
  }

  const candidatesText = candidates
    .map((c, i) => `${i + 1}. [${c.title}](${c.link})\n   ${c.snippet}`)
    .join("\n\n");

  const systemPrompt = `Ты — эксперт по проверке источников. Сравнивай СМЫСЛ, а не буквальный текст.
Выбери 1–3 источника, которые наиболее полно подтверждают или освещают утверждения из исходного текста.
Отвечай ТОЛЬКО валидным JSON-массивом без дополнительного текста.`;

  const userPrompt = `Исходный текст пользователя:
"""
${originalText}
"""

Кандидаты из поиска:
${candidatesText}

Верни JSON-массив объектов с полями: link (строка), title (строка), confidence (число 0-100), reason (краткое пояснение, почему источник релевантен).
Отсортируй по убыванию confidence. Максимум ${maxResults} источников.`;

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      return { success: false, error: "Пустой ответ от AI" };
    }

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const jsonStr = jsonMatch ? jsonMatch[0] : content;
    const parsed = JSON.parse(jsonStr) as Array<{
      link: string;
      title: string;
      confidence: number;
      reason?: string;
    }>;

    const sources: RankedSource[] = parsed.slice(0, maxResults).map((s) => ({
      link: s.link ?? "",
      title: s.title ?? "",
      confidence: typeof s.confidence === "number" ? s.confidence : 0,
      reason: s.reason,
    }));

    return { success: true, sources };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
