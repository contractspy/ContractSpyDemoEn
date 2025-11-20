import { useState } from "react";

export default function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "bot"; text: string }[]
  >([
    {
      role: "bot",
      text: "Hi! Feel free to ask me about your contracts.",
    },
  ]);

  const onSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");

    setMessages((m) => [...m, { role: "user", text }]);

    setMessages((m) => [
      ...m,
      {
        role: "bot",
        text:
          "Hi! Based on the Contract I can give you the following information:\n\n" +
          "💡 Price level:\n" +
          "Your current electricity cost of €89.00 is slightly above the typical market range (€72–€85).\n\n" +
          "✔️ Positive clause:\n" +
          "“Guaranteed fixed-price period for the first 12 months.” This protects you from price increases.\n\n" +
          "❗ Potentially negative clause:\n" +
          "“Automatic renewal with a 60-day cancellation period.” Missing this window could lock you in at higher rates.\n\n" +
          "📌 Summary:\n" +
          "Your tariff is not dramatically overpriced but not among the most competitive either. It offers stability but has a long cancellation period.\n\n" +
          "🔁 Recommendation:\n" +
          "You don’t need to switch immediately, but it may be worth comparing providers with shorter notice periods and clearer renewal terms.",
      },
    ]);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        aria-label="Open chat"
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          width: 56,
          height: 56,
          borderRadius: 999,
          border: "none",
          background: "linear-gradient(145deg, #111 0%, #333 60%, #111 100%)",
          color: "#fff",
          boxShadow: "0 10px 24px rgba(0,0,0,.18)",
          cursor: "pointer",
          zIndex: 60,
          display: open ? "none" : "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 12c0 3.866-3.806 7-8.5 7-.814 0-1.6-.094-2.34-.27L4 20l1.62-3.24C4.61 15.57 4 13.86 4 12 4 8.134 7.806 5 12.5 5S21 8.134 21 12Z"
            stroke="white"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="10" cy="12" r="1.2" fill="white" />
          <circle cx="14" cy="12" r="1.2" fill="white" />
        </svg>
      </button>

      {/* Chat Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="ContractSpy Chat"
          style={{
            position: "fixed",
            right: 24,
            bottom: 24,

            // 🔽 HIER größer gemacht + responsiv
            width: "min(520px, 100vw - 32px)",
            height: "min(620px, 80vh)",

            background: "rgba(255,255,255,0.97)",
            border: "1px solid rgba(0,0,0,.08)",
            borderRadius: 18,
            boxShadow: "0 24px 48px rgba(0,0,0,.22)",
            backdropFilter: "blur(10px) saturate(180%)",
            display: "flex",
            flexDirection: "column",
            zIndex: 60,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "10px 14px",
              borderBottom: "1px solid rgba(0,0,0,.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 14 }}>ContractSpy Chat</div>
            <button
              aria-label="Close chat"
              onClick={() => setOpen(false)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 999,
                border: "1px solid rgba(0,0,0,.12)",
                background: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="#111"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "12px 12px 6px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "90%",
                  background:
                    m.role === "user"
                      ? "#111"
                      : "linear-gradient(180deg, #fff, #f7f7f8)",
                  color: m.role === "user" ? "#fff" : "#111",
                  border:
                    m.role === "user" ? "none" : "1px solid rgba(0,0,0,.08)",
                  padding: "9px 11px",
                  borderRadius:
                    m.role === "user"
                      ? "14px 14px 4px 14px"
                      : "14px 14px 14px 4px",
                  fontSize: 14,
                  lineHeight: 1.4,
                  whiteSpace: "pre-wrap", // 🔽 damit \n als Zeilenumbruch angezeigt werden
                  boxShadow:
                    m.role === "user"
                      ? "0 6px 14px rgba(0,0,0,.12)"
                      : "0 2px 6px rgba(0,0,0,.06)",
                }}
              >
                {m.text}
              </div>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={onSend} style={{ padding: 10, display: "flex", gap: 8 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something about contracts…"
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,.12)",
                outline: "none",
                fontSize: 14,
                background: "#fff",
                color: "#111",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid #111",
                background: "#111",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
