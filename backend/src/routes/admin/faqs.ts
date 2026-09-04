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
    // createdAt breaks ties so rows sharing an order (anything created before
    // inserts started renumbering) still list in a stable, predictable order.
    const items = await prisma.fAQ.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] });
    res.json({ items });
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = faqSchema.parse(req.body);

    // Inserting at a position has to push everything from that position down,
    // or the new row just ties with whatever already sits there and the list
    // order becomes arbitrary. Done in one transaction so a failure can't
    // leave the list renumbered but missing its new entry.
    const faq = await prisma.$transaction(async (tx) => {
      await tx.fAQ.updateMany({
        where: { order: { gte: input.order } },
        data: { order: { increment: 1 } },
      });
      return tx.fAQ.create({ data: input });
    });

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
