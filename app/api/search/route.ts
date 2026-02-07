/**
 * API для поиска источников (используется Mini App)
 * POST /api/search { "query": "текст для поиска" }
 */

import { NextRequest, NextResponse } from "next/server";
import { searchWeb } from "@/lib/search";
import { rankSourcesByMeaning, type RankedSource } from "@/lib/ai";

export interface SearchApiResponse {
  success: boolean;
  sources?: RankedSource[];
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = typeof body?.query === "string" ? body.query.trim() : "";

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Пустой запрос" },
        { status: 400 }
      );
    }

    const searchRes = await searchWeb(query, { num: 10 });
    if (!searchRes.success || !searchRes.items?.length) {
      return NextResponse.json({
        success: false,
        error: searchRes.error ?? "Поиск не нашёл результатов",
      });
    }

    const rankRes = await rankSourcesByMeaning(query, searchRes.items, 3);
    if (!rankRes.success || !rankRes.sources?.length) {
      return NextResponse.json({
        success: false,
        error: rankRes.error ?? "Не удалось отранжировать источники",
      });
    }

    return NextResponse.json({
      success: true,
      sources: rankRes.sources,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
