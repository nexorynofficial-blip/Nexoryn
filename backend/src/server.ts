import { createApp } from "./app";
import { prisma } from "./config/database";
import { env } from "./config/env";

async function startServer() {
  try {
    await prisma.$connect();
    console.log("Database connected");

    const app = createApp();
    app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
      console.log(`API base: http://localhost:${env.port}/api/v1`);
      console.log(`Health check: http://localhost:${env.port}/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  console.log("\nShutting down...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
