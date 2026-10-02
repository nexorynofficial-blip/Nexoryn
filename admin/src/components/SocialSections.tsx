import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Check, EyeOff, Pencil, ShieldAlert, X } from "lucide-react";
import type { ReactNode } from "react";
import { Button, Card } from "./ui";

// ── Data shapes pushed by the Social Agent ──────────────────────────────
// Only the fields the agent always sends are required. `suggested_reply` and
// the ids are optional: until the agent starts producing them an item renders
// as plain information, with no action buttons.

export interface SocialComment {
  comment_id?: string;
  post_id?: string;
  post_title: string;
  comment_text: string;
  author: string;
  time_since: string;
  suggested_reply?: string;
}

export interface SocialPost {
  post_id?: string;
  title: string;
  engagement_score?: number;
  reactions?: number;
  comments?: number;
  posted_ago?: string;
}

// The agent's field names differ from the ones this page was first written
// against (text / sender / reply_suggestion vs message_text / author /
// suggested_reply); both are accepted so either end can change without
// breaking the other.
export interface SocialDmReply {
  dm_id?: string;
  text?: string;
  message_text?: string;
  theme?: string;
  sender?: string;
  author?: string;
  time_since?: string;
  reply_suggestion?: string;
  suggested_reply?: string;
}

export interface SocialSummaryData {
  timestamp: string;
  status: "healthy" | "action_needed";
  message: string;
  unanswered_comments: SocialComment[];
  low_engagement_posts: SocialPost[];
  dm_themes: Record<string, number>;
  dm_replies?: SocialDmReply[];
  recommendations: string[];
  total_action_items: number;
}

export type ReplyAction = "approve" | "edit" | "reject" | "spam" | "hide" | "leave";
export type Decision = { action: ReplyAction; edited_text: string | null };
export type Decisions = Record<string, Decision>;

export interface ActionTarget {
  kind: "comment" | "dm";
  id: string;
  reply: string;
}

type Submit = (target: ActionTarget, action: ReplyAction, editedText?: string) => Promise<void>;

const ACTIONS: { action: ReplyAction; label: string; icon: ReactNode; tone: string }[] = [
  { action: "approve", label: "Approve", icon: <Check className="h-3.5 w-3.5" />, tone: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20" },
  { action: "edit", label: "Edit", icon: <Pencil className="h-3.5 w-3.5" />, tone: "border-sky-500/30 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20" },
  { action: "reject", label: "Reject", icon: <X className="h-3.5 w-3.5" />, tone: "border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20" },
  { action: "spam", label: "Spam", icon: <ShieldAlert className="h-3.5 w-3.5" />, tone: "border-orange-500/30 bg-orange-500/10 text-orange-300 hover:bg-orange-500/20" },
  { action: "hide", label: "Hide", icon: <EyeOff className="h-3.5 w-3.5" />, tone: "border-white/10 bg-white/5 text-white/60 hover:bg-white/10" },
  { action: "leave", label: "Leave", icon: <ArrowRight className="h-3.5 w-3.5" />, tone: "border-white/10 bg-white/5 text-white/60 hover:bg-white/10" },
];

const DONE_LABEL: Record<ReplyAction, string> = {
  approve: "Approved",
  edit: "Edited & approved",
  reject: "Rejected",
  spam: "Marked as spam",
  hide: "Hidden",
  leave: "Left for later",
};

// ── Edit modal ──────────────────────────────────────────────────────────

const MAX_REPLY = 280;

function EditReplyModal({
  initial,
  saving,
  onSave,
  onCancel,
}: {
  initial: string;
  saving: boolean;
  onSave: (text: string) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState(initial);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => ref.current?.focus(), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel, saving]);

  const trimmed = text.trim();
  // Portalled for the same reason as AssetPicker: Card's backdrop-blur would
  // otherwise pin a fixed overlay to the card instead of the viewport.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={saving ? undefined : onCancel}>
      <Card className="w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Edit reply">
        <h3 className="text-base font-semibold text-white">Edit Reply</h3>
        <textarea
          ref={ref}
          value={text}
          maxLength={MAX_REPLY}
          onChange={(e) => setText(e.target.value)}
          className="mt-4 min-h-[140px] w-full resize-y rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition focus:border-accent-from/60"
        />
        <p className="mt-1 text-right text-xs text-white/40" aria-live="polite">
          {text.length}/{MAX_REPLY}
        </p>
        <div className="mt-4 flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => onSave(trimmed)} loading={saving} disabled={!trimmed}>
            Save &amp; Approve
          </Button>
        </div>
      </Card>
    </div>,
    document.body,
  );
}

// ── A suggested reply with its six action buttons ───────────────────────

