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

## Animation libraries: what loads when

| Library / feature | Where | When it loads |
|---|---|---|
| React, React Router | main bundle | Immediately (needed to render anything) |
| GSAP + ScrollTrigger, Framer Motion | main bundle | Immediately. Deliberately **not** deferred: the 3-second intro is a GSAP timeline and every reveal waits for it, so delaying GSAP would delay first paint and leave content hidden. Measured script evaluation for all of it is ~0.15 s of real CPU; the cost was the animation *setup*, which is now lazy (below). |
| Scroll reveals (`Reveal`, `SplitText`) | per element | Each animation is created only when its element nears the screen (IntersectionObserver). Hidden state is plain CSS until then. |
| three.js + background shader | separate chunk (~520 KB) | After the browser is idle (`requestIdleCallback`, max 2.5 s). Mark: `background-ready`. |
| Reviews marquee (40 cards) | `Reviews.jsx` | After idle (max 3 s), behind a placeholder of identical height, so nothing shifts. Mark: `reviews-ready`. |
| About page 3D globe | `AboutPage` route chunk | Only when visiting /about. |
| Other pages | one chunk each | Only when visited. |
| Google Analytics | `public/gtag-init.js` | After the page `load` event and idle. |

Open any page with `?perf=1` and the console prints the timeline, including the `background-ready`
and `reviews-ready` marks, so you can see these happen after content is visible. Example from a
local run: `background-ready` at ~2.4 s, `reviews-ready` at ~2.4 s.

The shared hook is `src/hooks/useAfterIdle.js` (`requestIdleCallback`, with a timer fallback for
Safari).

### Why not defer GSAP / split it per route

The proposed per-page loaders (`useHomePageAnimations`, route config, etc.) were not built.
Nearly every component uses GSAP directly through `useGSAP`, the intro depends on it at startup, and
the hidden-until-revealed state is waiting on the intro finishing. Making GSAP arrive late would
move first paint later, and a failed load could leave sections permanently invisible. The
route-level split is already handled by lazy pages; GSAP is shared by all of them so it stays in one
cached chunk.

## Path 2 revision: mobile test (no change made)

Question: did deferring the reviews strip and 3D background to idle (`useAfterIdle`) hurt mobile?
Test: the same production build with deferral on mobile vs. mounting immediately on mobile
(`window.innerWidth < 768`), measured with Chrome at 4x CPU slowdown + slow 4G, two alternating
rounds of 3 runs each. (An earlier attempt at this test was invalid: a stale preview server was
serving the deferred build for both sides, so it was discarded and redone.)

| Mobile, median | Deferred (current) | Immediate on mobile |
|---|---|---|
| First contentful paint | 3.49 s / 3.64 s | 3.69 s / 3.84 s |
| Largest contentful paint | 6.54 s / 6.70 s | 6.67 s / 6.84 s |
| Blocking time (local) | 0.48 s / 0.62 s | 0.55 s / 0.70 s |
| Long tasks | 11 | 11 |

Findings:
- Deferring was slightly **better** on mobile in both rounds, and neither version creates a single
  large blocking task. So the hook keeps deferring on mobile. A one-line switch
  (`DEFER_ON_MOBILE` in `src/hooks/useAfterIdle.js`) turns mobile to immediate if your own
  PageSpeed runs ever favour it.
- The local FCP/LCP closely match your PageSpeed numbers (3.6 s / ~7 s), so those are
  reproduced. The 22 s Total Blocking Time is **not**: locally it is ~0.5 s. PageSpeed's TBT
  before any of this work was 21.9 s and is 22.4 s now, i.e. essentially unchanged, so it comes from
  something these changes do not touch and that this local test does not trigger.
- The final LCP element on mobile is the hero paragraph ("At Nexoryn, we build websites..."). It
  fades in right after the 3-second intro finishes, so LCP = time for the JavaScript to arrive and
  start + the intro. Cutting it by 1-2 s would mean shortening or skipping the intro (a design
  change) or shipping less JavaScript up front. It is not an image, so there is nothing to preload.
- Opening a page with `?perf=1` now prints which path ran, e.g.
  `useAfterIdle(reviews-ready): MOBILE (idle defer)`.

What would find the real TBT cause: the "Minimize main-thread work", "Reduce JavaScript execution
time" and "Avoid long main-thread tasks" sections of the PageSpeed report for the live URL show
which scripts and tasks account for the 22 s.

## Path 3: Analytics deferral, image dimensions, dead-code audit

