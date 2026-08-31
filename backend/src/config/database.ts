import { PrismaClient } from "@prisma/client";

// Single shared Prisma client instance — avoids exhausting the DB connection
// pool by creating a new client per request/module (a classic mistake with
// hot-reloading dev servers especially).
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});
