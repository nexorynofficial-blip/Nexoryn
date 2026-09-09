import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Briefcase,
  Layers,
  MessageSquareQuote,
  Users,
  HelpCircle,
  Inbox,
  Wallet,
  GitPullRequestArrow,
  FolderGit2,
  UserCog,
  LogOut,
} from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import type { DebtRequests } from "../types";
import { AmbientBackground } from "./AmbientBackground";

// `ownerOnly` mirrors requireRole("owner") on the API (backend
// src/middleware/auth.ts). The server is what actually enforces this — hiding
// the link only spares a content-only account from clicking through to a
// guaranteed "no access" page.
const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/projects", label: "Projects", icon: Briefcase },
  { to: "/services", label: "Services", icon: Layers },
  { to: "/reviews", label: "Reviews", icon: MessageSquareQuote },
  { to: "/team", label: "Team", icon: Users },
  { to: "/faqs", label: "FAQs", icon: HelpCircle },
  { to: "/contact-submissions", label: "Contact Inbox", icon: Inbox, ownerOnly: true },
  { to: "/finance", label: "Finance", icon: Wallet, ownerOnly: true },
  {
    to: "/requests",
    label: "Requests",
    icon: GitPullRequestArrow,
    badge: "pending" as const,
    ownerOnly: true,
  },
  { to: "/internal-projects", label: "Internal Projects", icon: FolderGit2 },
];

/** Count of debt approvals waiting on this admin. Re-read on every navigation
 *  so approving something on the Requests page clears the badge immediately. */
function usePendingCount() {
  const [count, setCount] = useState(0);
  const { pathname } = useLocation();

  useEffect(() => {
    let alive = true;
    api
      .get<DebtRequests>("/api/v1/admin/finance/requests")
      .then((r) => alive && setCount(r.incoming.length))
      .catch(() => {
        // A badge is not worth surfacing an error for.
      });
    return () => {
      alive = false;
    };
  }, [pathname]);

  return count;
}

export default function Layout() {
  const { user, logout } = useAuth();
  const pending = usePendingCount();

  return (
    // h-screen + overflow-hidden (not min-h-screen) pins the whole layout to
    // exactly the viewport height. Without that, the window itself grows with
    // tall page content and scrolls as a whole — which drags this aside's
    // account/logout block down with it, off the bottom of the screen. With
    // the height pinned, only `main` (overflow-y-auto below) scrolls, and the
    // aside stays exactly one viewport tall, so the account block anchored to
    // its bottom via flex never moves.
    <div className="relative flex h-screen overflow-hidden bg-night">
      <AmbientBackground />

      <aside className="relative z-10 flex w-60 shrink-0 flex-col border-r border-border-subtle bg-panel/50 p-4 backdrop-blur-sm">
        <div className="mb-6 px-2">
          <span className="font-heading text-lg font-bold tracking-tight text-white">
            NEX<span className="text-accent-from">ORYN</span>
          </span>
          <p className="text-[11px] uppercase tracking-wide text-white/30">Admin</p>
        </div>

        {/* overflow-y-auto here (not just flex-1) means a nav list too long
            for the viewport scrolls on its own, instead of pushing the
            account/logout block below it past the bottom of the screen. */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {NAV.filter((item) => !item.ownerOnly || user?.role === "owner").map(({ to, label, icon: Icon, end, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  isActive ? "bg-accent-from/15 text-accent-to" : "text-white/60 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {badge === "pending" && pending > 0 && (
                <span className="rounded-full bg-accent-from px-1.5 py-0.5 text-[10px] font-semibold text-night">
                  {pending}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="shrink-0 border-t border-border-subtle pt-4">
          <NavLink
            to="/account"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                isActive ? "bg-accent-from/15 text-accent-to" : "text-white/60 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <UserCog className="h-4 w-4 shrink-0" />
            <span className="min-w-0 flex-1 truncate">{user?.name ?? "My Account"}</span>
          </NavLink>
          <p className="truncate px-3 pt-1 text-[11px] text-white/30">{user?.email}</p>
          <button
            onClick={logout}
            className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      <main className="relative z-10 flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
