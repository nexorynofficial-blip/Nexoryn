import { Router } from "express";
import { prisma } from "../../config/database";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

// GET /api/v1/team — AboutPage.jsx's team grid.
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const members = await prisma.teamMember.findMany({
      include: { photo: true },
      orderBy: { order: "asc" },
    });

    res.json({
      items: members.map((m) => ({
        id: m.id,
        name: m.name,
        role: m.role,
        photo: m.photo?.url ?? null,
      })),
    });
  }),
);

export default router;
