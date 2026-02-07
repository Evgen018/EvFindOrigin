"use client";

import { useState, useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        themeParams: Record<string, string>;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
      };
    };
  }
}

interface Source {
  link: string;
  title: string;
  confidence: number;
  reason?: string;
}

export default function MiniApp() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<Source[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState("#1c1c1e");
  const [textColor, setTextColor] = useState("#ffffff");

  useEffect(() => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      const params = tg.themeParams;
      if (params.bg_color) setBgColor(params.bg_color);
      if (params.text_color) setTextColor(params.text_color);
      tg.setHeaderColor(params.bg_color || "#1c1c1e");
      tg.setBackgroundColor(params.bg_color || "#1c1c1e");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;
    setLoading(true);
    setError(null);
    setSources(null);
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch(`${baseUrl}/api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });
      const data = await res.json();
      if (data.success && data.sources) {
        setSources(data.sources);
      } else {
        setError(data.error ?? "Ошибка поиска");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      <main
        style={{
          minHeight: "100vh",
          background: bgColor,
          color: textColor,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          padding: "16px",
          paddingBottom: "80px",
        }}
      >
        <header style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 600, margin: 0 }}>
            EvFindOrigin
          </h1>
          <p style={{ margin: "8px 0 0", opacity: 0.8, fontSize: "14px" }}>
            Найдите источники для проверки информации
          </p>
        </header>

        <form onSubmit={handleSubmit}>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Введите текст или утверждение для поиска источников..."
            disabled={loading}
            style={{
              width: "100%",
              minHeight: "100px",
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.08)",
              color: textColor,
              fontSize: "16px",
              resize: "vertical",
              boxSizing: "border-box",
            }}
            rows={4}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            style={{
              width: "100%",
              marginTop: "12px",
              padding: "14px",
              borderRadius: "12px",
              border: "none",
              background: loading ? "rgba(0,122,255,0.5)" : "#007AFF",
              color: "#fff",
              fontSize: "16px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Поиск..." : "Найти источники"}
          </button>
        </form>

        {error && (
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              borderRadius: "12px",
              background: "rgba(255,59,48,0.2)",
              color: "#ff3b30",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        {sources && sources.length > 0 && (
          <section style={{ marginTop: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "12px" }}>
              Возможные источники
            </h2>
            {sources.map((s, i) => (
              <a
                key={i}
                href={s.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  padding: "16px",
                  marginBottom: "12px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  textDecoration: "none",
                  color: textColor,
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: "4px" }}>{s.title}</div>
                <div
                  style={{
                    fontSize: "12px",
                    opacity: 0.8,
                    marginBottom: "8px",
                  }}
                >
                  Уверенность: {s.confidence}%
                </div>
                {s.reason && (
                  <div style={{ fontSize: "13px", opacity: 0.9 }}>{s.reason}</div>
                )}
                <div
                  style={{
                    fontSize: "12px",
                    opacity: 0.6,
                    marginTop: "8px",
                    wordBreak: "break-all",
                  }}
                >
                  {s.link}
                </div>
              </a>
            ))}
          </section>
        )}
      </main>
    </>
  );
}
