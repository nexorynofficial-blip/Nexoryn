// The frontend stores every icon reference (techIcons, workflow steps, tech
// stack entries, service overview icons) as an actual `lucide-react`
// component import — see docs/DATA-MODEL.md §2d. The backend instead stores
// the icon's *string name* and must validate it against a real icon that
// exists, so an admin can't save a typo that silently renders nothing on the
// live site.
//
// Deliberately NOT importing the actual `lucide-react` package here: doing
// so would pull React into this Node backend purely to read its export
// names. Instead this is the exact set of icon names already in use across
// src/data/projects.js and src/data/services.js today (extracted via grep,
// with the one local import alias in projects.js — `Image as ImageIcon` —
// normalized back to its real lucide-react export name, "Image", since this
// is the canonical name going forward). Add to this list if a future admin
// needs an icon the current site doesn't already use — check the name
// exists at https://lucide.dev/icons before adding it.
const KNOWN_ICON_NAMES = new Set([
  "Workflow", "Brain", "ShoppingBag", "Hash", "MessageSquare", "Tag", "Route",
  "CheckCircle2", "Sheet", "Mail", "Database", "Download", "Search",
  "Sparkles", "Send", "RefreshCw", "FileText", "Image", "ClipboardCheck",
  "Rocket", "Code2", "Atom", "CreditCard", "Eye", "Truck", "LayoutGrid",
  "Paintbrush", "Package", "Wand2", "FileCode", "Type", "Server", "Network",
  "Layers", "Zap", "Cloud", "Globe", "KeyRound", "Lock", "ShieldCheck",
  "HardDrive", "GitBranch", "Boxes", "Wifi", "Link2", "Gauge", "Share2",
  "BarChart3", "ListChecks", "Shapes", "Clock", "Radio", "ListTodo",
  "Shield", "FileCheck", "Map", "Heart", "ArrowLeftRight", "CloudSun",
  "Newspaper", "Calendar", "Calculator", "FolderOpen", "Scale", "Bitcoin",
  "PhoneCall", "Bot", "Layout", "AppWindow", "ShoppingCart", "Plug",
  "PenTool", "Palette", "Megaphone", "LayoutTemplate", "Film",
]);

export function isValidIconName(name: string): boolean {
  return KNOWN_ICON_NAMES.has(name);
}