function SuggestedReply({
  target,
  decision,
  onSubmit,
}: {
  target: ActionTarget;
  decision?: Decision;
  onSubmit: Submit;
}) {
  const [busy, setBusy] = useState<ReplyAction | null>(null);
  const [editing, setEditing] = useState(false);

  const run = async (action: ReplyAction, editedText?: string) => {
    setBusy(action);
    try {
      await onSubmit(target, action, editedText);
      setEditing(false);
    } finally {
      setBusy(null);
    }
  };

  const shownReply = decision?.action === "edit" && decision.edited_text ? decision.edited_text : target.reply;

  return (
    <div className="mt-3">
      <div className="rounded-lg border border-accent-from/25 bg-accent-from/5 px-3 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-accent-to">Suggested reply</p>
        <p className="mt-1 text-sm text-white/80">{shownReply}</p>
      </div>

      {decision ? (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-300">
          <Check className="h-3.5 w-3.5" /> {DONE_LABEL[decision.action]}
        </p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Reply actions">
          {ACTIONS.map(({ action, label, icon, tone }) => (
            <button
              key={action}
              type="button"
              disabled={busy !== null}
              onClick={() => (action === "edit" ? setEditing(true) : run(action))}
              className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${tone}`}
            >
              {busy === action ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                icon
              )}
              {label}
            </button>
          ))}
        </div>
      )}

      {editing && (
        <EditReplyModal
          initial={target.reply}
          saving={busy === "edit"}
          onSave={(text) => run("edit", text)}
          onCancel={() => setEditing(false)}
        />
      )}
    </div>
  );
}

// ── Sections ────────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="p-5">
      <h2 className="mb-4 text-sm font-semibold text-white">{title}</h2>
      {children}
    </Card>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border border-dashed border-white/10 px-4 py-6 text-center text-sm text-white/50">{children}</p>;
}

export function UnansweredComments({
  items,
  decisions,
  onSubmit,
}: {
  items: SocialComment[];
  decisions: Decisions;
  onSubmit: Submit;
}) {
  return (
    <SectionCard title={`🔴 Unanswered Comments (${items.length})`}>
      {items.length === 0 ? (
        <Empty>✅ All comments answered</Empty>
      ) : (
        <ul className="space-y-3">
          {items.map((c, i) => (
            <li key={c.comment_id ?? `${c.post_id}-${i}`} className="rounded-lg border border-white/10 p-3">
              <p className="text-sm font-semibold text-white">{c.post_title}</p>
              <p className="mt-1 text-sm text-white/80">&ldquo;{c.comment_text}&rdquo;</p>
              <p className="mt-1 text-xs text-white/40">
                {c.author} • {c.time_since}
              </p>
              {c.suggested_reply && c.comment_id && (
                <SuggestedReply
                  target={{ kind: "comment", id: c.comment_id, reply: c.suggested_reply }}
                  decision={decisions[c.comment_id]}
                  onSubmit={onSubmit}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

export function LowEngagementPosts({ items }: { items: SocialPost[] }) {
  return (
    <SectionCard title={`📉 Low-Engagement Posts (${items.length})`}>
      {items.length === 0 ? (
        <Empty>✅ All posts performing well</Empty>
      ) : (
        <ul className="space-y-3">
          {items.map((p, i) => (
            <li key={p.post_id ?? i} className="rounded-lg border border-white/10 p-3">
              <p className="text-sm font-semibold text-white">{p.title}</p>
              <p className="mt-1 text-sm text-white/70">
                {p.reactions ?? 0} reactions, {p.comments ?? 0} comments
              </p>
              {p.posted_ago && <p className="mt-1 text-xs text-white/40">Posted {p.posted_ago}</p>}
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

export function DMThemes({
  themes,
  replies,
  decisions,
  onSubmit,
}: {
  themes: Record<string, number>;
  replies: SocialDmReply[];
  decisions: Decisions;
  onSubmit: Submit;
}) {
  const entries = Object.entries(themes).sort((a, b) => b[1] - a[1]);
  return (
    <SectionCard title="💬 Common DM Themes">
      {entries.length === 0 ? (
        <Empty>No unusual DM patterns detected</Empty>
      ) : (
        <ul className="space-y-3">
          {entries.map(([name, pct]) => (
            <li key={name}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-white/80">{name}</span>
                <span className="text-white/50">{pct}%</span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-white/10"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={name}
              >
                <div className="h-full rounded-full bg-gradient-to-r from-accent-from to-accent-to" style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {replies.length > 0 && (
        <ul className="mt-5 space-y-3 border-t border-white/10 pt-4">
          {replies.map((d, i) => {
            const text = d.text ?? d.message_text ?? "";
            const who = d.sender ?? d.author;
            const reply = d.reply_suggestion ?? d.suggested_reply;
            return (
              <li key={d.dm_id ?? i} className="rounded-lg border border-white/10 p-3">
                <p className="text-sm text-white/80">&ldquo;{text}&rdquo;</p>
                {(d.theme || who || d.time_since) && (
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/40">
                    {d.theme && <span className="rounded-full bg-white/10 px-2 py-0.5 text-white/60">{d.theme}</span>}
                    {[who, d.time_since].filter(Boolean).join(" • ")}
                  </p>
                )}
                {reply && d.dm_id && (
                  <SuggestedReply
                    target={{ kind: "dm", id: d.dm_id, reply }}
                    decision={decisions[d.dm_id]}
                    onSubmit={onSubmit}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}

export function Recommendations({ items }: { items: string[] }) {
  return (
    <SectionCard title="🎯 Today's Recommendations">
      {items.length === 0 ? (
        <Empty>✅ No action items for today</Empty>
      ) : (
        <ol className="space-y-2">
          {items.map((r, i) => (
            <li key={i} className="flex gap-3 text-sm text-white/80">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-from/15 text-[11px] font-semibold text-accent-to">
                {i + 1}
              </span>
              {/* The agent sometimes numbers its own lines ("1. Reply to..."). */}
              <span>{r.replace(/^\s*\d+[.)]\s*/, "")}</span>
            </li>
          ))}
        </ol>
      )}
    </SectionCard>
  );
}
