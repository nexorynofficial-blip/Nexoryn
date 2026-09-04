import { Router } from "express";
import { prisma } from "../../config/database";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

// GET /api/v1/faqs
// Feeds FaqAccordion on the public site. Only active FAQs are returned —
// deactivating one in the admin panel is how you hide it without deleting it.
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const faqs = await prisma.fAQ.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    res.json({
      items: faqs.map((f) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
        category: f.category,
      })),
    });
  }),
);

export default router;
