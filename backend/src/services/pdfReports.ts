import PDFDocument from "pdfkit";
import type { FinanceDashboard } from "./financeCalculations";

export interface ReportOptions {
  year: number;
  month: number;
  data: FinanceDashboard;
  adminName: string;
}

function monthYearLabel(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

const money = (n: number) => `$${n.toFixed(2)}`;

/** Streams a PDF financial report. Pipe the returned document straight to
 * an Express response (`doc.pipe(res); doc.end();`). */
export function generateFinancialReportPdf(options: ReportOptions): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const { data } = options;

  doc.fontSize(24).font("Helvetica-Bold").text("Nexoryn Finance Report", { align: "center" });
  doc.fontSize(14).font("Helvetica").text(monthYearLabel(options.year, options.month), {
    align: "center",
  });
  doc.moveDown();

  doc.fontSize(11).font("Helvetica").text(`Generated for: ${options.adminName}`);
  doc.text(`Generated: ${new Date().toISOString()}`);
  doc.moveDown();

  doc.fontSize(14).font("Helvetica-Bold").text("Company");
  doc.fontSize(11).font("Helvetica");
  doc.text(`Total invested: ${money(data.company.totalInvested)}`);
  doc.text(`Total earned: ${money(data.company.totalEarned)}`);
  doc.text(`Personal withdrawals outstanding: ${money(data.company.totalWithdrawn - data.company.totalRepaidToCompany)}`);
  doc.text(`Cash position: ${money(data.company.cashPosition)}`);
  doc.text(`Equal share per partner: ${money(data.company.fairSharePerPartner)}`);
  doc.moveDown();

  for (const p of data.partners) {
    doc.fontSize(14).font("Helvetica-Bold").text(p.actor);
    doc.fontSize(11).font("Helvetica");
    doc.text(`Invested: ${money(p.invested)}  (equal share: ${money(p.fairShare)})`);
    doc.text(`Profit share: ${money(p.profitShare)}`);
    if (p.investmentBalance > 0) doc.text(`Over-contributed by ${money(p.investmentBalance)} — owed back`);
    else if (p.investmentBalance < 0) doc.text(`Short of their share by ${money(-p.investmentBalance)}`);
    else doc.text("Capital share: settled");
    if (p.withdrawalDebt > 0) doc.text(`Owes the company ${money(p.withdrawalDebt)} from personal withdrawals`);
    doc.font("Helvetica-Bold").text(`Net position: ${money(p.netPosition)}`);
    doc.font("Helvetica");
    doc.moveDown(0.5);
  }

  if (data.settlements.length > 0) {
    doc.moveDown(0.5);
    doc.fontSize(14).font("Helvetica-Bold").text("To settle up");
    doc.fontSize(11).font("Helvetica");
    for (const s of data.settlements) {
      doc.text(`${s.from} pays ${s.to} ${money(s.amount)}`);
    }
    doc.moveDown();
  }

  doc.fontSize(9).fillColor("#888").text("Confidential — internal financial record.", { align: "center" });

  return doc;
}

/** HTML variant, used when emailing the report instead of downloading it. */
export function generateFinancialReportHtml(options: ReportOptions): string {
  const { data } = options;
  const row = (label: string, value: string) => `
    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;">
      <span style="font-weight:600;">${label}</span><span>${value}</span>
    </div>`;

  const heading = (text: string) =>
    `<h2 style="font-size:16px;border-bottom:1px solid #ddd;padding-bottom:8px;margin-top:24px;">${text}</h2>`;

  const partnerBlock = (p: FinanceDashboard["partners"][number]) => `
    ${heading(p.actor)}
    ${row("Invested", money(p.invested))}
    ${row("Equal share", money(p.fairShare))}
    ${row("Profit share", money(p.profitShare))}
    ${
      p.investmentBalance > 0
        ? row("Over-contributed (owed back)", money(p.investmentBalance))
        : p.investmentBalance < 0
          ? row("Short of their share", money(-p.investmentBalance))
          : row("Capital share", "Settled")
    }
    ${p.withdrawalDebt > 0 ? row("Owes the company", money(p.withdrawalDebt)) : ""}
    ${row("<strong>Net position</strong>", `<strong>${money(p.netPosition)}</strong>`)}
  `;

  return `<!doctype html>
<html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#222;">
  <div style="text-align:center;border-bottom:3px solid #ff7a1a;padding-bottom:16px;margin-bottom:24px;">
    <h1 style="margin:0;color:#ff7a1a;">Nexoryn Finance Report</h1>
    <p>${monthYearLabel(options.year, options.month)}</p>
  </div>
  <p><strong>Generated for:</strong> ${options.adminName}</p>
  ${heading("Company")}
  ${row("Total invested", money(data.company.totalInvested))}
  ${row("Total earned", money(data.company.totalEarned))}
  ${row("Withdrawals outstanding", money(data.company.totalWithdrawn - data.company.totalRepaidToCompany))}
  ${row("Cash position", money(data.company.cashPosition))}
  ${row("Equal share per partner", money(data.company.fairSharePerPartner))}
  ${data.partners.map(partnerBlock).join("")}
  ${
    data.settlements.length
      ? heading("To settle up") +
        data.settlements.map((s) => row(`${s.from} pays ${s.to}`, money(s.amount))).join("")
      : heading("To settle up") + "<p style=\"color:#666;\">Everyone is square.</p>"
  }
  <p style="margin-top:32px;font-size:12px;color:#999;text-align:center;">Confidential — internal financial record.</p>
</body></html>`;
}
