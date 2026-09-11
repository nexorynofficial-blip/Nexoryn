// Single source of truth for how a money amount is displayed anywhere in the
// admin panel — Finance dashboard, Requests, and (mirrored server-side) the
// PDF/email finance reports in backend/src/services/pdfReports.ts. Change the
// currency in exactly one place if that's ever needed again.
export const formatCurrency = (n: number): string =>
  n.toLocaleString("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
