import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Braces,
  Brain,
  Check,
  Database,
  GitFork,
  Globe,
  Hash,
  Layers,
  MemoryStick,
  MessageSquare,
  MessagesSquare,
  PenLine,
  Send,
  Sparkles,
  Split,
  Ticket,
  Zap,
} from "lucide-react";
import { useMediaQuery } from "../../hooks/useMediaQuery";

/*
 * A live, n8n-style editor running an AI customer-support workflow.
 *
 * Everything is drawn in one SVG (viewBox 1200 x 620) so it scales cleanly to
 * whatever screen it sits in. A run is a scripted sequence of events: a chat
 * message arrives, each node on the path turns "running" then "succeeded",
 * data flows along each connection, and the reply lands in the chat panel.
 * Runs cycle through four scenarios, one per branch of the router. The loop
 * only runs while the editor is on screen.
 */

const W = 64; // node size
const AGENT_W = 180;

const NODES = {
  trigger: { x: 30, y: 268, label: "When chat message", sub: "received", Icon: MessageSquare, color: "#e5e7eb", trigger: true },
  normalize: { x: 140, y: 268, label: "Normalize Input", sub: "manual", Icon: PenLine, color: "#a78bfa" },
  session: { x: 250, y: 268, label: "Load Session", sub: "get rows", Icon: Database, color: "#fb923c" },
  agent: { x: 365, y: 268, w: AGENT_W, label: "AI Agent", sub: "Classify intent", Icon: Bot, color: "#e5e7eb" },
  route: { x: 610, y: 268, label: "Route by Intent", sub: "mode: Rules", Icon: Split, color: "#60a5fa" },
  order: { x: 730, y: 50, label: "Get Shopify Order", sub: "GET /orders", Icon: Globe, color: "#818cf8" },
  summary: { x: 845, y: 50, label: "Summarize Order", sub: "code", Icon: Braces, color: "#fbbf24" },
  generate: { x: 960, y: 50, label: "Generate Reply", sub: "LLM chain", Icon: Sparkles, color: "#f472b6" },
  eligible: { x: 730, y: 190, label: "Check Eligibility", sub: "if", Icon: GitFork, color: "#34d399" },
  approve: { x: 845, y: 190, label: "Request Approval", sub: "Slack", Icon: Hash, color: "#e879f9" },
  faq: { x: 730, y: 340, label: "Answer FAQ", sub: "knowledge base", Icon: MessagesSquare, color: "#38bdf8" },
  ticket: { x: 730, y: 480, label: "Create Ticket", sub: "Zendesk", Icon: Ticket, color: "#f87171" },
  alert: { x: 845, y: 480, label: "Alert Team", sub: "Slack", Icon: Hash, color: "#e879f9" },
  reply: { x: 1095, y: 268, label: "Send Reply", sub: "respond to chat", Icon: Send, color: "#4ade80" },
};

// The AI Agent's attached tools, drawn as circles beneath it.
const SUBNODES = {
  model: { x: 400, y: 440, label: "Chat Model", Icon: Brain },
  memory: { x: 455, y: 440, label: "Memory", Icon: MemoryStick },
  vector: { x: 510, y: 440, label: "Knowledge", Icon: Layers },
};

const ROUTE_OUTPUTS = ["Order status", "Refund", "FAQ", "Complaint"];
const routeOutY = (i) => NODES.route.y + 11 + i * 14;

const out = (id, i) => {
  const n = NODES[id];
  return [n.x + (n.w ?? W), id === "route" ? routeOutY(i) : n.y + W / 2];
};
const inp = (id) => [NODES[id].x, NODES[id].y + W / 2];

const EDGES = [
  ["trigger", "normalize"],
  ["normalize", "session"],
  ["session", "agent"],
  ["agent", "route"],
  ["route", "order", 0],
  ["order", "summary"],
  ["summary", "generate"],
  ["generate", "reply"],
  ["route", "eligible", 1],
  ["eligible", "approve"],
  ["approve", "reply"],
  ["route", "faq", 2],
  ["faq", "reply"],
  ["route", "ticket", 3],
  ["ticket", "alert"],
  ["alert", "reply"],
].map(([from, to, port]) => {
  const [x1, y1] = out(from, port);
  const [x2, y2] = inp(to);
  const dx = Math.max(30, (x2 - x1) / 2);
  return {
    id: `${from}>${to}`,
    d: `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`,
    // Bezier midpoint, for the "1 item" label
    mid: [(x1 + 3 * (x1 + dx) + 3 * (x2 - dx) + x2) / 8, (y1 + 3 * y1 + 3 * y2 + y2) / 8],
  };
});

