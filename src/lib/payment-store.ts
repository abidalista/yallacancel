import type { AuditReport } from "./types";
import type { SpendingBreakdown } from "./services";

const KEY_RECEIPT = "yc_receipt";
const KEY_REPORT = "yc_report";
const KEY_SPENDING = "yc_spending";

export function savePaymentReceipt(receiptId: string): void {
  try {
    localStorage.setItem(KEY_RECEIPT, receiptId);
  } catch {}
}

export function getPaymentReceipt(): string | null {
  try {
    return localStorage.getItem(KEY_RECEIPT);
  } catch {
    return null;
  }
}

export function saveReportData(
  report: AuditReport,
  spending: SpendingBreakdown | null
): void {
  try {
    sessionStorage.setItem(KEY_REPORT, JSON.stringify(report));
    if (spending) {
      sessionStorage.setItem(KEY_SPENDING, JSON.stringify(spending));
    }
  } catch {}
}

export function getReportData(): {
  report: AuditReport | null;
  spending: SpendingBreakdown | null;
} {
  try {
    const reportStr = sessionStorage.getItem(KEY_REPORT);
    const spendingStr = sessionStorage.getItem(KEY_SPENDING);
    return {
      report: reportStr ? JSON.parse(reportStr) : null,
      spending: spendingStr ? JSON.parse(spendingStr) : null,
    };
  } catch {
    return { report: null, spending: null };
  }
}

export function clearReportData(): void {
  try {
    sessionStorage.removeItem(KEY_REPORT);
    sessionStorage.removeItem(KEY_SPENDING);
  } catch {}
}
