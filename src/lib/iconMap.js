// Maps a lucide icon *name* (what the API returns) to the actual component
// (what the static data in src/data/*.js holds directly).
//
// The API stores icons as strings — `{ name: "n8n", icon: "Workflow" }` —
// because JSON can't carry a React component. The static fallback data holds
// the component itself. `resolveIcon` accepts either, so every consumer can
// stay agnostic about which source it is rendering.
//
// The list is explicit rather than `import * as Icons from "lucide-react"`
// so the bundler can still tree-shake: lucide ships ~1600 icons and a
// namespace import would pull all of them into the client bundle.
//
// Generated from the icons actually referenced in src/data/projects.js and
// src/data/services.js. Backend keeps a matching allowlist in
// backend/src/utils/icons.ts — add to both when a new icon starts being used.
import {
  ArrowLeftRight,
  Atom,
  BarChart3,
  Bitcoin,
  Boxes,
  Brain,
  Calculator,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Cloud,
  CloudSun,
  Code2,
  CreditCard,
  Database,
  Download,
  Eye,
  FileCheck,
  FileCode,
  FileText,
  FolderOpen,
  Gauge,
  GitBranch,
  Globe,
  HardDrive,
  Hash,
  Heart,
  Image,
  KeyRound,
  Layers,
  LayoutGrid,
  Link2,
  ListChecks,
  ListTodo,
  Lock,
  Mail,
  Map,
  MessageSquare,
  Network,
  Newspaper,
  Package,
  Paintbrush,
  Radio,
  RefreshCw,
  Rocket,
  Route,
  Scale,
  Search,
  Send,
  Server,
  Shapes,
  Share2,
  Sheet,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Truck,
  Type,
  Wand2,
  Wifi,
  Workflow,
  Zap,
} from "lucide-react";

const ICONS = {
  ArrowLeftRight,
  Atom,
  BarChart3,
  Bitcoin,
  Boxes,
  Brain,
  Calculator,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Cloud,
  CloudSun,
  Code2,
  CreditCard,
  Database,
  Download,
  Eye,
  FileCheck,
  FileCode,
  FileText,
  FolderOpen,
  Gauge,
  GitBranch,
  Globe,
  HardDrive,
  Hash,
  Heart,
  Image,
  KeyRound,
  Layers,
  LayoutGrid,
  Link2,
  ListChecks,
  ListTodo,
  Lock,
  Mail,
  Map,
  MessageSquare,
  Network,
  Newspaper,
  Package,
  Paintbrush,
  Radio,
  RefreshCw,
  Rocket,
  Route,
  Scale,
  Search,
  Send,
  Server,
  Shapes,
  Share2,
  Sheet,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Truck,
  Type,
  Wand2,
  Wifi,
  Workflow,
  Zap,
};

/** Fallback for an unknown or missing icon name — never render nothing. */
export const FALLBACK_ICON = Sparkles;

/**
 * Accepts either a lucide component (static data) or its name (API data)
 * and always returns a renderable component.
 */
export function resolveIcon(icon) {
  if (!icon) return FALLBACK_ICON;
  if (typeof icon === "string") return ICONS[icon] ?? FALLBACK_ICON;
  return icon;
}

export default ICONS;
