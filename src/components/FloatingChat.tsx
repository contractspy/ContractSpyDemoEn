import { useState } from "react";

export default function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "bot"; text: string }[]
  >([
    {
      role: "bot",
      text: "Hi! Stell mir gern Fragen zu deinen Verträgen. (Feature in Arbeit)",
    },
  ]);

  const onSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    // Nutzer-Nachricht
    setMessages((m) => [...m, { role: "user", text }]);
    // Platzhalter-Antwort
    setMessages((m) => [
      ...m,
      {
        role: "bot",
        text:
          "Danke für deine Frage – die Chat-Funktion ist momentan noch in Entwicklung.",
      },
    ]);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        aria-label="Chat öffnen"
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          right: 20,
          bottom: 20,
          width: 56,
          height: 56,
          borderRadius: 999,
          border: "none",
          background:
            "linear-gradient(145deg, #111 0%, #333 60%, #111 100%)",
          color: "#fff",
          boxShadow: "0 10px 24px rgba(0,0,0,.18)",
          cursor: "pointer",
          zIndex: 60,
          display: open ? "none" : "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Chat-Icon (sauberes SVG) */}
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
            right: 20,
            bottom: 20,
            width: 340,
            height: 440,
            background: "rgba(255,255,255,0.95)",
            border: "1px solid rgba(0,0,0,.08)",
            borderRadius: 16,
            boxShadow: "0 24px 48px rgba(0,0,0,.18)",
            backdropFilter: "blur(8px) saturate(180%)",
            display: "flex",
            flexDirection: "column",
            zIndex: 60,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "10px 12px",
              borderBottom: "1px solid rgba(0,0,0,.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ fontWeight: 600 }}>ContractSpy Chat</div>
            <button
              aria-label="Chat schließen"
              onClick={() => setOpen(false)}
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                border: "1px solid rgba(0,0,0,.12)",
                background: "#fff",
                cursor: "pointer",
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
                  maxWidth: "85%",
                  background:
                    m.role === "user"
                      ? "#111"
                      : "linear-gradient(180deg, #fff, #f7f7f8)",
                  color: m.role === "user" ? "#fff" : "#111",
                  border:
                    m.role === "user" ? "none" : "1px solid rgba(0,0,0,.08)",
                  padding: "8px 10px",
                  borderRadius:
                    m.role === "user"
                      ? "12px 12px 4px 12px"
                      : "12px 12px 12px 4px",
                  fontSize: 14,
                  lineHeight: 1.35,
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
              placeholder="Frag etwas zu Verträgen…"
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
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid #111",
                background: "#111",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Senden
            </button>
          </form>
        </div>
      )}
    </>
  );
}
