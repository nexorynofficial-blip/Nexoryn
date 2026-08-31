import { Router } from "express";
import multer from "multer";
import { prisma } from "../../config/database";
import { authMiddleware } from "../../middleware/auth";
import {
  deleteFromCloudinary,
  isValidImageMime,
  publicIdFromUrl,
  uploadToCloudinary,
} from "../../services/storage";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/errors";

const router = Router();
router.use(authMiddleware);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB — validated server-side, never trust the admin form's <input accept> alone
  fileFilter: (_req, file, cb) => {
    cb(null, isValidImageMime(file.mimetype));
  },
});

// GET /api/v1/admin/assets
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const after = typeof req.query.after === "string" ? req.query.after : undefined;
    const take = 20;

    const items = await prisma.asset.findMany({
      take,
      ...(after ? { skip: 1, cursor: { id: after } } : {}),
      orderBy: { uploadedAt: "desc" },
      include: { uploader: { select: { name: true } } },
    });

    res.json({ items, next: items.length === take ? items[items.length - 1]?.id : null });
  }),
);

// POST /api/v1/admin/assets — multipart/form-data: `file` + `altText`
router.post(
  "/",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest("No file provided");
    if (!isValidImageMime(req.file.mimetype)) throw ApiError.badRequest("Only image files are allowed");

    const altText = typeof req.body?.altText === "string" ? req.body.altText.trim() : "";
    if (!altText) throw ApiError.badRequest("altText is required", { altText: "Required" });

    const uploaded = await uploadToCloudinary(req.file.buffer);

    const asset = await prisma.asset.create({
      data: {
        url: uploaded.url,
        altText,
        width: uploaded.width,
        height: uploaded.height,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        uploadedBy: req.admin!.id,
      },
    });

    res.status(201).json(asset);
  }),
);

// DELETE /api/v1/admin/assets/:id
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) throw ApiError.notFound("Asset not found");

    const [projectCount, teamCount] = await Promise.all([
      prisma.project.count({ where: { photoId: id } }),
      prisma.teamMember.count({ where: { photoId: id } }),
    ]);

    if (projectCount > 0 || teamCount > 0) {
      throw ApiError.conflict("Asset is in use and cannot be deleted", {
        projects: String(projectCount),
        teamMembers: String(teamCount),
      });
    }

    const publicId = publicIdFromUrl(asset.url);
    if (publicId) await deleteFromCloudinary(publicId).catch(() => undefined);

    await prisma.asset.delete({ where: { id } });
    res.status(204).send();
  }),
);

export default router;
