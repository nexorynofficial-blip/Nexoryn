import { Router } from "express";
import { prisma } from "../../config/database";
import { checkHoneypot } from "../../middleware/honeypot";
import { contactRateLimiter } from "../../middleware/rateLimiter";
import { sendContactNotification } from "../../services/email";
import { isContactFormId, validateContactForm } from "../../services/validation";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/errors";

const router = Router();

// POST /api/v1/contact — replaces the frontend's direct client → EmailJS
// call (src/lib/sendContactEmail.js). Per docs/PRD.md FR-8: the submission
// is persisted BEFORE any email is attempted, so a lead is never lost purely
// because the notification email failed to send.
router.post(
  "/",
  contactRateLimiter,
  checkHoneypot,
  asyncHandler(async (req, res) => {
    const { formId, values } = req.body ?? {};

    if (!isContactFormId(formId)) {
      throw ApiError.badRequest("Unknown form type", { formId: "Must be question, consultation, or start" });
    }

    const validatedFields = validateContactForm(formId, values); // throws ZodError → 422 via errorHandler

    const submission = await prisma.contactSubmission.create({
      data: { formId, status: "new", fields: validatedFields },
    });

    try {
      await sendContactNotification(formId, validatedFields, submission.id);
      await prisma.contactSubmission.update({
        where: { id: submission.id },
        data: { emailedAt: new Date() },
      });
    } catch (emailError) {
      // Logged, not thrown — the submission itself already succeeded and
      // must not be lost just because the notification channel is down.
      console.error(`Email notification failed for submission ${submission.id}:`, emailError);
      await prisma.contactSubmission.update({
        where: { id: submission.id },
        data: { emailError: String(emailError) },
      });
    }

    res.status(201).json({ id: submission.id, status: "received" });
  }),
);

export default router;