### Changes made
1. **Google Analytics now loads on first interaction.** `public/gtag-init.js` injects gtag.js on
   the first scroll, tap, click or key press, or after 6 s if the visitor never interacts. Before,
   it loaded after the page's `load` event. The 6 s fallback is deliberate: loading *only* on
   interaction would silently drop every visitor who looks and leaves. Verified locally: no
   request at startup; one request on scroll; one on click; with no interaction the script loads
   at 6 s and sends its tracking hit. `?perf=1` logs when and why it loads (`gtm-loading` mark).
   The measurement ID stays `G-K13WLKCLTB` (a different ID in a task brief was a typo and would
   have stopped tracking).
2. **Explicit `width`/`height` on every `<img>`** (logos, hero mark, CTA background, laptop frame,
   project and team photos), using each file's real dimensions. The navbar/footer logos size
   themselves from height (`w-auto`) so they had no width until loaded. Footer logo, CTA background
   and team photos also got `loading="lazy"` (65 KB less transferred on first load).

### Audited, no change needed
- **ColorBends / three.js (the "59 KiB unused"):** needed. It is the site-wide animated background
  (about ten three.js classes). Switching from `import * as THREE` to named imports gave a
  byte-identical bundle (509.2 KB), i.e. the bundler already drops what it can and the renderer
  itself is the bulk. It loads after idle in its own chunk, off the critical path.
- **"Unused JavaScript" in the main bundle (38 KiB):** PageSpeed counts code that did not *run*
  during load, not dead code. A scan for exports nothing imports found only a few tiny constants
  (already removed by the bundler) and no commented-out code. The unused modules were removed in
  the first optimization pass. Nothing more is safely removable.
- **Analytics was never render-blocking** (it was already after `load`); "73.8 KiB unused" is the
  gtag library, most of which a home-page visit does not use.
- **Script evaluation time** is dominated by GSAP/React and the animation setup, which is the
  design the site keeps.

### Measured effect (local, 4x CPU + slow 4G; noisy)
- Layout shift was already tiny before (0.001-0.005 on mobile), so it does not move; the change
  clears PageSpeed's missing-dimensions audit.
- Mobile FCP/LCP/TBT differences between the old and new build were within run-to-run noise.
- Transferred on first load: 1016 KB -> 951 KB (mobile).
- I do not expect a visible PageSpeed *score* change from this pass. The remaining cost is the
  JavaScript executing at startup (GSAP, React) and the 3-second intro.

## Lenis smooth scrolling removed

The site now uses plain native browser scrolling. Removed: the `lenis` package (and from
`package.json`, `package-lock.json`, `bun.lock`), `src/components/SmoothScroll.jsx`, and Lenis's
stylesheet import. Replaced, one for one:

| Was (Lenis) | Now (native) |
|---|---|
| Smoothed wheel scrolling | Normal browser scrolling |
| Preloader scroll lock (`lenis.stop()`) | `html.is-loading { overflow: hidden }` (already in `index.css`) |
| Scroll to top on route change | `window.scrollTo({ top: 0, behavior: "instant" })` in `ScrollToTop.jsx` |
| Navbar hide/show (Lenis direction) | Passive scroll listener comparing to the last position |
| Progress bar (Lenis `progress`) | Passive scroll listener: `scrollY / (scrollHeight - innerHeight)` |
| Services `?category=` jump | `window.scrollTo` with smooth behaviour (instant for reduced motion) |
| Lenis-to-ScrollTrigger bridge | Not needed: ScrollTrigger reads native scroll directly |

Tested with real mouse-wheel input: scroll locks during the preloader, the page scrolls natively,
the navbar hides going down and returns going up, the progress bar tracks, reveals still fire,
route changes land at the top, the Services category jump lands at its section, and every page loads
without errors. Anchor links now jump instead of gliding (sections keep `scroll-mt-24`). Performance
is unchanged within measurement noise (about 6 KB gzip smaller).

## Path 4: Faster, non-blocking intro

### What the intro really is
The intro lives in `src/components/Preloader.jsx` (app level, not in Home): an orange plate where
"NEXORYN" decodes letter by letter (a per-frame text scramble) with a 0-100 counter, then a black
circle zooms in and the plate fades to the page. It is a GSAP timeline, and the scramble/counter
change text every frame, so it cannot be a pure-CSS animation without changing the design. It was
therefore kept as GSAP and changed in place.

### Changes
1. **Half the duration:** `INTRO_SPEED = 2` scales every duration, delay and stagger in both
   timelines together (so the choreography is identical, just 2x faster). The wait for the page
   `load` event cap also dropped from 1.6 s to 0.8 s, and the safety timeout from 8 s to 4 s.
2. **Non-blocking:** the plate has `pointer-events: none`, so clicks reach the page underneath, and
   the page-scroll lock (`html.is-loading`) was removed, so the page can be scrolled while it plays.

| Phase | Before | After |
|---|---|---|
| Decode + counter + rule | ~1.6 s | ~0.8 s |
| Zoom + fade outro | ~1.95 s | ~1.0 s |
| Plate on screen (measured, unthrottled) | ~2.8-2.9 s | ~1.2-1.4 s |

