// Core Web Vitals and long-task logging for debugging performance.
//
// Off by default so visitors pay nothing. Turn it on by opening any page with
// ?perf=1 (it is remembered for the tab); ?perf=0 turns it off again. Results
// are printed to the browser console.
(function () {
  var enabled = false;
  try {
    var q = new URLSearchParams(location.search).get("perf");
    if (q === "1") sessionStorage.setItem("nx-perf", "1");
    if (q === "0") sessionStorage.removeItem("nx-perf");
    enabled = sessionStorage.getItem("nx-perf") === "1";
  } catch (e) {
    enabled = /[?&]perf=1/.test(location.search);
  }
  if (!enabled || !("PerformanceObserver" in window)) return;

  var tag = "%c[perf]";
  var style = "color:#ff7a1a;font-weight:bold";
  function log(label, value, extra) {
    console.log(tag + " " + label + ": " + value, style, extra || "");
  }

  function observe(type, cb, opts) {
    try {
      new PerformanceObserver(function (list) {
        list.getEntries().forEach(cb);
      }).observe(Object.assign({ type: type, buffered: true }, opts));
    } catch (e) {
      /* entry type unsupported in this browser */
    }
  }

  // Paint timings
  observe("paint", function (e) {
    log(e.name, Math.round(e.startTime) + " ms");
  });

  // Largest Contentful Paint (the last candidate reported is the final one)
  observe("largest-contentful-paint", function (e) {
    log("LCP", Math.round(e.startTime) + " ms", e.element || "");
  });

  // Cumulative Layout Shift
  var cls = 0;
  observe("layout-shift", function (e) {
    if (!e.hadRecentInput) {
      cls += e.value;
      log("CLS", cls.toFixed(4));
    }
  });

  // Interaction latency (INP is the worst of these)
  var worst = 0;
  observe(
    "event",
    function (e) {
      if (e.duration > worst) {
        worst = e.duration;
        log("INP (worst so far)", Math.round(worst) + " ms", e.name);
      }
    },
    { durationThreshold: 40 },
  );

  // Long tasks (>50 ms) and running Total Blocking Time
  var tbt = 0;
  observe("longtask", function (e) {
    tbt += Math.max(0, e.duration - 50);
    log("long task", Math.round(e.duration) + " ms @ " + Math.round(e.startTime) + " ms", "TBT so far: " + Math.round(tbt) + " ms");
  });

  // Navigation summary once the page has loaded
  window.addEventListener("load", function () {
    setTimeout(function () {
      var nav = performance.getEntriesByType("navigation")[0];
      if (!nav) return;
      log("TTFB", Math.round(nav.responseStart) + " ms");
      log("DOMContentLoaded", Math.round(nav.domContentLoadedEventEnd) + " ms");
      log("load", Math.round(nav.loadEventEnd) + " ms");
    }, 0);
  });
})();
