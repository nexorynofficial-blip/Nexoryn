import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Filter, Database, Send, CheckCircle2 } from "lucide-react";

const NODES = [
  { id: 1, icon: Zap, label: "New Lead", x: 14, y: 20 },
  { id: 2, icon: Filter, label: "Auto-Qualify", x: 50, y: 12 },
  { id: 3, icon: Database, label: "Update CRM", x: 84, y: 32, stat: "1.2k synced" },
  { id: 4, icon: Send, label: "Follow-up", x: 55, y: 62, stat: "98% sent on time" },
  { id: 5, icon: CheckCircle2, label: "Task Done", x: 18, y: 78 },
];

// Staggered start delays so the pulses read as an organic system, not one wave
const CONNECTIONS = [
  { from: 1, to: 2, duration: 3, delay: 0 },
  { from: 2, to: 3, duration: 3.5, delay: 0.9 },
  { from: 3, to: 4, duration: 2.8, delay: 1.7 },
  { from: 4, to: 5, duration: 3.2, delay: 2.6 },
];

const getNode = (id) => NODES.find((n) => n.id === id);

// Quadratic-bezier path between two points, bowed perpendicular to the line
// for a gentle circuit-board curve instead of a straight connector.
function curvedPath(from, to, bend, flip) {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.hypot(dx, dy) || 1;
  const sign = flip ? -1 : 1;
  const nx = (-dy / dist) * sign;
  const ny = (dx / dist) * sign;
  const cx = mx + nx * dist * bend;
  const cy = my + ny * dist * bend;
  return `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`;
}

// Flash keyframes for a node "receiving" a pulse: quick brighten + scale-up
// (~0.35s) at the start of each cycle, then settle for the rest of it.
function receiveFlash(cycleDuration, startDelay) {
  const flashEnd = Math.min(0.35 / cycleDuration, 0.3);
  return {
    animate: {
      scale: [1, 1.12, 1],
      boxShadow: [
        "0 0 0px rgba(255,122,26,0)",
        "0 0 18px rgba(255,122,26,0.55)",
        "0 0 0px rgba(255,122,26,0)",
      ],
      borderColor: [
        "rgba(251,146,60,0.2)",
        "rgba(251,146,60,0.7)",
        "rgba(251,146,60,0.2)",
      ],
    },
    transition: {
      duration: cycleDuration,
      times: [0, flashEnd / 2, flashEnd],
      delay: startDelay,
      repeat: Infinity,
      ease: "easeOut",
    },
  };
}

function StatusLine() {
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-green opacity-60" />
        <span className="relative inline-flex h-2 w-2 animate-dot-glow rounded-full bg-status-green" />
      </span>
      <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/50">
        System active
      </span>
    </div>
  );
}

function LiveCounter() {
  const [count, setCount] = useState(247);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((c) => c + Math.floor(Math.random() * 3) + 1);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="text-[11px] font-medium text-white/50">
      <span className="font-heading text-white">
        {count.toLocaleString("en-US")}
      </span>{" "}
      tasks automated today
    </span>
  );
}

export function WorkflowWidget({ className = "" }) {
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    const update = () =>
      setSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // SVG path data doesn't support percentage units, so paths run on pixel
  // coordinates computed from the container's measured size
  const px = (node) => ({
    x: (node.x / 100) * size.width,
    y: (node.y / 100) * size.height,
  });

  return (
    <div className={`relative w-full ${className}`}>
      {/* Status row — floats directly on the page background, no card box */}
      <div className="flex items-center justify-between px-1">
        <StatusLine />
        <LiveCounter />
      </div>

      <div
        ref={containerRef}
        className="relative mt-6 min-h-[320px] w-full lg:min-h-[380px]"
      >
        {size.width > 0 && (
          <svg
            width={size.width}
            height={size.height}
            className="pointer-events-none absolute inset-0 overflow-visible"
          >
            <defs>
              <filter id="pulseGlow" x="-200%" y="-200%" width="500%" height="500%">
                <feGaussianBlur stdDeviation="3.2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {CONNECTIONS.map((conn, i) => {
              const from = px(getNode(conn.from));
              const to = px(getNode(conn.to));
              const path = curvedPath(from, to, 0.22, i % 2 === 0);
              return (
                <g key={i}>
                  <path
                    d={path}
                    fill="none"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="1.5"
                  />
                  {/* faint trailing echoes create a soft gradient tail */}
                  {[0.24, 0.12, 0].map((offset, echoIndex) => (
                    <circle
                      key={echoIndex}
                      r={echoIndex === 2 ? 3 : 2.2 - echoIndex * 0.5}
                      fill="#ff9a3d"
                      opacity="0"
                      filter={echoIndex === 2 ? "url(#pulseGlow)" : undefined}
                    >
                      <animateMotion
                        dur={`${conn.duration}s`}
                        begin={`${conn.delay - offset}s`}
                        repeatCount="indefinite"
                        path={path}
                      />
                      <animate
                        attributeName="opacity"
                        values={
                          echoIndex === 2 ? "0;1;1;0" : "0;0.35;0.35;0"
                        }
                        dur={`${conn.duration}s`}
                        begin={`${conn.delay - offset}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                  ))}
                </g>
              );
            })}
          </svg>
        )}

        {NODES.map((node) => {
          const Icon = node.icon;
          // Flash when the incoming pulse arrives (first node flashes when
          // its outgoing pulse departs)
          const incoming = CONNECTIONS.find((c) => c.to === node.id);
          const outgoing = CONNECTIONS.find((c) => c.from === node.id);
          const conn = incoming ?? outgoing;
          const startDelay = incoming
            ? incoming.delay + incoming.duration
            : outgoing.delay;
          const flash = receiveFlash(conn.duration, startDelay);

          return (
            <div
              key={node.id}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              <div className="relative h-9 w-9">
                {/* ambient idle glow — always on, independent of the flash */}
                <div
                  className="animate-node-breathe pointer-events-none absolute inset-0 rounded-lg"
                  style={{ animationDelay: `${node.id * 0.4}s` }}
                />
                <motion.div
                  animate={flash.animate}
                  transition={flash.transition}
                  className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-orange-400/20 bg-orange-500/15"
                >
                  <Icon size={16} className="text-orange-400" />
                </motion.div>
              </div>
              <span className="whitespace-nowrap text-[11px] font-medium text-white/80">
                {node.label}
              </span>
              {node.stat && (
                <span className="whitespace-nowrap text-[10px] font-medium text-accent-from/70">
                  {node.stat}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
