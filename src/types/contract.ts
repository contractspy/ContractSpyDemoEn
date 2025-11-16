export type BillingCycle = "monthly" | "yearly";

export interface Contract {
  id: string;
  title: string;
  partner: string;
  logoUrl?: string;
  category: string;
  costPerCycle: number;
  billingCycle: BillingCycle;
  startDate?: string | null;
  endDate?: string | null; // null = unbefristet
  noticePeriodDays: number; // Kündigungsfrist in Tagen
  autoRenew: boolean;
}

export interface Evaluation {
  level: "green" | "yellow" | "red";
  score: number;
  notes: string[];
}

export interface EnrichedContract extends Contract {
  evaln: Evaluation;
}
