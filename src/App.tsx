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
  const [activeKey, setActiveKey] = useState<string>("ALL");
  const [sortKey, setSortKey] =
    useState<"score-desc" | "cost-asc" | "cost-desc" | "term-asc" | "term-desc">(
      "score-desc"
    );

  // Mobile drawer state for sidebar
  const [mobileOpen, setMobileOpen] = useState(false);

  // Selected contract for simple, mocked detail view
  const [selectedContract, setSelectedContract] = useState<EnrichedContract | null>(
    null
  );

  // Breakpoint detection (md = 768px)
  const [isMdUp, setIsMdUp] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.innerWidth >= 768 : true
  );
  useEffect(() => {
    const onResize = () => {
      const md = window.innerWidth >= 768;
      setIsMdUp(md);
      if (md) setMobileOpen(false); // Close drawer when switching to desktop
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const categories = useMemo(() => {
    const set = new Set(initialContracts.map((c) => c.category));
    return ["ALL", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, []);

  const filtered = useMemo<EnrichedContract[]>(() => {
    const q = query.trim().toLowerCase();
    const list = initialContracts.filter((c) => {
      const inCat = activeKey === "ALL" ? true : c.category === activeKey;
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
  const showElectricityDetail = selectedContract?.id === "c7"; // Stromvertrag

  return (
    <div
      className="min-h-screen bg-neutral-950 text-neutral-100"
      style={{ display: "flex", flexDirection: "column" }}
    >
      {/* ===== Full-width header ===== */}
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
        {/* Left: burger (mobile only) + logo + title (md and up) */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Burger button on mobile */}
          {!isMdUp && (
            <button
              aria-label="Open menu"
              title="Menu"
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
              {/* Clean, centered SVG with round caps */}
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M4 6h16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M4 12h16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M4 18h16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
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

          {/* Wordmark on wide screens only */}
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

        {/* Right: search + upload + user */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
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
              onClick={() => alert("Upload coming soon")}
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
              Upload contract
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
            title="Logged in as: Max Fischer"
          >
            MF
          </div>
        </div>
      </header>

      {/* ===== Layout: Sidebar + Content ===== */}
      <div className="app-shell" style={{ flex: 1, display: "flex" }}>
        <Sidebar
          categories={categories}
          activeKey={activeKey}
          onSelect={(key) => {
            setActiveKey(key);
            setSelectedContract(null); // reset detail view when changing section
          }}
          query={query}
          onQuery={setQuery}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        <main className="flex-1 p-6 md:p-8">
          {!aboutSelected ? (
            showElectricityDetail ? (
              <ElectricityDetail onBack={() => setSelectedContract(null)} />
            ) : (
              <div className="max-w-7xl mx-auto">
                <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <h2
                    className="text-2xl md:text-3xl font-semibold tracking-tight"
                    style={{ margin: 0 }}
                  >
                    My contracts{activeKey !== "ALL" && ` · ${activeKey}`}
                  </h2>
                  <div className="flex items-center gap-2">
                    <select
                      value={sortKey}
                      onChange={(e) =>
                        setSortKey(e.target.value as typeof sortKey)
                      }
                      className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-700"
                    >
                      <option value="score-desc">Sort: Rating (↓)</option>
                      <option value="cost-asc">Cost (↑)</option>
                      <option value="cost-desc">Cost (↓)</option>
                      <option value="term-asc">Term end (↑)</option>
                      <option value="term-desc">Term end (↓)</option>
                    </select>
                  </div>
                </div>

                {filtered.length === 0 ? (
                  <div className="text-neutral-400 text-sm">
                    No contracts found. Adjust search/category.
                  </div>
                ) : (
                  <section className="grid auto-grid gap-4 md:gap-6">
                    {filtered.map((c) => (
                      <ContractCard
                        key={c.id}
                        contract={c}
                        onSelect={(contract) => {
                          // Only show detail page for the electricity contract
                          if (contract.id === "c7") {
                            setSelectedContract(contract);
                          }
                        }}
                      />
                    ))}
                  </section>
                )}
              </div>
            )
          ) : (
            <About />
          )}
        </main>
      </div>

      {/* Floating chat always visible */}
      <FloatingChat />

      {/* ===== Footer ===== */}
     <footer className="px-6 py-4 text-xs text-neutral-500 border-t border-neutral-900 w-full text-center">
      <div>
        {new Date().getFullYear()} ContractSpy – Contract management – University Project Demo
      </div>
      <div>Build v0.1</div>
    </footer>

    </div>
  );
}

function About() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-semibold mb-3">About us</h1>
      <p className="text-neutral-300 leading-relaxed mb-4">
        ContractSpy is a lean B2C tool that lets you securely organize your contracts
        in one place. Upload PDFs, categorize them, filter by criteria, and keep an eye
        on terms &amp; cancellation periods.
      </p>
      <ul className="list-disc pl-6 text-neutral-300 space-y-2">
        <li>
          Smart per-contract rating (traffic light): cost, flexibility, cancellation
          window.
        </li>
        <li>Local search &amp; sorting, clean cards, provider logos.</li>
        <li>Extensible: OCR/parsing, reminders, price comparison, export.</li>
      </ul>
    </div>
  );
}

/** ===== Mocked detail view for the electricity contract (c7) ===== */

function ElectricityDetail({ onBack }: { onBack: () => void }) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-xs rounded-full border border-neutral-300/60 dark:border-neutral-700/80 px-3 py-1 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors"
      >
        <span className="text-sm">←</span>
        Back to all contracts
      </button>

      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Green Electricity Home 12 – Contract Overview
        </h1>
        <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-2xl">
          This page provides a detailed analysis of the Green Electricity Home 12
          contract. It summarises the central economic conditions and highlights
          contract clauses that offer protection as well as clauses that may create
          obligations or risks.
        </p>
      </header>

      {/* Key facts */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Key facts</h2>
        <ul className="list-disc pl-5 text-sm text-neutral-700 dark:text-neutral-300 space-y-1.5">
          <li>Green electricity tariff with a 12-month price guarantee on the base price.</li>
          <li>Initial contract term of 12 months with automatic 12-month renewal.</li>
          <li>Written cancellation required at least 60 days before the end of the term.</li>
          <li>
            Governmental price components (taxes, levies, grid fees) may be adjusted
            during the term and can increase the total bill.
          </li>
        </ul>
      </section>

      {/* Positive clauses – quoted text + Bewertung */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
          Positive clauses
        </h2>

        <div className="space-y-3 text-sm">
          <div className="border-l-4 border-emerald-500/80 pl-4 py-2 rounded-sm bg-emerald-50/60 dark:bg-transparent">
            <p className="text-neutral-800 dark:text-emerald-100">
              “The supplier guarantees a fixed energy price for the initial twelve (12)
             -month contract period. During this period, the agreed base price per
              kilowatt hour and the basic monthly fee shall not be increased.”
            </p>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-300 ml-1">
            ➜ The contract contains a clear price guarantee for the first year. Your
            base price and fixed monthly fee remain stable, which makes budgeting
            easier and protects you against short-term price spikes on the market.
          </p>

          <div className="border-l-4 border-emerald-500/80 pl-4 py-2 rounded-sm bg-emerald-50/60 dark:bg-transparent">
            <p className="text-neutral-800 dark:text-emerald-100">
              “The electricity supplied under this tariff originates 100% from
              certified renewable energy sources. The supplier undertakes to purchase
              electricity exclusively from plants that meet the applicable
              certification standards.”
            </p>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-300 ml-1">
            ➜ The contract explicitly commits to certified green electricity. This is
            positive if environmental aspects are important to you and reduces the risk
            of misleading ‘green’ marketing wording.
          </p>
        </div>
      </section>

      {/* Critical clauses – quoted text + Bewertung */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
          Critical clauses
        </h2>

        <div className="space-y-3 text-sm">
          <div className="border-l-4 border-red-500/80 pl-4 py-2 rounded-sm bg-red-50/70 dark:bg-transparent">
            <p className="text-neutral-800 dark:text-red-100">
              “The contract shall be automatically renewed for an additional twelve
              (12)-month period if it is not terminated in writing by either party no
              later than sixty (60) days before the end of the current contract term.”
            </p>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-300 ml-1">
            ⚠️ The automatic 12-month renewal combined with a 60-day notice period
            creates a long binding period. If you miss the deadline, you are tied to
            the tariff for another full year, even if more favourable offers become
            available.
          </p>

          <div className="border-l-4 border-red-500/80 pl-4 py-2 rounded-sm bg-red-50/70 dark:bg-transparent">
            <p className="text-neutral-800 dark:text-red-100">
              “Price components beyond the supplier&apos;s control, in particular taxes,
              levies, surcharges and grid fees, may be adjusted at any time to the
              extent that the underlying legal basis changes. Such adjustments shall
              entitle the supplier to increase the total price accordingly.”
            </p>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-300 ml-1">
            ⚠️ Although the base price is guaranteed, the total amount you pay can
            still rise if taxes or levies go up. The clause is common but clearly
            shifts the risk of regulatory increases to you as the customer.
          </p>

          <div className="border-l-4 border-red-500/80 pl-4 py-2 rounded-sm bg-red-50/70 dark:bg-transparent">
            <p className="text-neutral-800 dark:text-red-100">
              “The supplier is entitled to transfer this contract, including all rights
              and obligations, to another energy provider as part of a portfolio or
              business transfer, provided that the contractual conditions are not
              materially worsened for the customer.”
            </p>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-300 ml-1">
            ⚠️ Your contractual partner may change without you actively agreeing to a
            new contract. Even if conditions must not be ‘materially’ worsened, the
            term leaves room for interpretation and you should monitor any changes in
            service quality or communication.
          </p>
        </div>
      </section>

      {/* Unterstützende Einordnung */}
      <section>
        <h2 className="text-lg font-semibold mb-2">
          Overall assessment and recommendations
        </h2>
        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed mb-2">
          The tariff combines a solid introductory price guarantee and certified green
          electricity with comparatively strict renewal conditions. Financially, the
          first contract year is predictable, but the long notice period and
          automatic renewal mean you should actively calendar the cancellation date if
          you want to keep flexibility.
        </p>
        <ul className="list-disc pl-5 text-sm text-neutral-700 dark:text-neutral-300 space-y-1.5">
          <li>
            Make a note of the latest possible cancellation date (60 days before the
            end of the 12-month term) and check available market offers shortly before
            that.
          </li>
          <li>
            If your consumption or living situation is likely to change in the near
            future, consider whether the long renewal period fits your planning.
          </li>
          <li>
            Keep an eye on communications about changes to taxes and levies, as these
            may increase your total price despite the base price guarantee.
          </li>
        </ul>
      </section>
    </div>
  );
}



