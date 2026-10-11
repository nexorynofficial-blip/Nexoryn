import { defineConfig } from 'vite'
// Preact (via its React-compatibility layer) instead of React: same components and hooks,
// ~10x smaller runtime. The preset also aliases react/react-dom to preact/compat for
// every dependency (router, framer-motion, gsap's React hook) and wires up dev HMR.
import preact from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'

// The admin sub-app is served with base "/cfokp/", so its dev server only
// answers on the trailing-slash form and 404s on a bare "/cfokp". Production
// hosts fix this with a rewrite rule (see the redirects in public/_redirects
// and vercel.json); this does the same locally so the URL people actually
// type works in both places.
const adminTrailingSlash = {
  name: 'admin-trailing-slash',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/cfokp') {
        res.writeHead(301, { Location: '/cfokp/' })
        res.end()
        return
      }
      next()
    })
  },
}

// The app's stylesheet no longer blocks the first paint. Everything visible
// before the app mounts (the intro plate, and the home page's intro text under
// it) is styled inline in index.html, so the browser can paint as soon as the
// HTML arrives instead of waiting ~0.5 s for the CSS on a phone. The sheet is
// still fetched at high priority (preload) and only applied once loaded
// (media="print" until then); main.jsx switches it on and holds the app's
// first render until it has loaded, so nothing ever renders unstyled.
// (A media/onload swap in the HTML would need an inline script, which the
// site's Content-Security-Policy forbids.)
const nonBlockingCss = {
  name: 'non-blocking-css',
  apply: 'build',
  transformIndexHtml: {
    order: 'post',
    handler: (html) =>
      html.replace(
        /<link rel="stylesheet" crossorigin href="([^"]+\.css)">/,
        (_m, href) =>
          `<link rel="preload" as="style" crossorigin href="${href}">\n    <link rel="stylesheet" crossorigin href="${href}" media="print" id="app-css">`,
      ),
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [preact(), tailwindcss(), adminTrailingSlash, nonBlockingCss],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // gsap/ScrollTrigger, Reveal and SplitText are needed synchronously
          // by Preloader/ScrollToTop/ScrollProgress — every route mounts them
          // before first paint, not just Home. Left to automatic chunking,
          // the bundler groups them into a chunk shared with the *lazy*
          // route chunks (since those also import Reveal/SplitText), which
          // then has to be fetched and executed before anything can paint
          // anyway, just via an extra chunk hop. Pinning it into the main
          // entry avoids that hop and keeps gsap from drifting into whatever
          // next lazy page happens to share the most code with it.
          if (
            id.includes("/node_modules/gsap/") ||
            id.includes("/node_modules/@gsap/") ||
            id.endsWith("/src/lib/gsap.js") ||
            id.endsWith("/src/components/ui/Reveal.jsx") ||
            id.endsWith("/src/components/ui/SplitText.jsx") ||
            id.endsWith("/src/lib/inView.js")
          ) {
            return "index";
          }
          return undefined;
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      // In production the admin panel is a static sub-app at <site>/cfokp
      // (admin/ builds straight into dist/cfokp). In dev it runs on its own
      // Vite server, so proxy those two prefixes to it — that way the admin
      // lives at the same /cfokp path in both, and nothing has to know
      // whether it is running locally or deployed.
      // The admin dev server runs with base "/cfokp/", so its HMR client and
      // source modules are already namespaced under this same prefix — one
      // rule covers the whole sub-app without shadowing this site's own
      // /@vite/client.
      '/cfokp': { target: 'http://localhost:5174', changeOrigin: true, ws: true },
    },
  },
})
