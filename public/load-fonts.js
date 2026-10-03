// Loads the Google Fonts stylesheet without blocking first paint.
//
// A plain <link rel="stylesheet"> in <head> is render-blocking: the browser
// shows nothing until the font CSS has been fetched from another origin. The
// usual non-blocking trick is an inline onload handler, which this site's CSP
// (script-src 'self') forbids — so the swap lives in this same-origin file.
// The stylesheet URL is read from the preload link in index.html so there is
// one source of truth. Text renders in the fallback font first and swaps
// (the URL carries display=swap).
(function () {
  var preload = document.querySelector('link[rel="preload"][as="style"]');
  if (!preload) return;
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = preload.href;
  document.head.appendChild(link);
})();
