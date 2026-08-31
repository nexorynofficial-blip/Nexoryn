import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The admin sub-app is served with base "/admin/", so its dev server only
// answers on the trailing-slash form and 404s on a bare "/admin". Production
// hosts fix this with a rewrite rule (see the redirects in public/_redirects
// and vercel.json); this does the same locally so the URL people actually
// type works in both places.
const adminTrailingSlash = {
  name: 'admin-trailing-slash',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/admin') {
        res.writeHead(301, { Location: '/admin/' })
        res.end()
        return
      }
      next()
    })
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), adminTrailingSlash],
  server: {
    port: 5173,
    proxy: {
      // In production the admin panel is a static sub-app at <site>/admin
      // (admin/ builds straight into dist/admin). In dev it runs on its own
      // Vite server, so proxy those two prefixes to it — that way the admin
      // lives at the same /admin path in both, and nothing has to know
      // whether it is running locally or deployed.
      // The admin dev server runs with base "/admin/", so its HMR client and
      // source modules are already namespaced under this same prefix — one
      // rule covers the whole sub-app without shadowing this site's own
      // /@vite/client.
      '/admin': { target: 'http://localhost:5174', changeOrigin: true, ws: true },
    },
  },
})
