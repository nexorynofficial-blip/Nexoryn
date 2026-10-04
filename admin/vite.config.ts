import { defineConfig, type PluginOption } from "vite";
import tailwindcss from "@tailwindcss/vite";

// @vitejs/plugin-react only adds dev-time Fast Refresh; the JSX transform itself
// comes from tsconfig ("jsx": "react-jsx"). It lives in admin/node_modules for local
// development, but the production build runs from the root project's dependencies,
// and the root site now runs on Preact and no longer installs that plugin. So load
// it when it is available and build without it when it isn't.
const reactPlugins: PluginOption[] = [];
try {
  reactPlugins.push((await import("@vitejs/plugin-react")).default());
} catch {
  /* production build: plugin not installed, which is fine */
}

// The admin panel ships as a sub-app of the marketing site, served at
// <site>/cfokp — an unadvertised path rather than /admin, so the panel isn't
// obviously discoverable by URL guessing (not a substitute for real auth,
// which is what actually protects it — see backend/src/middleware/auth.ts).
// `base` makes every emitted asset URL absolute under /cfokp/, and the build
// lands directly in the site's dist/ so a single deploy of the frontend
// carries both. See the root README's "Admin panel" section.
export default defineConfig({
  base: "/cfokp/",
  plugins: [...reactPlugins, tailwindcss()],
  build: {
    outDir: "../dist/cfokp",
    emptyOutDir: true,
  },
  server: {
    port: 5174,
  },
});
