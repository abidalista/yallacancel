export type BankId =
  | "alrajhi"
  | "snb"
  | "riyadbank"
  | "albilad"
  | "alinma"
  | "sabb"
  | "bsf"
  | "anb"
  | "other";

export interface Transaction {
  date: string;
  description: string;
  amount: number;
  category?: string;
  reference?: string;
}

export type SubscriptionStatus = "cancel" | "keep" | "investigate";
export type SubscriptionConfidence = "confirmed" | "suspicious";

export type SubscriptionFrequency =
  | "weekly"
  | "monthly"
  | "quarterly"
  | "yearly";

export interface Subscription {
  id: string;
  name: string;
  normalizedName: string;
  amount: number;
  frequency: SubscriptionFrequency;
  monthlyEquivalent: number;
  yearlyEquivalent: number;
  occurrences: number;
  lastCharge: string;
  firstCharge: string;
  status: SubscriptionStatus;
  confidence: SubscriptionConfidence;
  aiDescription?: string;
  rawDescription?: string;
  transactions: Transaction[];
  userConfirmed?: boolean;
}

export interface AuditReport {
  subscriptions: Subscription[];
  totalMonthly: number;
  totalYearly: number;
  potentialMonthlySavings: number;
  potentialYearlySavings: number;
  analyzedTransactions: number;
  dateRange: { from: string; to: string };
}
