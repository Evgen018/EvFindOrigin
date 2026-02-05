/**
 * Поиск через Google Custom Search JSON API
 * https://developers.google.com/custom-search/v1/using_rest
 */

const GOOGLE_CSE_URL = "https://www.googleapis.com/customsearch/v1";

export interface SearchResult {
  link: string;
  title: string;
  snippet: string;
}

export interface SearchResponse {
  success: boolean;
  items?: SearchResult[];
  error?: string;
}

export async function searchWeb(
  query: string,
  options?: { num?: number }
): Promise<SearchResponse> {
  const apiKey = process.env.GOOGLE_CSE_API_KEY;
  const engineId = process.env.GOOGLE_CSE_ENGINE_ID;

  if (!apiKey || !engineId) {
    return {
      success: false,
      error: "GOOGLE_CSE_API_KEY или GOOGLE_CSE_ENGINE_ID не заданы",
    };
  }

  const params = new URLSearchParams({
    key: apiKey,
    cx: engineId,
    q: query,
    num: String(Math.min(options?.num ?? 10, 10)),
  });

  try {
    const res = await fetch(`${GOOGLE_CSE_URL}?${params.toString()}`);
    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: data.error?.message ?? `HTTP ${res.status}`,
      };
    }

    const items: SearchResult[] = (data.items ?? []).map((item: { link?: string; title?: string; snippet?: string }) => ({
      link: item.link ?? "",
      title: item.title ?? "",
      snippet: item.snippet ?? "",
    }));

    return { success: true, items };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
