// Vercel Serverless Function entry point.
//
// This is the ONLY thing that differs between "run as a persistent server"
// (src/server.ts, used by `bun run dev` and the Docker image) and "run as a
// function" (this file, used by Vercel). Both wrap the exact same
// `createApp()` Express app from src/app.ts — no route, middleware, or
// business logic is duplicated or reimplemented here.
//
// Deliberately does NOT call `.listen()`: Vercel's Node runtime invokes the
// default export directly as `(req, res) => ...` for every request. An
// Express app instance is already callable in that exact shape, so exporting
// it as-is is enough — see https://vercel.com/docs/functions/serverless-functions/runtimes/node-js#using-express.js
//
// The Prisma client (src/config/database.ts) is a module-level singleton,
// which is exactly what you want here too: a cold start creates one, and
// Vercel reuses that same warm function instance (and its one client) for
// however many requests land before the instance is recycled. This is why
// DATABASE_URL must be Neon's *pooled* connection string in production —
// see backend/README.md — a handful of warm instances each holding their
// own direct connection would otherwise exhaust Neon's connection limit
// under real traffic.
import { createApp } from "../src/app";

const app = createApp();

export default app;
