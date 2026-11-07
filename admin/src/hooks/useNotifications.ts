import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../lib/api";
import type { AppNotification, NotificationsResponse } from "../types";

// Push covers "right now, while you weren't looking at the tab"; this poll
// covers everything else — a tab left open, or a device with push denied.
const POLL_MS = 30_000;

export function useNotifications() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { pathname } = useLocation();

  const load = useCallback(() => {
    api
      .get<NotificationsResponse>("/api/v1/admin/notifications?limit=20")
      .then((r) => {
        setItems(r.items);
        setUnreadCount(r.unreadCount);
      })
      .catch(() => {
        // A failed poll just leaves the last-known feed showing — not worth
        // surfacing an error banner over.
      });
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  // A navigation is as good a moment as any to catch up, same idea as the
  // sidebar's own pending-count badge (Layout.tsx's usePendingCount).
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const markAllRead = useCallback(async () => {
    setUnreadCount(0);
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await api.post("/api/v1/admin/notifications/read-all").catch(() => {});
  }, []);

  return { items, unreadCount, reload: load, markAllRead };
}
