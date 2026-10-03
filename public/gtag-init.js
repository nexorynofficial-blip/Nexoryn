// Google Analytics. Kept as a file rather than inline so the CSP can stay on
// script-src 'self' without 'unsafe-inline'.
//
// The gtag.js library itself (~74 KB of script that a home-page visit barely
// uses) is not loaded during startup. It is injected on the visitor's first
// interaction (scroll, tap, click or key press), or after FALLBACK_MS if they
// never interact, so visitors who just look and leave are still counted.
// Calls to gtag() made before it arrives are queued on dataLayer and replayed,
// so no hit is lost.
var GA_ID = "G-K13WLKCLTB";
// Long on purpose: the library is ~170 KB and costs a few hundred ms of main-thread
// time, which is the single biggest blocking item left on a slow phone. Visitors who
// scroll, tap or click (almost everyone who stays) trigger it immediately; this timer
// only catches people who sit on the page without touching it.
var FALLBACK_MS = 20000;

window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
gtag("js", new Date());
gtag("config", GA_ID);

var perfOn = /[?&]perf=1/.test(location.search);
var loaded = false;
var EVENTS = ["scroll", "click", "touchstart", "keydown", "pointerdown"];

function loadGtag(reason) {
  if (loaded) return;
  loaded = true;
  EVENTS.forEach(function (e) {
    window.removeEventListener(e, onInteract);
  });
  clearTimeout(fallbackTimer);

  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
  document.head.appendChild(s);

  if (performance.mark) performance.mark("gtm-loading");
  if (perfOn) console.log("[perf] Google Analytics loading (" + reason + ")");
}

function onInteract(e) {
  loadGtag("first " + e.type);
}

EVENTS.forEach(function (e) {
  window.addEventListener(e, onInteract, { once: true, passive: true });
});
var fallbackTimer = setTimeout(function () {
  loadGtag("no interaction after " + FALLBACK_MS / 1000 + "s");
}, FALLBACK_MS);

if (perfOn) console.log("[perf] Google Analytics deferred until first interaction (or " + FALLBACK_MS / 1000 + "s)");
