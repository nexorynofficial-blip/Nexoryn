import { useEffect, useMemo, useRef } from "react";
import { hasFinePointer, prefersReducedMotion } from "../lib/easing";

// Deterministic PRNG so the constellation is identical on every load/render
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// How close the cursor needs to be (in px) before a dot/line starts being
// pulled toward it and brightening, and the radius at which that peaks.
const CURSOR_RADIUS = 180;
// Max distance (px) a dot gets dragged toward the cursor at full proximity.
const PULL_STRENGTH = 22;
// Max px offset for each dot's own idle drift, independent of the cursor.
const DRIFT_AMPLITUDE = 9;

export function TechNetworkOverlay({ dotCount = 30, seed = 7 }) {
  const svgRef = useRef(null);
  const dotElRefs = useRef([]);
  const haloElRefs = useRef([]);
  const lineElRefs = useRef([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  const { dots, lines } = useMemo(() => {
    const rand = mulberry32(seed);
    const dots = Array.from({ length: dotCount }, (_, i) => ({
      id: i,
      x: rand() * 100,
      y: rand() * 100,
      // Idle twinkle timing (used by the JS-driven sine wave below)
      delay: rand() * 5,
      duration: 11 + rand() * 7,
      // Per-dot size/brightness so the field doesn't look mechanically uniform
      baseR: 3 + rand() * 2, // 3-5px idle, up to +3px near the cursor
      baseOpacity: 0.4 + rand() * 0.1, // 40-50% idle
      // Autonomous drift phase/speed — slow, gentle wandering independent of
      // the cursor, so the field never looks static even far from the mouse.
      driftPhase: rand() * Math.PI * 2,
      driftSpeed: 0.15 + rand() * 0.15, // ~4-8s per full cycle
    }));

    // Connect each dot to its two nearest neighbors (not just one) for a
    // visibly denser network than the original sparse single-link version.
    const lines = [];
    const seen = new Set();
    dots.forEach((dot) => {
      const nearest = dots
        .filter((d) => d.id !== dot.id)
        .map((d) => ({ ...d, dist: Math.hypot(d.x - dot.x, d.y - dot.y) }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 2);
      nearest.forEach((n) => {
        if (n.dist >= 22) return;
        const key = `${Math.min(dot.id, n.id)}-${Math.max(dot.id, n.id)}`;
        if (seen.has(key)) return;
        seen.add(key);
        lines.push({ from: dot, to: n, id: key });
      });
    });
    return { dots, lines };
  }, [dotCount, seed]);

  // Single rAF loop drives everything: idle drift always runs (any device,
  // as long as motion isn't reduced), cursor pull/glow layers on top only
  // where a persistent pointer exists to react to. Imperative attribute
  // writes rather than React state — at 100+ dots/lines, re-rendering every
  // frame would be the actual performance problem, not the math itself.
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const svg = svgRef.current;
    if (!svg) return undefined;
    const interactive = hasFinePointer();

    // The original idle twinkle was SMIL <animate>; now that this loop owns
    // opacity/position every frame, SMIL would fight it over the same
    // attributes, so it's paused and reproduced in JS below instead.
    svg.pauseAnimations();

    let raf;
    const positions = new Array(dots.length);

    const onMove = (e) => {
      const rect = svg.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    if (interactive) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerleave", onLeave);
    }

    const tick = () => {
      const rect = svg.getBoundingClientRect();
      const { x: mx, y: my } = mouseRef.current;
      const now = performance.now() / 1000;

      dots.forEach((dot, i) => {
        const baseX = (dot.x / 100) * rect.width;
        const baseY = (dot.y / 100) * rect.height;

        // Slow autonomous wander — a small Lissajous-style loop, not a
        // straight back-and-forth, so it reads as organic rather than
        // mechanical.
        let x = baseX + Math.sin(now * dot.driftSpeed + dot.driftPhase) * DRIFT_AMPLITUDE;
        let y = baseY + Math.cos(now * dot.driftSpeed * 1.3 + dot.driftPhase) * DRIFT_AMPLITUDE;

        let proximity = 0;
        if (interactive) {
          const dist = Math.hypot(mx - x, my - y);
          proximity = Math.max(0, 1 - dist / CURSOR_RADIUS);
          // Magnetic pull toward the cursor, layered on top of the drift.
          x += (mx - x) * proximity * (PULL_STRENGTH / CURSOR_RADIUS);
          y += (my - y) * proximity * (PULL_STRENGTH / CURSOR_RADIUS);
        }

        positions[i] = { x, y, proximity };

        const idle = 0.5 * Math.sin(((now + dot.delay) / dot.duration) * Math.PI * 2);
        const el = dotElRefs.current[i];
        if (el) {
          el.setAttribute("cx", x.toFixed(1));
          el.setAttribute("cy", y.toFixed(1));
          el.setAttribute("r", (dot.baseR + proximity * 3).toFixed(2));
          el.setAttribute("opacity", Math.min(1, dot.baseOpacity + idle * 0.15 + proximity * 0.5).toFixed(2));
        }
        // Soft halo blooms outward as the cursor approaches — the "glow"
        // the interactive spec asks for, distinct from the dot itself
        // brightening.
        const halo = haloElRefs.current[i];
        if (halo) {
          halo.setAttribute("cx", x.toFixed(1));
          halo.setAttribute("cy", y.toFixed(1));
          halo.setAttribute("r", (7 + proximity * 10).toFixed(2));
          halo.setAttribute("opacity", (0.12 + proximity * 0.35).toFixed(2));
        }
      });

      lines.forEach((line, i) => {
        const el = lineElRefs.current[i];
        if (!el) return;
        const from = positions[line.from.id];
        const to = positions[line.to.id];
        if (!from || !to) return;
        el.setAttribute("x1", from.x.toFixed(1));
        el.setAttribute("y1", from.y.toFixed(1));
        el.setAttribute("x2", to.x.toFixed(1));
        el.setAttribute("y2", to.y.toFixed(1));
        const proximity = Math.max(from.proximity, to.proximity);
        const idle = 0.05 * Math.sin(((now + (i % 4) * 2) / (6 + (i % 4) * 2)) * Math.PI * 2);
        el.setAttribute("stroke-opacity", Math.min(1, 0.32 + idle + proximity * 0.5).toFixed(2));
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      svg.unpauseAnimations();
      if (interactive) {
        window.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerleave", onLeave);
      }
    };
  }, [dots, lines]);

  return (
    <svg
      ref={svgRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <g>
        {lines.map((line, i) => (
          <line
            key={line.id}
            ref={(el) => (lineElRefs.current[i] = el)}
            x1={`${line.from.x}%`}
            y1={`${line.from.y}%`}
            x2={`${line.to.x}%`}
            y2={`${line.to.y}%`}
            stroke="rgba(255,150,50,0.9)"
            strokeWidth="1"
            strokeOpacity="0.35"
          />
        ))}
        {dots.map((dot, i) => (
          <g key={dot.id}>
            {/* Soft glow halo — blooms outward on cursor proximity */}
            <circle
              ref={(el) => (haloElRefs.current[i] = el)}
              cx={`${dot.x}%`}
              cy={`${dot.y}%`}
              r="7"
              fill="rgba(255,150,50,0.18)"
            />
            <circle
              ref={(el) => (dotElRefs.current[i] = el)}
              cx={`${dot.x}%`}
              cy={`${dot.y}%`}
              r={dot.baseR}
              fill="rgb(255,170,60)"
              opacity={dot.baseOpacity}
            />
          </g>
        ))}
      </g>
    </svg>
  );
}
