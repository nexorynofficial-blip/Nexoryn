import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { useCountUp } from "../hooks/useCountUp";
import { ZapIcon, TrendingUpIcon, TrendingDownIcon } from "./ui/Icons";

const BEFORE_HOLD_MS = 2000;
const AFTER_HOLD_MS = 5500;

// Weekly output bars for the mini chart (heights in %)
const CHART_BARS = [
  { before: 38, after: 68 },
  { before: 26, after: 78 },
  { before: 42, after: 88 },
  { before: 30, after: 82 },
  { before: 24, after: 96 },
];

const RING_RADIUS = 40;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function formatResponseTime(hours) {
  if (hours >= 1) return `${Math.round(hours)} hrs`;
  return `${Math.max(2, Math.round(hours * 60))} mins`;
}

function TrendChip({ after, upWhenAfter = true, beforeText, afterText }) {
  const showUp = after ? upWhenAfter : !upWhenAfter;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors duration-500 ${
        after ? "bg-accent-from/15 text-accent-to" : "bg-red-500/15 text-red-400/90"
      }`}
    >
      {showUp ? (
        <TrendingUpIcon className="h-3 w-3" />
      ) : (
        <TrendingDownIcon className="h-3 w-3" />
      )}
      {after ? afterText : beforeText}
    </span>
  );
}

function StatTile({ label, value, unit, trend }) {
  return (
    <div className="rounded-2xl glass-panel p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/50">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold tabular-nums text-white">
        {value}
        {unit && (
          <span className="ml-1 text-sm font-medium text-white/50">{unit}</span>
        )}
      </p>
      <div className="mt-2">{trend}</div>
    </div>
  );
}

function BarRow({ label, valueText, pct, after }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/50">
          {label}
        </p>
        <p className="text-lg font-bold tabular-nums text-white">{valueText}</p>
      </div>
      <div className="relative mt-3 h-2.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-red-500 transition-all duration-1000 ease-out"
          style={{ width: `${pct}%`, opacity: after ? 0 : 1 }}
        />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent-from to-accent-to transition-all duration-1000 ease-out"
          style={{ width: `${pct}%`, opacity: after ? 1 : 0 }}
        />
      </div>
    </div>
  );
}

function MiniBarChart({ after }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/50">
        Weekly output
      </p>
      <div className="mt-3 flex h-24 items-end gap-2">
        {CHART_BARS.map((bar, i) => {
          const height = after ? bar.after : bar.before;
          const delay = `${i * 80}ms`;
          return (
            <div key={i} className="relative flex-1 self-stretch">
              <div
                className="absolute bottom-0 w-full rounded-t-md bg-red-500/70 transition-all duration-1000 ease-out"
                style={{ height: `${height}%`, opacity: after ? 0 : 1, transitionDelay: delay }}
              />
              <div
                className="absolute bottom-0 w-full rounded-t-md bg-gradient-to-t from-accent-from to-accent-to transition-all duration-1000 ease-out"
                style={{ height: `${height}%`, opacity: after ? 1 : 0, transitionDelay: delay }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2">
        {CHART_BARS.map((_, i) => (
          <p key={i} className="flex-1 text-center text-[10px] font-medium text-white/30">
            W{i + 1}
          </p>
        ))}
      </div>
    </div>
  );
}

function CoverageRing({ after }) {
  const pct = useCountUp(94, 12, 1200, after);
  const target = after ? 94 : 12;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-28 w-28">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={RING_RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r={RING_RADIUS}
            fill="none"
            stroke={after ? "#ff7a1a" : "#ef4444"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={RING_CIRCUMFERENCE * (1 - target / 100)}
            style={{ transition: "stroke-dashoffset 1s ease-out, stroke 0.6s ease" }}
          />
        </svg>
        <p className="absolute inset-0 flex items-center justify-center text-xl font-bold tabular-nums text-white">
          {Math.round(pct)}%
        </p>
      </div>
      <p className="text-center text-xs font-semibold uppercase tracking-[0.15em] text-white/50">
        Automation
        <br />
        coverage
      </p>
    </div>
  );
}

export default function BeforeAfterCard({ className = "" }) {
  const cardRef = useRef(null);
  const inView = useInView(cardRef, { amount: 0.4 });
  const [after, setAfter] = useState(false);

  // Loop: 2s "before" -> transition -> hold "after" -> repeat, while in view
  useEffect(() => {
    if (!inView) {
      setAfter(false);
      return;
    }
    let timer;
    const run = () => {
      timer = setTimeout(() => {
        setAfter(true);
        timer = setTimeout(() => {
          setAfter(false);
          run();
        }, AFTER_HOLD_MS);
      }, BEFORE_HOLD_MS);
    };
    run();
    return () => clearTimeout(timer);
  }, [inView]);

  const manualHours = useCountUp(2, 20, 1200, after);
  const responseHours = useCountUp(2 / 60, 48, 1200, after);
  const accuracy = useCountUp(99, 72, 1200, after);
  const revenue = useCountUp(8400, 0, 1200, after);
  const consistency = useCountUp(92, 34, 1200, after);

  return (
    <div
      ref={cardRef}
      className={`group relative w-full max-w-2xl rounded-3xl glass-panel p-7 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] md:p-9 ${
        after
          ? "border-accent-from/40 shadow-[0_0_40px_rgba(255,122,26,0.4)] hover:shadow-[0_0_55px_rgba(255,122,26,0.5)]"
          : "border-red-500/40 shadow-[0_0_40px_rgba(239,68,68,0.35)] hover:shadow-[0_0_55px_rgba(239,68,68,0.45)]"
      } ${className}`}
      style={{ transitionProperty: "box-shadow, border-color, transform" }}
    >
      {/* Header: state chip + icon */}
      <div className="flex items-center justify-between">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={after ? "after" : "before"}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.3 }}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] ${
              after
                ? "border-accent-from/40 bg-accent-from/10 text-accent-to"
                : "border-red-500/40 bg-red-500/10 text-red-400/90"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                after ? "bg-accent-from" : "bg-red-500"
              }`}
            />
            {after ? "After Automation" : "Before Automation"}
          </motion.span>
        </AnimatePresence>
        <ZapIcon
          className={`h-6 w-6 transition-colors duration-500 ${
            after ? "text-accent-to" : "text-white/30"
          }`}
        />
      </div>

      {/* Top row: compact stat tiles */}
      <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile
          label="Manual work"
          value={Math.round(manualHours)}
          unit="hrs/wk"
          trend={
            <TrendChip
              after={after}
              upWhenAfter={false}
              beforeText="climbing"
              afterText="-90%"
            />
          }
        />
        <StatTile
          label="Accuracy"
          value={Math.round(accuracy)}
          unit="%"
          trend={
            <TrendChip
              after={after}
              beforeText="error-prone"
              afterText="+27%"
            />
          }
        />
        <StatTile
          label="Revenue recovered"
          value={`$${Math.round(revenue).toLocaleString("en-US")}`}
          unit="/mo"
          trend={
            <TrendChip after={after} beforeText="leaking" afterText="+$8.4k" />
          }
        />
      </div>

      {/* Middle: progress bars */}
      <div className="mt-7 flex flex-col gap-6 border-t border-white/10 pt-7">
        <BarRow
          label="Lead response time"
          valueText={formatResponseTime(responseHours)}
          pct={after ? 96 : 8}
          after={after}
        />
        <BarRow
          label="Response consistency"
          valueText={`${Math.round(consistency)}%`}
          pct={after ? 92 : 34}
          after={after}
        />
      </div>

      {/* Bottom: mini bar chart + radial coverage ring */}
      <div className="mt-7 grid grid-cols-[1fr_auto] items-end gap-8 border-t border-white/10 pt-7">
        <MiniBarChart after={after} />
        <CoverageRing after={after} />
      </div>
    </div>
  );
}
