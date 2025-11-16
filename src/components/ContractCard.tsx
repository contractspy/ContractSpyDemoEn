import { CalendarClock, BadgeEuro, Hourglass, ShieldCheck } from "lucide-react";
import { formatCurrency, monthsBetween } from "../utils/format";
import type { EnrichedContract } from "../types/contract";

interface Props { contract: EnrichedContract; }
type Level = "green" | "yellow" | "red";

export default function ContractCard({ contract }: Props) {
  const {
    title, partner, logoUrl, costPerCycle, billingCycle,
    startDate, endDate, noticePeriodDays, autoRenew, evaln,
  } = contract;

  const cycleLabel = billingCycle === "monthly" ? "monatlich" : billingCycle === "yearly" ? "jährlich" : billingCycle;
  const runtimeMonths = monthsBetween(startDate ?? undefined, endDate ?? undefined);
  const label = evaln.level === "green" ? "Gut" : evaln.level === "yellow" ? "Okay" : "Achtung";

  return (
    <article className="card rounded-2xl border border-neutral-900 bg-neutral-900/40 backdrop-blur">
      {/* Header */}
      <header className="card-header">
        <Logo url={logoUrl} name={partner} />
        <div className="header-title">
          <h3 className="font-semibold">{title}</h3>
          <div className="sub text-xs text-neutral-400">{partner}</div>
        </div>
        <div className="header-right">
          <span className="traffic" aria-label={`Bewertung: ${evaln.level}`}>
            <span className={`dot ${evaln.level === "red" ? "on-red" : ""}`} />
            <span className={`dot ${evaln.level === "yellow" ? "on-yellow" : ""}`} />
            <span className={`dot ${evaln.level === "green" ? "on-green" : ""}`} />
          </span>
          <span className={`chip ${chipClass(evaln.level)}`}>{label}</span>
        </div>
      </header>

      {/* Meta-Liste */}
      <ul className="meta text-sm text-neutral-300">
        <li>
          <span className="icon"><BadgeEuro className="size-4 text-neutral-400" /></span>
          <span className="content tabular-nums">{formatCurrency(costPerCycle)} · {cycleLabel}</span>
        </li>
        <li>
          <span className="icon"><CalendarClock className="size-4 text-neutral-400" /></span>
          <span className="content">
            {startDate ? new Date(startDate).toLocaleDateString() : "–"} – {endDate ? new Date(endDate).toLocaleDateString() : "unbefristet"}
            {runtimeMonths ? <span className="text-neutral-500"> · {runtimeMonths} Mon.</span> : null}
          </span>
        </li>
        <li>
          <span className="icon"><Hourglass className="size-4 text-neutral-400" /></span>
          <span className="content">
            Kündigungsfrist: {noticePeriodDays} Tage{autoRenew ? " · Verlängert sich automatisch" : ""}
          </span>
        </li>

        {/* Notizen (einheitlich ausgerichtet) */}
        {evaln.notes?.length ? (
          <li className="notes">
            <span className="icon"><ShieldCheck className="size-4 text-neutral-400" /></span>
            <ul className="note-list">
              {evaln.notes.map((n, i) => (
                <li className={isNegative(n) ? "note-warn" : "note-good"} key={i}>{n}</li>
              ))}
            </ul>
          </li>
        ) : null}
      </ul>
    </article>
  );
}

function chipClass(level: Level) {
  if (level === "green") return "chip-green";
  if (level === "yellow") return "chip-yellow";
  return "chip-red";
}

function isNegative(text: string): boolean {
  const t = text.toLowerCase();
  return /(lange|automatische|prüfen|lang)/.test(t);
}

function Logo({ url, name }: { url?: string; name: string }) {
  if (url) {
    return (
      <div className="logo-box">
        <img src={url} alt={name} className="logo-img" />
      </div>
    );
  }
  const initials = (name?.split(" ").map(p => p[0]).slice(0, 2).join("") || "?").toUpperCase();
  return <div className="logo-box initials">{initials}</div>;
}
