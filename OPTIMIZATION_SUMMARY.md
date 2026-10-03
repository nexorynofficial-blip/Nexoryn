# Performance optimization summary

Starting point: PageSpeed 28 (mobile) / 39 (desktop), Total Blocking Time 21.9 s.

These changes were measured locally with Chrome (4x CPU slowdown and slow-4G for the "mobile"
rows, no throttling for "desktop") against a production build. That is **not** the same as a
PageSpeed Insights run, so treat the numbers as directional. Run PageSpeed on the deployed site
to get the real scores.

## What was slowing the site down

1. **One 1.4 MB JavaScript file** containing every page, plus all of three.js (the 3D library),
   parsed and run before anything painted.
2. **35 MB of PNG images** in `src/assets` (some 6 MB each, 3840 px wide, shown at ~600 px).
   Home page transferred ~10 MB.
3. **Dozens of GSAP animations all set up at page load.** Each one made the browser recalculate
   layout, which is the bulk of the main-thread time on a slow phone.
4. **A 120-card testimonial marquee** (20 reviews x 6 copies, each with a blurred glass
   background) that made up ~60% of the page's DOM.
5. A render-blocking Google Fonts request for 6 families (2 unused), the analytics script loading
   during startup, and a 2.5 MB hero video that downloaded even on phones where it is hidden.

## Changes

| Area | File(s) | Change |
|---|---|---|
| Code splitting | `src/App.jsx` | Every page except Home is lazy-loaded. Main bundle 1,385 KB -> ~590 KB (416 -> ~189 KB gzip). |
| 3D background | `src/components/SiteBackground.jsx` | The ColorBends shader (and three.js, 521 KB) loads after the browser is idle instead of blocking startup. Page paints on the black base first. |
| Images | `src/assets/*`, imports in `src/data/projects.js`, `Hero`, `Navbar`, `Footer`, `CTASection`, `AboutPage` | 33 images converted PNG/JPEG -> WebP and capped at display-appropriate sizes: 35 MB -> ~2 MB. |
| Image compatibility | `src/lib/assetUrl.js` | The database stores paths like `src/assets/foo.png`. These now also resolve to the new `.webp` file, so existing project data keeps working. |
| Animations | `src/components/ui/Reveal.jsx`, `SplitText.jsx`, `src/lib/inView.js`, `src/index.css` | Scroll reveals no longer build a GSAP tween at page load. Content is hidden with CSS, and each animation starts only when it nears the screen (IntersectionObserver). Also removed `will-change` from every split word. |
| Reviews marquee | `src/components/TestimonialsSection.jsx` | Copies are sized from the review count (min 2) instead of a fixed 6. Same look and speed, 120 -> 40 cards. |
| Hero video | `src/components/Hero.jsx` | The video element is only mounted at desktop widths, so phones no longer download 2.5 MB. |
| Fonts | `index.html`, `public/load-fonts.js` | Dropped two unused families (Anton, Unbounded). The stylesheet no longer blocks first paint. |
| Analytics | `public/gtag-init.js`, `index.html` | gtag.js loads after the page has loaded and is idle. Events fired earlier are queued, not lost. |
| Caching | `vercel.json` | Added long-lived cache headers for `/cfokp/assets/*` (admin), `/fonts/*` and the hero video. `/assets/*` was already immutable. |
| Monitoring | `public/perf-monitor.js`, `index.html` | Logs LCP, CLS, INP, long tasks (>50 ms) and running TBT to the console. Off by default; open any page with `?perf=1` to enable (`?perf=0` to disable). |
| Cleanup | see below | Removed unused components, images and stray files. |

### Files removed (all verified unreferenced)

- Unused components: `Logo.jsx`, `TechNetworkOverlay.jsx`, `WorkflowWidget.jsx`,
  `three/AmbientScene.jsx`, `ui/Avatar.jsx`, `ui/CircularGallery.jsx`, `ui/CustomCursor.jsx`,
  `ui/ScrollFadeHeading.jsx`, `ui/StickyCardStack.jsx`
- Unused images: `src/assets/contact-photo.webp`, `public/services/*.jpg`
- Stray files: four `UsersHPAppDataLocalTempclaude*.png` screenshots and `site-dev.log` in the project root
- The original PNG/JPEG versions of the converted images (still in git history)

Left alone on purpose: the `Automation Project*` / `Web development*` folders, the team-photo PNGs
and logo source files in the project root, `docs/`, `Agent Documents/`. These are your source
material, not part of the build. Remove them yourself if they are not needed.

## Measured results (local, directional)

| | Before | After |
|---|---|---|
| Main JS bundle | 1,385 KB | ~590 KB |
| `src/assets` size | 35 MB | ~2 MB |
| Home page transferred (desktop) | 10.4 MB | 3.6 MB (2.5 MB of that is the hero video) |
| Desktop Total Blocking Time | ~480-560 ms | ~105 ms |
| Desktop first paint | ~0.96-1.2 s | ~0.87-1.1 s |
| Slow-mobile first content | ~11.5-15.5 s | ~8.4-10.4 s |
| DOM elements | 1,919 | 1,119 |
| Full-page layout cost | 194 ms | 43 ms |

Honest caveats:
- On the slowed-down mobile profile, **Total Blocking Time did not clearly improve** (it is
  measured after first paint, and first paint now happens sooner, so more work falls after it).
  The main thread is still busy at startup.
- Desktop largest-contentful-paint depends on the 3-second preloader animation, which is a design
  choice and was not changed.
- I would expect a real PageSpeed mobile score to improve meaningfully but **I cannot promise a
  number**. It is likely still limited by the remaining work listed below.

## Not done, and why

- **`.htaccess` / nginx config:** not applicable. The site is hosted on Vercel, which already
  compresses with Brotli/gzip. Cache headers live in `vercel.json` (done).
- **Service worker:** skipped. Hashed assets are already cached for a year. A service worker would
  add the risk of visitors getting stuck on an old version after a deploy, for little gain here.
- **Manual `critical.js` / `secondary.js` / `lazy.js` split and `data-src` lazy images:** not how
  this build works. Vite splits bundles automatically from the lazy imports above, and most images
  are small or already below the fold.
- **Inlining critical CSS:** the stylesheet is ~97 KB (16 KB gzip) generated by Tailwind; inlining
  it by hand would be fragile. The page background colour is already inlined to avoid a flash.
- **Further ideas if you want to go further:** shorten or skip the preloader on repeat visits;
  render below-the-fold home sections lazily (needs care with the scroll-pinned sections); trim
  GSAP/Framer Motion usage; lower the background shader's resolution on phones.

## Deploying

1. Review the changes: `git status` / `git diff`.
2. Commit and push to `main`. Vercel builds with `npm run build:all` and deploys automatically.
3. After it shows **Ready**, hard-refresh the live site (`Ctrl+Shift+R`).
4. Run PageSpeed Insights on the live URL for the real scores.

## Test before going live

- Home page: hero wordmark "NEXORYN" appears after the preloader; scroll through every section and
  check each heading and card animates in (nothing stays invisible).
- Reviews marquee scrolls smoothly and loops with no gap.
- Portfolio, a case study page, About, Services, Contact, Reviews, and the three legal pages.
- Project thumbnails and team photos all show (including projects loaded from the admin/API).
- On a phone: no hero video, fonts apply, nothing jumps.
- Google Analytics Realtime still records a visit.
- Open any page with `?perf=1` and check the console shows the metrics.
