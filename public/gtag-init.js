// Google Analytics. Kept as a file rather than inline so the CSP can stay on
// script-src 'self' without 'unsafe-inline'.
//
// The gtag.js library itself (~100 KB of script to parse and run) used to load
// from a <script async> tag in <head>, competing with the app for the main
// thread during startup. It is now injected only after the page has loaded and
// the browser is idle. Calls to gtag() made before it arrives are queued on
// dataLayer and replayed, so no hit is lost.
window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
gtag("js", new Date());
gtag("config", "G-K13WLKCLTB");

function loadGtag() {
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=G-K13WLKCLTB";
  document.head.appendChild(s);
}

function whenIdle() {
  if ("requestIdleCallback" in window) window.requestIdleCallback(loadGtag, { timeout: 4000 });
  else setTimeout(loadGtag, 2000);
}

if (document.readyState === "complete") whenIdle();
else window.addEventListener("load", whenIdle);
