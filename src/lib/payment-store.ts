import type { AuditReport } from "./types";
import type { SpendingBreakdown } from "./services";

const KEY_RECEIPT = "yc_receipt";
const KEY_UNLOCKED = "yc_unlocked";

export function savePaymentReceipt(receiptId: string): void {
  try {
    localStorage.setItem(KEY_RECEIPT, receiptId);
    localStorage.setItem(KEY_UNLOCKED, "1");
  } catch {
    /* ignore */
  }
}

export function getPaymentReceipt(): string | null {
  try {
    return localStorage.getItem(KEY_RECEIPT);
  } catch {
    return null;
  }
}

export function isReportUnlocked(): boolean {
  try {
    return localStorage.getItem(KEY_UNLOCKED) === "1";
  } catch {
    return false;
  }
}

export function clearPaymentState(): void {
  try {
    localStorage.removeItem(KEY_RECEIPT);
    localStorage.removeItem(KEY_UNLOCKED);
  } catch {
    /* ignore */
  }
}

export function saveReportData(
  report: AuditReport,
  spending: SpendingBreakdown | null
): void {
  try {
    sessionStorage.setItem("yc_report", JSON.stringify(report));
    if (spending) {
      sessionStorage.setItem("yc_spending", JSON.stringify(spending));
    }
  } catch {
    /* ignore */
  }
}

export function getReportData(): {
  report: AuditReport | null;
  spending: SpendingBreakdown | null;
} {
  try {
    const reportStr = sessionStorage.getItem("yc_report");
    const spendingStr = sessionStorage.getItem("yc_spending");
    return {
      report: reportStr ? JSON.parse(reportStr) : null,
      spending: spendingStr ? JSON.parse(spendingStr) : null,
    };
  } catch {
    return { report: null, spending: null };
  }
}
