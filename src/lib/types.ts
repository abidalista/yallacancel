export type BankId =
  | "alrajhi"
  | "snb"
  | "riyadbank"
  | "albilad"
  | "alinma"
  | "sabb"
  | "bsf"
  | "anb"
  | "revolut"
  | "cryptocom"
  | "other";

export interface Transaction {
  date: string;
  description: string;
  /** Amount in the statement's native currency */
  amount: number;
  /** ISO currency code — defaults to SAR when omitted */
  currency?: string;
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
  /** Charge amount in native currency */
  amount: number;
  /** ISO code for amount / monthlyEquivalent / yearlyEquivalent */
  currency: string;
  frequency: SubscriptionFrequency;
  /** Native monthly cost (for display) */
  monthlyEquivalent: number;
  /** Native yearly cost (for display, JFC-style) */
  yearlyEquivalent: number;
  /** SAR monthly — sorting + headline totals */
  monthlySar: number;
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