### Measured
- During the intro: scroll worked (0 -> 500 px), the plate was not the element under the cursor
  (clicks pass through), no JS errors. Old build: scroll locked, plate captured clicks.
- Throttled mobile (4x CPU, slow 4G), two alternating rounds of 3 runs:
  largest contentful paint **7.8 s / 7.4 s -> 6.4 s / 5.8 s**. First contentful paint (~4.3-4.6 s)
  and total blocking time (~1 s locally) did not change.
- All pages load without errors.

### Expectations
Largest contentful paint improves by roughly 1.4-1.7 s because the hero text now appears when the
shorter intro ends. Blocking time and first paint are unaffected, since they are caused by the
JavaScript startup, not the intro length, so a large score jump (e.g. to 50-60) should not be
assumed. Re-run PageSpeed on the deployed site to see the real change.

### Behaviour note
The plate is still opaque orange, so the page underneath is not *visible* until it fades; it is
scrollable and clickable (blindly) during the ~1.3 s. Making the page visible through it would
change the intro's look.

## Step 1 (from the desktop PageSpeed report): background shader on devices with no GPU

### Diagnosis
Desktop PageSpeed was 59: layout shift, largest paint and first paint were already full marks;
the missing ~41 points were Total Blocking Time (7.9 s) and Speed Index (6.8 s). The report showed
"Other: 30.7 s" of main-thread time but only ~1 s of script evaluation. Cause (verified): the
site-wide animated background is a full-screen fragment shader, and Lighthouse's test machine has no
GPU, so the browser draws it on the CPU every frame and starves the page. In a no-GPU Chrome with
the CPU slowed 3x: blocking time 6.0-6.4 s with the shader, 0.3-0.6 s with it blocked. The page's
blur/glass effects made no difference.

### Changes
1. **`src/lib/gpu.js`** detects software-only WebGL (`failIfMajorPerformanceCaveat` plus the
   driver's renderer name: SwiftShader, llvmpipe, etc.).
2. **`src/components/SiteBackground.jsx`**: with real graphics hardware, the animated shader loads
   exactly as before. Without it, the shader (and three.js, 520 KB) is never loaded and a still
   frame of the same background is shown instead (`site-bg-still.webp` 16 KB desktop,
   `site-bg-still-mobile.webp` 12 KB phone, captured from the real shader). `?perf=1` logs which
   one was chosen and why; marks `background-shader` / `background-still`.
3. **`src/components/ui/ColorBends.jsx`** (for everyone with a GPU): renders at half resolution
   (`RENDER_SCALE = 0.5`, 4x fewer pixels) and caps at 30 fps (`MAX_FPS`). Side-by-side captures
   of the old and new shader are indistinguishable apart from marginally softer edges.

### Measured (Chrome with no GPU)
| | Before | After |
|---|---|---|
| Desktop (CPU 3x): blocking time / long tasks | 6.2-6.4 s / 52-54 | 0.40-0.43 s / 8 |
| Phone profile (4x CPU, slow 4G): blocking time / long tasks | 11.2-11.4 s / 104-109 | 0.9 s / 12 |
| Phone profile: data transferred | 945 KB | 829 KB (no three.js) |

On this machine's real Intel GPU, detection reports hardware and the shader runs as before. All
pages load with no errors.

### Behaviour change to know about
Visitors on devices without graphics acceleration (some virtual machines, remote desktops, very old
PCs, and Lighthouse itself) now see a still background instead of the moving one. Everyone else is
unchanged.

## Step 2 (trim remaining startup work): experiments and findings, no code kept

With step 1 in place, what blocks the page in a no-GPU Chrome (CPU 3x, desktop) is ~190 ms from the
page's own code plus ~140 ms from Google Analytics (total ~330 ms; measured by blocking the
analytics requests). The page's own part is dominated by the intro's GSAP setup: its first
computed-style read forces the browser to lay out the whole page in one task, and a second wave
when the intro ends and the first-screen reveals start.

Tried and **reverted** (each measured against the step 1 build, alternating runs):
| Idea | Result |
|---|---|
| `content-visibility: auto` on the below-the-fold sections | No consistent change (noise) |
| Mount the home sections one per task after the hero | First paint earlier (1.7 s -> 0.9 s) but blocking time **worse** (~330 -> 540-700 ms): slices land after first paint, where blocking is counted, and each is still over 50 ms |
| Start reveal animations one per frame instead of together | Same or slightly worse (~300 -> 310-350 ms) |
| Pre-reading element styles in one batch (earlier round) | No change |

Conclusion: the remaining cost is mostly one-time page layout and animation-library start-up,
which these re-orderings don't remove. Further drops would need to remove work (less DOM/CSS, a
lighter intro, or dropping analytics from the page-load window), not reschedule it.
