import type { AuditReport } from "./types";
import type { SpendingBreakdown } from "./services";

export type ScanEngine = "local" | "claude";

let pendingFiles: File[] = [];
let teaserReport: AuditReport | null = null;
let teaserSpending: SpendingBreakdown | null = null;
let failedFileNames: string[] = [];
let totalFileCount = 0;
let scanEngine: ScanEngine = "local";

export function storeScanSession(
  files: File[],
  report: AuditReport,
  spending: SpendingBreakdown | null,
  failed: string[] = [],
  engine: ScanEngine = "local"
): void {
  pendingFiles = files;
  teaserReport = report;
  teaserSpending = spending;
  failedFileNames = failed;
  totalFileCount = files.length;
  scanEngine = engine;
}

export function getScanEngine(): ScanEngine {
  return scanEngine;
}

export function isClaudeScan(): boolean {
  return scanEngine === "claude";
}

export function getPendingScanFiles(): File[] {
  return pendingFiles;
}

export function getTeaserReport(): AuditReport | null {
  return teaserReport;
}

export function getTeaserSpending(): SpendingBreakdown | null {
  return teaserSpending;
}

export function getFailedFileNames(): string[] {
  return failedFileNames;
}

export function getTotalFileCount(): number {
  return totalFileCount;
}

export function clearScanSession(): void {
  pendingFiles = [];
  teaserReport = null;
  teaserSpending = null;
  failedFileNames = [];
  totalFileCount = 0;
  scanEngine = "local";
}
