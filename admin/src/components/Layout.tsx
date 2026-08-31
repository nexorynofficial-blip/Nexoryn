import {
  LayoutDashboard,
  Briefcase,
  Layers,
  MessageSquareQuote,
  Users,
  HelpCircle,
  Inbox,
  Wallet,
  FolderGit2,
  LogOut,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { AmbientBackground } from "./AmbientBackground";

const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/projects", label: "Projects", icon: Briefcase },
  { to: "/services", label: "Services", icon: Layers },
  { to: "/reviews", label: "Reviews", icon: MessageSquareQuote },
  { to: "/team", label: "Team", icon: Users },
  { to: "/faqs", label: "FAQs", icon: HelpCircle },
  { to: "/contact-submissions", label: "Contact Inbox", icon: Inbox },
  { to: "/finance", label: "Finance", icon: Wallet },
  { to: "/internal-projects", label: "Internal Projects", icon: FolderGit2 },
];

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="relative flex min-h-screen bg-night">
      <AmbientBackground />

      <aside className="relative z-10 flex w-60 shrink-0 flex-col border-r border-border-subtle bg-panel/50 p-4 backdrop-blur-sm">
        <div className="mb-6 px-2">
          <span className="font-heading text-lg font-bold tracking-tight text-white">
            NEX<span className="text-accent-from">ORYN</span>
          </span>
          <p className="text-[11px] uppercase tracking-wide text-white/30">Admin</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
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
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border-subtle pt-4">
          <p className="truncate px-2 text-xs text-white/40">{user?.email}</p>
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
