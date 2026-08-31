import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/database";
import { authMiddleware } from "../../middleware/auth";
import { calculateFinanceDashboard } from "../../services/financeCalculations";
import { sendFinanceReportEmail } from "../../services/email";
import { generateFinancialReportHtml, generateFinancialReportPdf } from "../../services/pdfReports";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/errors";

const router = Router();
router.use(authMiddleware);

const periodSchema = z.object({
  year: z.coerce.number().int().min(2020).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});

// GET /api/v1/admin/reports/download/:year/:month
router.get(
  "/download/:year/:month",
  asyncHandler(async (req, res) => {
    const { year, month } = periodSchema.parse(req.params);
    const admin = await prisma.adminUser.findUnique({ where: { id: req.admin!.id } });
    if (!admin) throw ApiError.notFound("Admin not found");
    const data = await calculateFinanceDashboard(req.admin!.id);

    const doc = generateFinancialReportPdf({ year, month, data, adminName: admin.name });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="nexoryn-report-${year}-${month}.pdf"`);
    doc.pipe(res);
    doc.end();
  }),
);

// POST /api/v1/admin/reports/email
router.post(
  "/email",
  asyncHandler(async (req, res) => {
    const { year, month } = periodSchema.parse(req.body);

    const admin = await prisma.adminUser.findUnique({ where: { id: req.admin!.id } });
    if (!admin) throw ApiError.notFound("Admin not found");

    const data = await calculateFinanceDashboard(req.admin!.id);
    const html = generateFinancialReportHtml({ year, month, data, adminName: admin.name });
    const period = `${year}-${String(month).padStart(2, "0")}`;

    await sendFinanceReportEmail(admin.email, html, period);

    res.json({ status: "sent", to: admin.email, period });
  }),
);

export default router;
