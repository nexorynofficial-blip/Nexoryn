import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/database";
import { authMiddleware } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/errors";

const router = Router();
router.use(authMiddleware);

const faqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  category: z.string().default("general"),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const items = await prisma.fAQ.findMany({ orderBy: { order: "asc" } });
    res.json({ items });
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = faqSchema.parse(req.body);
    const faq = await prisma.fAQ.create({ data: input });
    res.status(201).json(faq);
  }),
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const input = faqSchema.partial().parse(req.body);
    const faq = await prisma.fAQ.update({ where: { id: req.params.id }, data: input }).catch(() => null);
    if (!faq) throw ApiError.notFound("FAQ not found");
    res.json(faq);
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.fAQ.delete({ where: { id: req.params.id } }).catch(() => {
      throw ApiError.notFound("FAQ not found");
    });
    res.status(204).send();
  }),
);

export default router;
