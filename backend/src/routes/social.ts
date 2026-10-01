import { timingSafeEqual } from "node:crypto";
import { Router, type NextFunction, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { prisma } from "../config/database";
import { env } from "../config/env";
import { authMiddleware } from "../middleware/auth";
import { PrismaRateLimitStore } from "../middleware/rateLimitStore";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/errors";

// The Social Agent is a CLI that runs on a team member's machine, so this API
// cannot launch it (it runs as Vercel functions with no access to that
// machine). The agent pushes each run's JSON to the ingest route below, and
// the admin dashboard reads the stored runs back through the admin routes.

const PLATFORM = "facebook";
const MAX_KEPT = 100;

// ── Ingest (agent → API) ────────────────────────────────────────────────

const summarySchema = z.object({
  timestamp: z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Must be an ISO timestamp"),
  status: z.enum(["healthy", "action_needed"]),
  message: z.string(),
  unanswered_comments: z.array(z.record(z.unknown())),
  low_engagement_posts: z.array(z.record(z.unknown())),
  dm_themes: z.record(z.number()),
  recommendations: z.array(z.string()),
  total_action_items: z.number().int().min(0),
});

function requireIngestToken(req: Request, _res: Response, next: NextFunction) {
  if (!env.socialIngestToken) {
    return next(new ApiError(503, "Social agent ingest is not configured"));
  }
  const header = req.headers.authorization ?? "";
  const given = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";

  const a = Buffer.from(given);
  const b = Buffer.from(env.socialIngestToken);
  // timingSafeEqual throws on unequal lengths, so that check comes first.
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return next(ApiError.unauthorized("Invalid ingest token"));
  }
  next();
}

const ingestRateLimiter = rateLimit({
  windowMs: 10 * 60_000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: new PrismaRateLimitStore("social-ingest"),
  message: { error: "Too many summaries pushed. Slow down." },
});

const router = Router();

router.post(
  "/facebook/ingest",
  ingestRateLimiter,
  requireIngestToken,
  asyncHandler(async (req, res) => {
    const parsed = summarySchema.safeParse(req.body);
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      for (const issue of parsed.error.issues) fields[issue.path.join(".") || "body"] = issue.message;
      throw ApiError.validation(fields);
    }
    const summary = parsed.data;

    const row = await prisma.socialSummary.create({
      data: {
        platform: PLATFORM,
        status: summary.status,
        totalActionItems: summary.total_action_items,
        data: req.body,
        generatedAt: new Date(summary.timestamp),
      },
    });

    // Keep only the newest MAX_KEPT runs.
    const stale = await prisma.socialSummary.findMany({
      where: { platform: PLATFORM },
      orderBy: { generatedAt: "desc" },
      skip: MAX_KEPT,
      select: { id: true },
    });
    if (stale.length) {
      await prisma.socialSummary.deleteMany({ where: { id: { in: stale.map((s) => s.id) } } });
    }

    console.info(
      `[social] stored ${PLATFORM} summary ${row.id}: ${summary.status}, ${summary.total_action_items} action items`,
    );
    res.status(201).json({ success: true, id: row.id });
  }),
);

// ── Read (dashboard → API), admin session required ──────────────────────

export const socialAdminRouter = Router();
socialAdminRouter.use(authMiddleware);

socialAdminRouter.get(
  "/facebook/summary",
  asyncHandler(async (_req, res) => {
    const latest = await prisma.socialSummary.findFirst({
      where: { platform: PLATFORM },
      orderBy: { generatedAt: "desc" },
    });

    if (!latest) {
      res.json({
        success: true,
        cached: false,
        data: null,
        message: "No summary yet. Run the Social Agent to generate one.",
      });
      return;
    }

    res.json({
      success: true,
      cached: true,
      fetched_at: latest.createdAt.toISOString(),
      data: latest.data,
    });
  }),
);

socialAdminRouter.get(
  "/facebook/history",
  asyncHandler(async (req, res) => {
    const raw = req.query.limit === undefined ? 10 : Number(req.query.limit);
    if (!Number.isInteger(raw) || raw < 1) {
      throw ApiError.badRequest("limit must be a positive whole number", { limit: "Must be 1 to 100" });
    }
    const limit = Math.min(raw, MAX_KEPT);

    const rows = await prisma.socialSummary.findMany({
      where: { platform: PLATFORM },
      orderBy: { generatedAt: "desc" },
      take: limit,
      select: { generatedAt: true, status: true, totalActionItems: true, createdAt: true },
    });

    res.json({
      success: true,
      items: rows.map((r) => ({
        timestamp: r.generatedAt.toISOString(),
        status: r.status,
        total_action_items: r.totalActionItems,
        fetched_at: r.createdAt.toISOString(),
      })),
    });
  }),
);

export default router;
