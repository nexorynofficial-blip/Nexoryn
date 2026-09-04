import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/database";
import { authMiddleware } from "../../middleware/auth";
import { sendContactNotification } from "../../services/email";
import { isContactFormId } from "../../services/validation";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/errors";

const router = Router();
router.use(authMiddleware);

const listQuerySchema = z.object({
  status: z.enum(["new", "read", "handled"]).optional(),
  formId: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(25),
});

// GET /api/v1/admin/contact-submissions
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { status, formId, from, to, page, pageSize } = listQuerySchema.parse(req.query);

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (formId) where.formId = formId;
    if (from || to) {
      where.createdAt = { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) };
    }

    const [items, total] = await Promise.all([
      prisma.contactSubmission.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.contactSubmission.count({ where }),
    ]);

    res.json({ items, total, page, pageSize });
  }),
);

// GET /api/v1/admin/contact-submissions/export — CSV
router.get(
  "/export",
  asyncHandler(async (req, res) => {
    const { status, formId, from, to } = listQuerySchema.omit({ page: true, pageSize: true }).parse(req.query);
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (formId) where.formId = formId;
    if (from || to) where.createdAt = { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) };

    const submissions = await prisma.contactSubmission.findMany({ where, orderBy: { createdAt: "desc" } });

    const columns = ["id", "formId", "status", "createdAt", "emailedAt", "fields"];
    const csvEscape = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const rows = submissions.map((s) =>
      [s.id, s.formId, s.status, s.createdAt.toISOString(), s.emailedAt?.toISOString() ?? "", JSON.stringify(s.fields)]
        .map(csvEscape)
        .join(","),
    );
    const csv = [columns.join(","), ...rows].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="contact-submissions.csv"');
    res.send(csv);
  }),
);

// GET /api/v1/admin/contact-submissions/:id
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const submission = await prisma.contactSubmission.findUnique({ where: { id: req.params.id } });
    if (!submission) throw ApiError.notFound("Submission not found");
    res.json(submission);
  }),
);

// PATCH /api/v1/admin/contact-submissions/:id
const patchSchema = z.object({ status: z.enum(["new", "read", "handled"]) });

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const { status } = patchSchema.parse(req.body);
    const submission = await prisma.contactSubmission
      .update({ where: { id: req.params.id }, data: { status } })
      .catch(() => null);
    if (!submission) throw ApiError.notFound("Submission not found");
    res.json(submission);
  }),
);

// POST /api/v1/admin/contact-submissions/:id/resend-email
router.post(
  "/:id/resend-email",
  asyncHandler(async (req, res) => {
    const submission = await prisma.contactSubmission.findUnique({ where: { id: req.params.id } });
    if (!submission) throw ApiError.notFound("Submission not found");
    if (!isContactFormId(submission.formId)) throw ApiError.badRequest("Unrecognized form type on this submission");

    await sendContactNotification(
      submission.formId,
      submission.fields as Record<string, unknown>,
      submission.id,
    );

    const updated = await prisma.contactSubmission.update({
      where: { id: submission.id },
      data: { emailedAt: new Date(), emailError: null },
    });

    res.json(updated);
  }),
);

// DELETE /api/v1/admin/contact-submissions/:id — permanently remove spam/junk
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.contactSubmission.delete({ where: { id: req.params.id } }).catch(() => {
      throw ApiError.notFound("Submission not found");
    });
    res.status(204).end();
  }),
);

export default router;
