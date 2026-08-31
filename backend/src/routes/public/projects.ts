import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/database";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/errors";

const router = Router();

const listQuerySchema = z.object({
  industry: z.string().optional(),
  service: z.string().optional(),
  q: z.string().optional(),
  featured: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(6),
});

// GET /api/v1/projects
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { industry, service, q, featured, page, pageSize } = listQuerySchema.parse(req.query);

    const where: Record<string, unknown> = {};
    if (industry && industry !== "All Projects") where.industry = industry;
    if (service) where.service = service;
    if (featured) where.isFeatured = true;
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { industry: { contains: q, mode: "insensitive" } },
        { service: { contains: q, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where,
        select: {
          slug: true,
          title: true,
          industry: true,
          service: true,
          description: true,
          tags: true,
          isFeatured: true,
          featuredOrder: true,
          photo: { select: { url: true, altText: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ isFeatured: "desc" }, { featuredOrder: "asc" }, { createdAt: "desc" }],
      }),
      prisma.project.count({ where }),
    ]);

    res.json({
      items: items.map(({ photo, ...rest }) => ({ ...rest, photo: photo.url })),
      total,
      page,
      pageSize,
    });
  }),
);

// GET /api/v1/projects/:slug
router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const project = await prisma.project.findUnique({
      where: { slug: req.params.slug },
      include: { photo: true },
    });

    if (!project) throw ApiError.notFound("Project not found");

    res.json({
      slug: project.slug,
      title: project.title,
      industry: project.industry,
      service: project.service,
      description: project.description,
      tags: project.tags,
      photo: project.photo.url,
      caseStudy: project.caseStudy,
      isFeatured: project.isFeatured,
    });
  }),
);

export default router;