const SCENARIOS = [
  {
    message: "Hi! Where's my order #4821?",
    path: ["order", "summary", "generate"],
    tools: ["model", "memory"],
    reply: "Your order #4821 shipped today with DHL and arrives on Thursday. 📦",
  },
  {
    message: "I'd like a refund for order #3310",
    path: ["eligible", "approve"],
    tools: ["model", "memory"],
    reply: "All set. Your refund for #3310 is approved and will land in 3–5 days.",
  },
  {
    message: "Do you ship to Canada?",
    path: ["faq"],
    tools: ["model", "vector"],
    reply: "Yes! We ship to Canada in 4–7 business days, fully tracked.",
  },
  {
    message: "My package arrived damaged 😞",
    path: ["ticket", "alert"],
    tools: ["model", "memory"],
    reply: "So sorry about that. Ticket #7712 is open and a teammate will reach out within the hour.",
  },
];

const IDLE = { running: null, done: [], flowing: null, edgesDone: [], tools: [], chat: [], status: "idle", ms: 0 };

// Time each node spends "running"
const runTime = (id) => (id === "agent" ? 1500 : id === "trigger" ? 500 : 650);
const FLOW_TIME = 380;

function buildTimeline(scenario) {
  const steps = ["trigger", "normalize", "session", "agent", "route", ...scenario.path, "reply"];
  const events = [];
  let t = 0;
  const at = (dt, fn) => {
    t += dt;
    events.push([t, fn]);
  };

  at(300, (s) => ({ ...s, status: "running", chat: [{ from: "user", text: scenario.message }] }));
  steps.forEach((id, i) => {
    at(i === 0 ? 400 : 0, (s) => ({
      ...s,
      running: id,
      flowing: null,
      tools: id === "agent" ? scenario.tools : s.tools,
      chat: id === "reply" ? [...s.chat, { from: "bot", typing: true }] : s.chat,
    }));
    at(runTime(id), (s) => ({ ...s, running: null, done: [...s.done, id], tools: id === "agent" ? [] : s.tools }));
    const next = steps[i + 1];
    if (next) {
      const edgeId = `${id}>${next}`;
      at(0, (s) => ({ ...s, flowing: edgeId }));
      at(FLOW_TIME, (s) => ({ ...s, flowing: null, edgesDone: [...s.edgesDone, edgeId] }));
    }
  });
  const total = t;
  at(0, (s) => ({
    ...s,
    status: "success",
    // The animation is slowed down to be watchable; report a realistic run
    // time (about a quarter of it).
    ms: total,
    chat: [...s.chat.filter((c) => !c.typing), { from: "bot", text: scenario.reply }],
  }));
  at(3600, () => IDLE);
  return { events, duration: t + 500 };
}

function useRunner(enabled) {
  const [state, setState] = useState(IDLE);
  const [scenarioIdx, setScenarioIdx] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setState(IDLE);
      return undefined;
    }
    const { events, duration } = buildTimeline(SCENARIOS[scenarioIdx]);
    const timers = events.map(([t, fn]) => setTimeout(() => setState(fn), t));
    timers.push(setTimeout(() => setScenarioIdx((i) => (i + 1) % SCENARIOS.length), duration));
    return () => timers.forEach(clearTimeout);
  }, [enabled, scenarioIdx]);

  return state;
}

