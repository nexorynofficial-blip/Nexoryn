// Small animated illustrations for the three service cards. All motion is CSS
// (the svc-* keyframes in index.css), so a parent can pause every one of them
// at once with the .svc-paused class when the section is off screen.

const ORANGE = "#ff7a1a";
const AMBER = "#ffb300";

function DotGrid({ id }) {
  return (
    <>
      <defs>
        <pattern id={id} width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.07)" />
        </pattern>
      </defs>
      <rect width="320" height="180" fill={`url(#${id})`} />
    </>
  );
}

/** A tiny workflow: trigger → AI agent → CRM + email, with data flowing. */
export function AutomationVisual() {
  const wires = [
    "M64,90 L126,90",
    "M194,90 C222,90 222,52 250,52",
    "M194,90 C222,90 222,128 250,128",
  ];
  const node = (x, y, w, label, children, delay) => (
    <g>
      <rect x={x} y={y} width={w} height="40" rx="10" fill="#1c1c1c" stroke="#3a3a3a" />
      {children}
      <text x={x + w / 2} y={y + 54} fill="#a3a3a3" fontSize="9" textAnchor="middle">
        {label}
      </text>
      {delay !== undefined && (
        <g className="svc-pop" style={{ animationDelay: delay }}>
          <circle cx={x + w - 4} cy={y + 4} r="6" fill="#22c55e" />
          <path d={`M${x + w - 7},${y + 4} l2,2 l4,-4`} stroke="#0b0b0b" strokeWidth="1.8" fill="none" />
        </g>
      )}
    </g>
  );

  return (
    <svg viewBox="0 0 320 180" className="h-full w-full" aria-hidden="true">
      <DotGrid id="svc-grid-a" />
      {wires.map((d) => (
        <g key={d}>
          <path d={d} fill="none" stroke="#333" strokeWidth="2" />
          <path d={d} fill="none" stroke={ORANGE} strokeWidth="2" strokeDasharray="6 8" className="svc-flow" />
        </g>
      ))}
      {/* Trigger */}
      {node(24, 70, 40, "New lead",
        <path d="M46,78 l-7,13 h6 l-2,11 l9,-15 h-6 z" fill={ORANGE} />)}
      {/* AI agent, glowing while it thinks */}
      <rect x="122" y="66" width="76" height="48" rx="13" fill="none" stroke={ORANGE} strokeOpacity="0.5" strokeWidth="3" className="svc-glow" />
      {node(126, 70, 68, "AI agent",
        <g>
          <rect x="146" y="80" width="28" height="20" rx="6" fill="none" stroke="#e5e5e5" strokeWidth="1.6" />
          <circle cx="155" cy="90" r="2" fill={ORANGE} className="svc-blink" />
          <circle cx="165" cy="90" r="2" fill={ORANGE} className="svc-blink" />
          <path d="M160,80 v-4" stroke="#e5e5e5" strokeWidth="1.6" />
        </g>)}
      {/* Outputs */}
      {node(250, 32, 46, "CRM",
        <g stroke="#a78bfa" strokeWidth="1.6" fill="none">
          <ellipse cx="273" cy="45" rx="9" ry="3" />
          <path d="M264,45 v12 a9,3 0 0 0 18,0 v-12" />
          <path d="M264,51 a9,3 0 0 0 18,0" />
        </g>, "1.1s")}
      {node(250, 108, 46, "Email",
        <g stroke="#4ade80" strokeWidth="1.6" fill="none">
          <rect x="263" y="120" width="20" height="14" rx="2" />
          <path d="M263,121 l10,7 l10,-7" />
        </g>, "1.5s")}
      {/* Status chip */}
      <g className="svc-pop" style={{ animationDelay: "1.9s" }}>
        <rect x="18" y="14" width="102" height="20" rx="10" fill="rgba(34,197,94,0.12)" stroke="rgba(34,197,94,0.35)" />
        <circle cx="30" cy="24" r="3" fill="#22c55e" />
        <text x="38" y="27.5" fill="#4ade80" fontSize="9" fontWeight="600">Lead qualified</text>
      </g>
    </svg>
  );
}

