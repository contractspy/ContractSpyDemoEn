import { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import ContractCard from "./components/ContractCard";
import { contracts as initialContracts } from "./data/contracts";
import { evaluateContract } from "./utils/format";
import type { EnrichedContract } from "./types/contract";
import logo from "./assets/contractspy-logo.svg";
import FloatingChat from "./components/FloatingChat";

export default function App() {
  const [query, setQuery] = useState<string>("");
  const [activeKey, setActiveKey] = useState<string>("ALLE");
  const [sortKey, setSortKey] =
    useState<"score-desc" | "cost-asc" | "cost-desc" | "term-asc" | "term-desc">("score-desc");

  // Mobile Drawer State für Sidebar
  const [mobileOpen, setMobileOpen] = useState(false);

  // Breakpoint-Detection (md = 768px)
  const [isMdUp, setIsMdUp] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.innerWidth >= 768 : true
  );
  useEffect(() => {
    const onResize = () => {
      const md = window.innerWidth >= 768;
      setIsMdUp(md);
      if (md) setMobileOpen(false); // Drawer schließen, wenn wir auf Desktop wechseln
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const categories = useMemo(() => {
    const set = new Set(initialContracts.map((c) => c.category));
    return ["ALLE", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, []);

  const filtered = useMemo<EnrichedContract[]>(() => {
    const q = query.trim().toLowerCase();
    const list = initialContracts.filter((c) => {
      const inCat = activeKey === "ALLE" ? true : c.category === activeKey;
      const inQuery = q
        ? [c.title, c.partner, c.category].some((v) =>
            String(v).toLowerCase().includes(q)
          )
        : true;
      return inCat && inQuery;
    });

    const enriched: EnrichedContract[] = list.map((c) => ({
      ...c,
      evaln: evaluateContract(c),
    }));

    switch (sortKey) {
      case "cost-asc":
        enriched.sort((a, b) => a.costPerCycle - b.costPerCycle);
        break;
      case "cost-desc":
        enriched.sort((a, b) => b.costPerCycle - a.costPerCycle);
        break;
      case "term-asc":
        enriched.sort(
          (a, b) =>
            (a.endDate
              ? new Date(a.endDate).getTime()
              : Number.POSITIVE_INFINITY) -
            (b.endDate
              ? new Date(b.endDate).getTime()
              : Number.POSITIVE_INFINITY)
        );
        break;
      case "term-desc":
        enriched.sort(
          (a, b) =>
            (b.endDate
              ? new Date(b.endDate).getTime()
              : Number.NEGATIVE_INFINITY) -
            (a.endDate
              ? new Date(a.endDate).getTime()
              : Number.NEGATIVE_INFINITY)
        );
        break;
      default:
        enriched.sort((a, b) => b.evaln.score - a.evaln.score);
    }
    return enriched;
  }, [activeKey, query, sortKey]);

  const aboutSelected = activeKey === "ABOUT";

  return (
    <div
      className="min-h-screen bg-neutral-950 text-neutral-100"
      style={{ display: "flex", flexDirection: "column" }}
    >
      {/* ===== Vollbreiter Header ===== */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px) saturate(180%)",
        }}
      >
        {/* Links: Burger (nur mobil) + Logo + Titel (nur ab md sichtbar) */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Burger-Button auf Mobile */}
          {!isMdUp && (
  <button
    aria-label="Menü öffnen"
    title="Menü"
    onClick={() => setMobileOpen(true)}
    style={{
      width: 40,
      height: 40,
      borderRadius: 12,
      border: "1px solid rgba(0,0,0,.12)",
      background: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      color: "#111",
      boxShadow: "0 1px 2px rgba(0,0,0,.06)",
      WebkitTapHighlightColor: "transparent",
      transition: "background .15s ease, transform .15s ease",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.background = "#f6f6f7")}
    onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
    onMouseDown={(e) => (e.currentTarget.style.transform = "scale(.98)")}
    onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
  >
    {/* Sauberes, zentriertes SVG mit runden Kappen */}
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M4 6h16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M4 12h16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M4 18h16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  </button>
)}


          <img
            src={logo}
            alt="ContractSpy Logo"
            width={isMdUp ? 44 : 36}
            height={isMdUp ? 44 : 36}
            style={{
              display: "block",
              borderRadius: 10,
              filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))",
            }}
          />

          {/* Schriftzug nur auf breiten Screens */}
          {isMdUp && (
            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "#0a0a0a",
                margin: 0,
              }}
            >
              ContractSpy
            </h1>
          )}
        </div>

        {/* Rechts: Suchfeld + Upload + Benutzer */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suchen…"
            style={{
              width: isMdUp ? 220 : 150,
              padding: "8px 12px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.15)",
              background: "rgba(255,255,255,0.9)",
              color: "#111",
              fontSize: 14,
              outline: "none",
              transition: "all 0.2s ease",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.border = "1px solid rgba(0,0,0,0.3)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.border = "1px solid rgba(0,0,0,0.15)")
            }
          />

          {isMdUp && (
            <button
              onClick={() => alert("Upload folgt")}
              style={{
                padding: "8px 14px",
                borderRadius: 12,
                border: "1px solid #111",
                background: "#111",
                color: "#fff",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Vertrag hochladen
            </button>
          )}

          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "linear-gradient(145deg, #111, #333)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: "0.03em",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              userSelect: "none",
              cursor: "pointer",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            title="Eingeloggt als: Max Fischer"
          >
            MF
          </div>
        </div>
      </header>

      {/* ===== Layout: Sidebar + Content ===== */}
      <div className="app-shell" style={{ flex: 1 }}>
        <Sidebar
          categories={categories}
          activeKey={activeKey}
          onSelect={setActiveKey}
          query={query}
          onQuery={setQuery}
          mobileOpen={mobileOpen}            // 👉 Drawer sichtbar auf Mobile
          onCloseMobile={() => setMobileOpen(false)} // 👉 schließen
        />

        <main className="flex-1 p-6 md:p-8">
          {!aboutSelected ? (
            <div className="max-w-7xl mx-auto">
              <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h2
                  className="text-2xl md:text-3xl font-semibold tracking-tight"
                  style={{ margin: 0 }}
                >
                  Meine Verträge{activeKey !== "ALLE" && ` · ${activeKey}`}
                </h2>
                <div className="flex items-center gap-2">
                  <select
                    value={sortKey}
                    onChange={(e) =>
                      setSortKey(e.target.value as typeof sortKey)
                    }
                    className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-700"
                  >
                    <option value="score-desc">Sortieren: Bewertung (↓)</option>
                    <option value="cost-asc">Kosten (↑)</option>
                    <option value="cost-desc">Kosten (↓)</option>
                    <option value="term-asc">Laufzeit Ende (↑)</option>
                    <option value="term-desc">Laufzeit Ende (↓)</option>
                  </select>
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="text-neutral-400 text-sm">
                  Keine Verträge gefunden. Passe Suche/Kategorie an.
                </div>
              ) : (
                <section className="grid auto-grid gap-4 md:gap-6">
                  {filtered.map((c) => (
                    <ContractCard key={c.id} contract={c} />
                  ))}
                </section>
              )}
            </div>
          ) : (
            <About />
          )}
        </main>
      </div>
      {/* ===== Layout: Sidebar + Content ===== */}
      <div className="app-shell" style={{ flex: 1 }}>
        {/* ... dein bestehendes Layout ... */}
      </div>

      {/* Floating Chat immer sichtbar */}
      <FloatingChat />

      {/* ===== Footer ===== */}
      <footer className="px-6 py-4 text-xs text-neutral-500 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span>© {new Date().getFullYear()} ContractSpy – Vertragsmanagement</span>
          <span>Build v0.1</span>
        </div>
      </footer>
    </div>
  );
}

function About() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-semibold mb-3">Über uns</h1>
      <p className="text-neutral-300 leading-relaxed mb-4">
        ContractSpy ist ein schlankes B2C-Tool, mit dem du deine Verträge sicher
        an einem Ort organisierst. Lade PDFs hoch, kategorisiere sie, filtere
        nach Kriterien und behalte Laufzeiten & Kündigungsfristen im Blick.
      </p>
      <ul className="list-disc pl-6 text-neutral-300 space-y-2">
        <li>Intelligente Bewertung (Ampel) je Vertrag: Kosten, Flexibilität, Kündigungsfenster.</li>
        <li>Minimalistische UI inspiriert von Apple/Claude: ruhig, fokussiert, performant.</li>
        <li>Lokale Suche & Sortierung, klare Karten, Logos der Anbieter.</li>
        <li>Erweiterbar: OCR/Parsing, Erinnerungen, Preisvergleich, Export.</li>
      </ul>
    </div>
  );
}