function Node({ id, state }) {
  const n = NODES[id];
  const w = n.w ?? W;
  const running = state.running === id;
  const done = state.done.includes(id);
  const stroke = running ? "#ff7a1a" : done ? "#22c55e" : "#454545";
  const { Icon } = n;

  return (
    <g>
      {running && (
        <rect
          x={n.x - 5}
          y={n.y - 5}
          width={w + 10}
          height={W + 10}
          rx={14}
          fill="none"
          stroke="#ff7a1a"
          strokeOpacity="0.35"
          strokeWidth="6"
          className="n8n-pulse"
        />
      )}
      <rect
        x={n.x}
        y={n.y}
        width={w}
        height={W}
        rx={10}
        fill="#2a2a2a"
        stroke={stroke}
        strokeWidth={running || done ? 2 : 1.25}
        style={{ transition: "stroke 300ms" }}
      />
      {n.trigger && <Zap x={n.x - 20} y={n.y + W / 2 - 7} width={14} height={14} color="#ff7a1a" fill="#ff7a1a" />}

      {n.w ? (
        <>
          <Icon x={n.x + 16} y={n.y + 18} width={28} height={28} color={n.color} strokeWidth={1.75} />
          <text x={n.x + 56} y={n.y + 30} fill="#f5f5f5" fontSize="13" fontWeight="700">
            {n.label}
          </text>
          <text x={n.x + 56} y={n.y + 46} fill="#9ca3af" fontSize="10">
            {n.sub}
          </text>
        </>
      ) : (
        <>
          <Icon x={n.x + 18} y={n.y + 18} width={28} height={28} color={n.color} strokeWidth={1.75} />
          <text x={n.x + W / 2} y={n.y + W + 16} fill="#f5f5f5" fontSize="10.5" fontWeight="700" textAnchor="middle">
            {n.label}
          </text>
          <text x={n.x + W / 2} y={n.y + W + 29} fill="#8b8b8b" fontSize="9" textAnchor="middle">
            {n.sub}
          </text>
        </>
      )}

      {/* Ports */}
      {!n.trigger && <circle cx={n.x} cy={n.y + W / 2} r="4" fill="#5a5a5a" />}
      {id === "route"
        ? ROUTE_OUTPUTS.map((_, i) => <circle key={i} cx={n.x + w} cy={routeOutY(i)} r="3.5" fill="#5a5a5a" />)
        : id !== "reply" && <circle cx={n.x + w} cy={n.y + W / 2} r="4" fill="#5a5a5a" />}

      {/* Status badge */}
      {running && (
        <g className="n8n-spin" style={{ transformOrigin: `${n.x + w - 10}px ${n.y + 10}px` }}>
          <circle cx={n.x + w - 10} cy={n.y + 10} r="6" fill="none" stroke="#ff7a1a" strokeWidth="2" strokeDasharray="22 12" />
        </g>
      )}
      {done && (
        <g>
          <circle cx={n.x + w - 10} cy={n.y + 10} r="7" fill="#22c55e" />
          <Check x={n.x + w - 15} y={n.y + 5} width={10} height={10} color="#0b0b0b" strokeWidth={3.5} />
        </g>
      )}
    </g>
  );
}

function SubNode({ id, active }) {
  const s = SUBNODES[id];
  const { Icon } = s;
  return (
    <g>
      <path
        d={`M${s.x},${NODES.agent.y + W} L${s.x},${s.y - 22}`}
        stroke={active ? "#ff7a1a" : "#4a4a4a"}
        strokeWidth="1.5"
        strokeDasharray="4 4"
        className={active ? "n8n-flow" : undefined}
      />
      <circle cx={s.x} cy={s.y} r="22" fill="#2a2a2a" stroke={active ? "#ff7a1a" : "#454545"} strokeWidth={active ? 2 : 1.25} style={{ transition: "stroke 300ms" }} />
      <Icon x={s.x - 10} y={s.y - 10} width={20} height={20} color="#d4d4d4" strokeWidth={1.75} />
      <text x={s.x} y={s.y + 38} fill="#9ca3af" fontSize="9" textAnchor="middle">
        {s.label}
      </text>
    </g>
  );
}

