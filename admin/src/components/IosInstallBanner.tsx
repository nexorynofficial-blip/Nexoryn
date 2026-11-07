import { useState } from "react";
import { Share, X } from "lucide-react";
import { isIos, isStandalone } from "../hooks/usePush";

const DISMISSED_KEY = "nexoryn-admin-ios-banner-dismissed";

/**
 * iOS only delivers push to a PWA added to the Home Screen, and only after
 * it's opened from that icon (not a Safari tab) — there's no API to trigger
 * the "Add to Home Screen" step itself, so this just explains the two taps.
 * Shown only on iOS Safari, when not already running standalone, and not
 * dismissed before.
 */
export function IosInstallBanner() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISSED_KEY) === "1";
    } catch {
      return false;
    }
  });

  if (!isIos() || isStandalone() || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Private browsing or storage disabled — it just reappears next
      // visit, which is a minor inconvenience, not a broken feature.
    }
  };

  return (
    <div className="relative mb-4 flex items-start gap-3 rounded-xl border border-accent-from/30 bg-accent-from/5 p-4 text-sm text-white/80">
      <Share className="mt-0.5 h-4 w-4 shrink-0 text-accent-from" />
      <div className="flex-1">
        <p className="font-medium text-white">Get push notifications on this iPhone/iPad</p>
        <p className="mt-1 text-xs leading-relaxed text-white/50">
          iOS only allows notifications for apps added to the Home Screen. Tap the{" "}
          <Share className="inline h-3 w-3 align-[-1px]" aria-label="Share" /> Share button in Safari's toolbar,
          choose <strong className="text-white/70">Add to Home Screen</strong>, then open Nexoryn Admin from the
          icon it creates. You'll be able to turn on notifications from there.
        </p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 text-white/30 transition hover:text-white/60"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
