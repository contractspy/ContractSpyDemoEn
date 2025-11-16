import type { Contract, Evaluation } from "../types/contract";

export function formatCurrency(n: number): string {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" }).format(n);
  } catch {
    return `${n} €`;
  }
}

export function monthsBetween(start?: string | null, end?: string | null): number | null {
  if (!start || !end) return null;
  const s = new Date(start);
  const e = new Date(end);
  let months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  if (e.getDate() >= s.getDate()) months += 1; // rough rounding
  return Math.max(0, months);
}

// simple heuristic for evaluation (traffic light)
export function evaluateContract(c: Contract): Evaluation {
  const notes: string[] = [];
  let score = 0;

  // cancellation period
  if (c.noticePeriodDays <= 30) { 
    score += 3; 
    notes.push("Short cancellation period"); 
  }
  else if (c.noticePeriodDays <= 90) { 
    score += 1; 
  }
  else { 
    score -= 2; 
    notes.push("Long cancellation period"); 
  }

  // term & renewal
  if (!c.endDate) { 
    score += 1; 
    notes.push("No fixed minimum term"); 
  } else {
    const months = monthsBetween(c.startDate, c.endDate) ?? 0;
    if (months <= 12) { 
      score += 1; 
    } else { 
      score -= 1; 
      notes.push("Long minimum term"); 
    }
  }

  if (c.autoRenew) { 
    score -= 1; 
    notes.push("Automatic renewal"); 
  }

  // cost (rough)
  if (c.billingCycle === "monthly" && c.costPerCycle <= 15) score += 1;
  if (c.billingCycle === "yearly" && c.costPerCycle <= 120) score += 1;

  // cancellation window soon?
  const now = new Date();
  if (c.endDate) {
    const end = new Date(c.endDate);
    const msToEnd = end.getTime() - now.getTime();
    const msNotice = (c.noticePeriodDays || 0) * 24 * 3600 * 1000;

    if (msToEnd > 0 && msToEnd <= msNotice + 14 * 24 * 3600 * 1000) {
      score -= 2;
      notes.push("Cancellation window approaching – review recommended");
    }
  }

  const level: Evaluation["level"] =
    score >= 3 ? "green" : score >= 1 ? "yellow" : "red";

  return { level, score, notes };
}