export default function WorkflowDemo() {
  const rootRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const state = useRunner(visible);

  // Phones: the whole 1200-wide canvas would be unreadably small, so show a
  // zoomed-in window and pan it to follow the node that's running.
  const zoomed = useMediaQuery("(max-width: 639px)");
  const VIEW_W = 440;
  const focusId = state.running ?? state.done[state.done.length - 1] ?? "trigger";
  const focusX = NODES[focusId].x + (NODES[focusId].w ?? W) / 2;
  const camX = zoomed ? Math.min(Math.max(focusX - VIEW_W / 2, 0), 1200 - VIEW_W) : 0;

  return (
    <div ref={rootRef} className="relative flex h-full w-full flex-col bg-[#141414] font-sans text-white">
      {/* Editor top bar */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#1b1b1b] px-3 md:px-4">
        <div className="flex min-w-0 items-center gap-2 text-[11px] md:text-xs">
          <span className="text-white/40">Nexoryn</span>
          <span className="text-white/25">/</span>
          <span className="truncate font-semibold text-white/90">AI Support Agent</span>
          <span className="hidden rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-white/50 sm:inline">production</span>
        </div>
        <div className="hidden items-center rounded-md bg-black/40 p-0.5 text-[11px] md:flex">
          <span className="rounded bg-white/10 px-3 py-1 font-semibold">Editor</span>
          <span className="px-3 py-1 text-white/45">Executions</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="hidden text-white/40 sm:inline">Saved</span>
          <span className="flex items-center gap-1.5 rounded-full bg-white/[0.06] px-2 py-1">
            <span className="h-3 w-6 rounded-full bg-status-green/80 p-[2px]">
              <span className="block h-2 w-2 translate-x-3 rounded-full bg-white" />
            </span>
            <span className="text-white/80">Active</span>
          </span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative min-h-0 flex-1 bg-[radial-gradient(circle,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:18px_18px]">
        <svg
          viewBox={zoomed ? `0 0 ${VIEW_W} 620` : "0 0 1200 620"}
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 h-full w-full"
          style={{ fontFamily: "inherit" }}
        >
          <g style={{ transform: `translateX(${-camX}px)`, transition: "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)" }}>
          {/* Connections */}
          {EDGES.map((e) => {
            const done = state.edgesDone.includes(e.id);
            return (
              <g key={e.id}>
                <path d={e.d} fill="none" stroke={done ? "#22c55e" : "#4a4a4a"} strokeWidth="2" style={{ transition: "stroke 300ms" }} />
                {state.flowing === e.id && (
                  <path d={e.d} fill="none" stroke="#ff7a1a" strokeWidth="2.5" strokeDasharray="8 10" strokeLinecap="round" className="n8n-flow" />
                )}
                {done && (
                  <text x={e.mid[0]} y={e.mid[1] - 6} fill="#22c55e" fontSize="9" fontWeight="600" textAnchor="middle">
                    1 item
                  </text>
                )}
              </g>
            );
          })}

          {/* Router output labels */}
          {ROUTE_OUTPUTS.map((label, i) => (
            <text key={label} x={NODES.route.x + W + 7} y={routeOutY(i) + 3} fill="#9a9a9a" fontSize="8" stroke="#141414" strokeWidth="3" paintOrder="stroke">
              {label}
            </text>
          ))}

          {Object.keys(SUBNODES).map((id) => (
            <SubNode key={id} id={id} active={state.tools.includes(id)} />
          ))}
          {Object.keys(NODES).map((id) => (
            <Node key={id} id={id} state={state} />
          ))}
          </g>
        </svg>

        {/* Chat panel */}
        <div className="absolute bottom-3 left-3 hidden w-64 overflow-hidden rounded-xl border border-white/[0.08] bg-[#1e1e1e]/95 shadow-2xl sm:block">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2 text-[11px]">
            <span className="font-semibold text-white/85">Chat</span>
            <span className="text-white/35">session #a91f</span>
          </div>
          <div className="flex min-h-[112px] flex-col justify-end gap-2 p-3 text-[11.5px] leading-snug">
            {state.chat.length === 0 && <p className="text-center text-white/30">Waiting for a message…</p>}
            {state.chat.map((c, i) =>
              c.from === "user" ? (
                <p key={i} className="n8n-pop ml-auto max-w-[85%] rounded-lg rounded-br-sm bg-accent-from px-2.5 py-1.5 font-medium text-black">
                  {c.text}
                </p>
              ) : c.typing ? (
                <p key={i} className="n8n-pop flex w-12 gap-1 rounded-lg rounded-bl-sm bg-white/10 px-2.5 py-2">
                  <span className="n8n-dot h-1.5 w-1.5 rounded-full bg-white/60" />
                  <span className="n8n-dot h-1.5 w-1.5 rounded-full bg-white/60 [animation-delay:150ms]" />
                  <span className="n8n-dot h-1.5 w-1.5 rounded-full bg-white/60 [animation-delay:300ms]" />
                </p>
              ) : (
                <p key={i} className="n8n-pop max-w-[90%] rounded-lg rounded-bl-sm bg-white/10 px-2.5 py-1.5 text-white/90">
                  {c.text}
                </p>
              ),
            )}
          </div>
        </div>

        {/* Execution status */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#1e1e1e]/95 px-3 py-2 text-[11px] shadow-xl">
          {state.status === "running" && (
            <>
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent-from" />
              <span className="text-white/80">Executing workflow…</span>
            </>
          )}
          {state.status === "success" && (
            <>
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-status-green">
                <Check className="h-3 w-3 text-black" strokeWidth={3.5} />
              </span>
              <span className="text-white/80">
                Succeeded in <span className="font-semibold text-white">{(state.ms / 4000).toFixed(1)}s</span>
              </span>
            </>
          )}
          {state.status === "idle" && (
            <>
              <span className="h-2 w-2 rounded-full bg-white/30" />
              <span className="text-white/50">Listening for chat messages</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
