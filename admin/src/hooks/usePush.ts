import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";

/** VAPID public keys arrive base64url-encoded (RFC 4648 §5); pushManager.
 *  subscribe() needs them as a raw byte array. Typed as BufferSource (not
 *  Uint8Array) because TS's DOM lib widens Uint8Array's backing buffer type
 *  to include SharedArrayBuffer, which applicationServerKey's own type
 *  doesn't accept — an ordinary same-origin Uint8Array works fine at runtime
 *  either way, this only resolves a type-checking mismatch between two DOM
 *  lib definitions. */
function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0))) as BufferSource;
}

export function isIos(): boolean {
  // iPadOS 13+ reports as "Macintosh" with touch support, not "iPad" — the
  // maxTouchPoints check catches that case too.
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

/** True once launched from the Home Screen icon (or installed on desktop) —
 *  not just "the manifest exists". iOS specifically requires this before a
 *  permission prompt will do anything at all. */
export function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function pushSupported(): boolean {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

/** Registers the service worker once, app-wide — independent of whether push
 *  is ever enabled, since the bell's unread badge works without it; only an
 *  actual push notification needs the worker running. */
export function useServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const base = import.meta.env.BASE_URL;
    navigator.serviceWorker.register(`${base}sw.js`, { scope: base }).catch((err) => {
      console.error("Service worker registration failed:", err);
    });
  }, []);
}

function guessDeviceLabel(): string {
  const ua = navigator.userAgent;
  const platform = /iphone/i.test(ua)
    ? "iPhone"
    : /ipad/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
      ? "iPad"
      : /android/i.test(ua)
        ? "Android"
        : /mac/i.test(ua)
          ? "Mac"
          : /win/i.test(ua)
            ? "Windows"
            : "Device";
  const browser = /edg\//i.test(ua)
    ? "Edge"
    : /crios|chrome/i.test(ua)
      ? "Chrome"
      : /firefox/i.test(ua)
        ? "Firefox"
        : /safari/i.test(ua)
          ? "Safari"
          : "Browser";
  return `${platform} — ${browser}`;
}

export type PushPermission = "default" | "denied" | "granted" | "unsupported";

/**
 * Enable/disable push for *this* browser install. Subscribing must be called
 * from a real click handler — browsers (and iOS specifically, per Apple's
 * own guidance) refuse Notification.requestPermission() otherwise.
 */
export function usePush() {
  const [permission, setPermission] = useState<PushPermission>(() =>
    pushSupported() ? (Notification.permission as PushPermission) : "unsupported",
  );
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Reflects the browser's own state on load (e.g. permission was revoked
  // from browser settings since the last visit, outside this app entirely).
  useEffect(() => {
    if (!pushSupported()) return;
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setSubscribed(Boolean(sub)))
      .catch(() => {});
  }, []);

  const subscribe = useCallback(async () => {
    setError("");
    if (!pushSupported()) {
      setError("Push notifications aren't supported in this browser.");
      return;
    }
    if (isIos() && !isStandalone()) {
      setError("Add this app to your Home Screen first, then open it from there to turn on notifications.");
      return;
    }
    setBusy(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result as PushPermission);
      if (result !== "granted") {
        setError(result === "denied" ? "Notifications were blocked in your browser." : "Permission wasn't granted.");
        return;
      }

      const { publicKey } = await api.get<{ publicKey: string | null }>("/api/v1/push/vapid-public-key");
      if (!publicKey) {
        setError("Push notifications aren't configured on the server yet.");
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      const json = subscription.toJSON() as { endpoint?: string; keys?: { p256dh: string; auth: string } };
      if (!json.endpoint || !json.keys) throw new Error("Subscription was missing required fields");

      await api.post("/api/v1/admin/push/subscribe", {
        endpoint: json.endpoint,
        keys: json.keys,
        deviceLabel: guessDeviceLabel(),
      });
      setSubscribed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not enable notifications");
    } finally {
      setBusy(false);
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();
      if (subscription) {
        await api
          .delete(`/api/v1/admin/push/subscribe?endpoint=${encodeURIComponent(subscription.endpoint)}`)
          .catch(() => {});
        await subscription.unsubscribe();
      }
      setSubscribed(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not disable notifications");
    } finally {
      setBusy(false);
    }
  }, []);

  return {
    supported: pushSupported(),
    permission,
    subscribed,
    busy,
    error,
    subscribe,
    unsubscribe,
  };
}
