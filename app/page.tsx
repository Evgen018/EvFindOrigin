import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui", maxWidth: "600px" }}>
      <h1>EvFindOrigin</h1>
      <p>Telegram-бот для поиска источников информации.</p>
      <p>
        <Link href="/mini" style={{ color: "#007AFF" }}>
          Открыть веб-приложение (Mini App) →
        </Link>
      </p>
      <p style={{ fontSize: "14px", color: "#666" }}>
        Webhook: <code>/api/telegram/webhook</code>
      </p>
    </main>
  );
}
