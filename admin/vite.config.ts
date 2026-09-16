import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// The admin panel ships as a sub-app of the marketing site, served at
// <site>/cfokp — an unadvertised path rather than /admin, so the panel isn't
// obviously discoverable by URL guessing (not a substitute for real auth,
// which is what actually protects it — see backend/src/middleware/auth.ts).
// `base` makes every emitted asset URL absolute under /cfokp/, and the build
// lands directly in the site's dist/ so a single deploy of the frontend
// carries both. See the root README's "Admin panel" section.
export default defineConfig({
  base: "/cfokp/",
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "../dist/cfokp",
    emptyOutDir: true,
  },
  server: {
    port: 5174,
  },
});
