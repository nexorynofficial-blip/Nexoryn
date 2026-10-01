// Google Analytics init. Kept as a file rather than inline so the CSP can stay
// on script-src 'self' without 'unsafe-inline'.
window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
gtag("js", new Date());
gtag("config", "G-K13WLKCLTB");