/** A browser where the page assembles itself and scores 99. */
export function WebVisual() {
  return (
    <svg viewBox="0 0 320 180" className="h-full w-full" aria-hidden="true">
      <DotGrid id="svc-grid-b" />
      <rect x="20" y="14" width="280" height="156" rx="10" fill="#161616" stroke="#333" />
      <path d="M20,24 a10,10 0 0 1 10,-10 h260 a10,10 0 0 1 10,10 v12 h-280 z" fill="#1f1f1f" />
      {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => (
        <circle key={c} cx={34 + i * 10} cy="25" r="3" fill={c} />
      ))}
      <rect x="92" y="19" width="136" height="12" rx="6" fill="#2a2a2a" />
      <text x="160" y="28" fill="#8b8b8b" fontSize="7.5" textAnchor="middle">nexoryn.tech</text>

      {/* Page blocks build in, one after another */}
      <rect x="34" y="48" width="70" height="7" rx="3.5" fill={ORANGE} className="svc-build" style={{ animationDelay: "0s" }} />
      <rect x="34" y="62" width="140" height="11" rx="3" fill="#e5e5e5" className="svc-build" style={{ animationDelay: "0.25s" }} />
      <rect x="34" y="78" width="110" height="11" rx="3" fill="#e5e5e5" className="svc-build" style={{ animationDelay: "0.45s" }} />
      <rect x="34" y="96" width="120" height="5" rx="2.5" fill="#555" className="svc-build" style={{ animationDelay: "0.65s" }} />
      <rect x="34" y="105" width="96" height="5" rx="2.5" fill="#555" className="svc-build" style={{ animationDelay: "0.75s" }} />
      <g className="svc-build" style={{ animationDelay: "0.95s" }}>
        <rect x="34" y="120" width="56" height="16" rx="8" fill={ORANGE} className="svc-press" />
        <text x="62" y="131" fill="#0b0b0b" fontSize="7" fontWeight="700" textAnchor="middle">GET STARTED</text>
      </g>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={34 + i * 46} y="146" width="40" height="14" rx="4" fill="#232323" stroke="#2f2f2f" className="svc-build" style={{ animationDelay: `${1.1 + i * 0.12}s` }} />
      ))}

      {/* Performance score */}
      <g transform="translate(240,92)">
        <circle r="26" fill="none" stroke="#2a2a2a" strokeWidth="5" />
        <circle r="26" fill="none" stroke="#22c55e" strokeWidth="5" strokeLinecap="round" strokeDasharray="163.4" className="svc-score" transform="rotate(-90)" />
        <text y="5" fill="#f5f5f5" fontSize="15" fontWeight="800" textAnchor="middle">99</text>
        <text y="42" fill="#8b8b8b" fontSize="7.5" textAnchor="middle">Performance</text>
      </g>

      {/* Cursor heads for the button and clicks it */}
      <path d="M0,0 l0,12 l3.5,-3 l2.5,5.5 l2,-1 l-2.5,-5.5 l4.5,0 z" fill="#fff" stroke="#0b0b0b" strokeWidth="0.8" className="svc-cursor" />
    </svg>
  );
}

/** A design canvas: the bolt mark draws itself with pen handles and swatches. */
export function DesignVisual() {
  const bolt = "M92,128 L150,62 L150,106 L222,46";
  return (
    <svg viewBox="0 0 320 180" className="h-full w-full" aria-hidden="true">
      <DotGrid id="svc-grid-c" />
      <defs>
        <linearGradient id="svc-bolt" x1="0" x2="1" y1="1" y2="0">
          <stop offset="0" stopColor={ORANGE} />
          <stop offset="1" stopColor={AMBER} />
        </linearGradient>
      </defs>
      {/* Artboard */}
      <rect x="62" y="24" width="190" height="124" rx="6" fill="#151515" stroke="#2f2f2f" />
      <text x="62" y="18" fill="#7a7a7a" fontSize="7.5">Logo / Primary</text>

      {/* Selection box */}
      <rect x="84" y="38" width="146" height="98" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" className="svc-fade" />
      {[[84, 38], [230, 38], [84, 136], [230, 136]].map(([x, y]) => (
        <rect key={`${x}${y}`} x={x - 3} y={y - 3} width="6" height="6" fill="#0b0b0b" stroke="#38bdf8" className="svc-fade" />
      ))}

      {/* The mark, drawn stroke by stroke */}
      <path d={bolt} fill="none" stroke="url(#svc-bolt)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" pathLength="100" strokeDasharray="100" className="svc-draw" />
      {/* Bezier handles on the anchor points */}
      {[[92, 128], [150, 62], [150, 106], [222, 46]].map(([x, y], i) => (
        <g key={i} className="svc-fade">
          <circle cx={x} cy={y} r="3.5" fill="#0b0b0b" stroke="#fff" strokeWidth="1.2" />
        </g>
      ))}
      <g className="svc-fade" stroke="#9ca3af" strokeWidth="0.8">
        <path d="M150,62 L132,50" />
        <circle cx="132" cy="50" r="2" fill="#9ca3af" />
        <path d="M150,106 L170,118" />
        <circle cx="170" cy="118" r="2" fill="#9ca3af" />
      </g>

      {/* Swatches, with the selection ring moving between them */}
      {["#ff7a1a", "#ffb300", "#f5f5f5", "#1f1f1f"].map((c, i) => (
        <rect key={c} x={270} y={34 + i * 26} width="20" height="20" rx="5" fill={c} stroke="#3a3a3a" />
      ))}
      <rect x="267" y="31" width="26" height="26" rx="7" fill="none" stroke="#fff" strokeWidth="1.5" className="svc-swatch" />

      {/* Type sample */}
      <text x="62" y="166" fill="#e5e5e5" fontSize="11" fontWeight="800" letterSpacing="2">NEXORYN</text>
      <text x="138" y="166" fill="#7a7a7a" fontSize="8">Montserrat · 800</text>
    </svg>
  );
}
