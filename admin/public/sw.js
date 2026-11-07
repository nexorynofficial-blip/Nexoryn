// Nexoryn Admin service worker. Served at /cfokp/sw.js, which scopes it to
// /cfokp/* by default (a service worker's scope is its own directory and
// everything below it, unless Service-Worker-Allowed widens that) — it never
// sees, and can never affect, requests to the public marketing site at the
// site root.
//
// Deliberately does NOT cache anything or intercept fetch — this exists only
// to receive push messages while the app isn't the focused tab/window, and to
// focus or open the app when a notification is clicked. Admin data changes
// too often for a stale-while-revalidate cache to be worth the complexity
// (and the risk of showing an admin a cached finance figure).

self.addEventListener("install", () => {
  // No assets to pre-cache — move to "activated" immediately rather than
  // waiting for every open tab to close first.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    // Not JSON — show it as plain text rather than silently dropping it.
    payload = { title: "Nexoryn Admin", body: event.data.text() };
  }

  const title = payload.title || "Nexoryn Admin";
  const options = {
    body: payload.body || "",
    icon: "/cfokp/nexoryn-logo.png",
    badge: "/cfokp/nexoryn-logo.png",
    // Same tag + event type replaces an earlier, still-unread notification
    // of the same kind in the OS tray instead of stacking duplicates —
    // useful since notify() can fire for the same kind of event repeatedly
    // (e.g. several finance approvals in a row).
    tag: payload.tag || "nexoryn-notification",
    data: { linkUrl: payload.linkUrl || "/" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const linkUrl = event.notification.data?.linkUrl || "/";
  // Resolve against this service worker's own scope (/cfokp/), so linkUrl
  // can stay a short app-relative path ("/finance") rather than needing the
  // full origin baked into every notify() call.
  const targetUrl = new URL(linkUrl.replace(/^\//, ""), self.registration.scope).href;

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      // Reuse an already-open admin tab/window if there is one, rather than
      // opening a second — focus it and navigate to the right page.
      for (const win of windows) {
        if ("focus" in win) {
          await win.focus();
          if ("navigate" in win) await win.navigate(targetUrl).catch(() => {});
          return;
        }
      }
      await self.clients.openWindow(targetUrl);
    })(),
  );
});
