import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express, type Request, type Response } from "express";
import helmet from "helmet";
import { allowedOrigins } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { globalRateLimiter } from "./middleware/rateLimiter";

import publicProjects from "./routes/public/projects";
import publicServices from "./routes/public/services";
import publicReviews from "./routes/public/reviews";
import publicTeam from "./routes/public/team";
import publicContact from "./routes/public/contact";

import adminAuth from "./routes/admin/auth";
import adminAdmins from "./routes/admin/admins";
import adminProjects from "./routes/admin/projects";
import adminServices, { subServiceRouter } from "./routes/admin/services";
import adminReviews from "./routes/admin/reviews";
import adminTeam from "./routes/admin/team";
import adminFaqs from "./routes/admin/faqs";
import adminContact from "./routes/admin/contact";
import adminAssets from "./routes/admin/assets";
import adminFinance from "./routes/admin/finance";
import adminInternalProjects from "./routes/admin/internal-projects";
import adminReports from "./routes/admin/reports";

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: allowedOrigins(),
      credentials: true, // required for the httpOnly admin session cookie to be sent cross-origin
    }),
  );
  app.use(globalRateLimiter);
  app.use(cookieParser());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ── Public (no auth) ────────────────────────────────────────────────
  app.use("/api/v1/projects", publicProjects);
  app.use("/api/v1/services", publicServices);
  app.use("/api/v1/reviews", publicReviews);
  app.use("/api/v1/team", publicTeam);
  app.use("/api/v1/contact", publicContact);

  // ── Admin (auth required — enforced inside each router) ────────────
  app.use("/api/v1/admin/auth", adminAuth);
  app.use("/api/v1/admin/admins", adminAdmins);
  app.use("/api/v1/admin/projects", adminProjects);
  app.use("/api/v1/admin/services", adminServices);
  app.use("/api/v1/admin/sub-services", subServiceRouter);
  app.use("/api/v1/admin/reviews", adminReviews);
  app.use("/api/v1/admin/team", adminTeam);
  app.use("/api/v1/admin/faqs", adminFaqs);
  app.use("/api/v1/admin/contact-submissions", adminContact);
  app.use("/api/v1/admin/assets", adminAssets);
  app.use("/api/v1/admin/finance", adminFinance);
  app.use("/api/v1/admin/internal-projects", adminInternalProjects);
  app.use("/api/v1/admin/reports", adminReports);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: "Route not found" });
  });

  // Must be registered last.
  app.use(errorHandler);

  return app;
}
