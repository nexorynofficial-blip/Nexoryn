import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// The admin panel ships as a sub-app of the marketing site, served at
// <site>/admin. `base` makes every emitted asset URL absolute under /admin/,
// and the build lands directly in the site's dist/ so a single deploy of the
// frontend carries both. See the root README's "Admin panel" section.
export default defineConfig({
  base: "/admin/",
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "../dist/admin",
    emptyOutDir: true,
  },
  server: {
    port: 5174,
  },
});
