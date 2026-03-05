import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { AuditReport } from "./types";
import type { SpendingBreakdown } from "./services";

const DARK = "#1A3A35";
const GREEN = "#00A651";
const MINT_BG = "#EDF5F3";

const FREQ_MAP: Record<string, { ar: string; en: string }> = {
  weekly: { ar: "اسبوعي", en: "Weekly" },
  monthly: { ar: "شهري", en: "Monthly" },
  quarterly: { ar: "ربع سنوي", en: "Quarterly" },
  yearly: { ar: "سنوي", en: "Yearly" },
};

const STATUS_MAP: Record<string, { ar: string; en: string }> = {
  cancel: { ar: "الغيه", en: "Cancel" },
  keep: { ar: "خليه", en: "Keep" },
  investigate: { ar: "مراجعة", en: "Review" },
};

export function generateReport(
  report: AuditReport,
  spending: SpendingBreakdown | null,
  locale: "ar" | "en"
): void {
  const ar = locale === "ar";
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // ── Header bar ──
  doc.setFillColor(DARK);
  doc.rect(0, 0, 210, 32, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("YallaCancel", 105, 15, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    ar ? "Subscription Report" : "Subscription Report",
    105,
    24,
    { align: "center" }
  );

  // ── Summary ──
  let y = 42;
  doc.setTextColor(DARK);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");

  const summaryLines = [
    `${ar ? "Subscriptions Found:" : "Subscriptions Found:"} ${report.subscriptions.length}`,
    `${ar ? "Monthly Total:" : "Monthly Total:"} ${report.totalMonthly.toFixed(0)} SAR`,
    `${ar ? "Yearly Total:" : "Yearly Total:"} ${report.totalYearly.toFixed(0)} SAR`,
    `${ar ? "Transactions Analyzed:" : "Transactions Analyzed:"} ${report.analyzedTransactions}`,
  ];

  if (report.potentialMonthlySavings > 0) {
    summaryLines.push(
      `${ar ? "Potential Savings:" : "Potential Savings:"} ${report.potentialYearlySavings.toFixed(0)} SAR/yr`
    );
  }

  if (report.dateRange.from && report.dateRange.to) {
    summaryLines.push(`Period: ${report.dateRange.from} — ${report.dateRange.to}`);
  }

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  for (const line of summaryLines) {
    doc.text(line, 15, y);
    y += 6;
  }

  // ── Subscriptions table ──
  y += 6;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(DARK);
  doc.text(ar ? "Subscriptions" : "Subscriptions", 15, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [
      ["#", "Name", "Amount (SAR)", "Frequency", "Yearly (SAR)", "Status"],
    ],
    body: report.subscriptions.map((sub, i) => [
      String(i + 1),
      sub.name,
      sub.amount.toFixed(2),
      FREQ_MAP[sub.frequency]?.en || sub.frequency,
      sub.yearlyEquivalent.toFixed(0),
      STATUS_MAP[sub.status]?.en || sub.status,
    ]),
    styles: {
      fontSize: 9,
      cellPadding: 2.5,
      font: "helvetica",
    },
    headStyles: {
      fillColor: DARK,
      textColor: "#FFFFFF",
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: MINT_BG,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      2: { halign: "right" },
      4: { halign: "right" },
      5: { halign: "center" },
    },
    margin: { left: 15, right: 15 },
  });

  // ── Spending breakdown ──
  if (spending && spending.categories.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lastY = (doc as any).lastAutoTable?.finalY || y + 40;
    let sy = lastY + 12;

    if (sy > 260) {
      doc.addPage();
      sy = 20;
    }

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(DARK);
    doc.text(ar ? "Spending Breakdown" : "Spending Breakdown", 15, sy);
    sy += 4;

    autoTable(doc, {
      startY: sy,
      head: [["Category", "Total (SAR)", "Monthly Avg (SAR)", "% of Total"]],
      body: spending.categories.map((cat) => [
        cat.nameEn || cat.name,
        cat.total.toFixed(0),
        cat.monthlyAvg.toFixed(0),
        `${cat.percent}%`,
      ]),
      styles: {
        fontSize: 9,
        cellPadding: 2.5,
        font: "helvetica",
      },
      headStyles: {
        fillColor: GREEN,
        textColor: "#FFFFFF",
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: MINT_BG,
      },
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "center" },
      },
      margin: { left: 15, right: 15 },
    });
  }

  // ── Footer on all pages ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor("#8AADA8");
    doc.text("yallacancel.com", 105, 290, { align: "center" });
    doc.text(`${i}/${pageCount}`, 195, 290, { align: "right" });
  }

  // ── Trigger download ──
  const date = new Date().toISOString().slice(0, 10);
  doc.save(`yallacancel-report-${date}.pdf`);
}
