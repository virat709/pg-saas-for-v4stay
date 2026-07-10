"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: number | null; // millis from server
  type?: string;
  propertyId?: string;
  tenantId?: string;
}

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  unreadByType: Record<string, number>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  unreadCount: 0,
  unreadByType: {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
});

// ── Shared AudioContext singleton ────────────────────────────────────────────
let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (sharedAudioCtx && sharedAudioCtx.state !== "closed") return sharedAudioCtx;
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return null;
    sharedAudioCtx = new Ctx();
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

async function playDing() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") await ctx.resume();

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.45, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(660, now + 0.15);
    gain2.gain.setValueAtTime(0, now + 0.15);
    gain2.gain.linearRampToValueAtTime(0.35, now + 0.17);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.65);
  } catch (e) {
    console.warn("Audio play failed", e);
  }
}

// Eagerly unlock AudioContext on first user interaction
if (typeof window !== "undefined") {
  const unlock = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
    window.removeEventListener("click", unlock);
    window.removeEventListener("keydown", unlock);
    window.removeEventListener("touchstart", unlock);
    window.removeEventListener("scroll", unlock, true);
  };
  window.addEventListener("click", unlock, { once: true });
  window.addEventListener("keydown", unlock, { once: true });
  window.addEventListener("touchstart", unlock, { once: true });
  window.addEventListener("scroll", unlock, { once: true, capture: true });
}

const POLL_MS = 8_000; // poll every 8 seconds

export function AdminNotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadByType, setUnreadByType] = useState<Record<string, number>>({});
  const prevUnread = useRef(0);
  const isInitialLoad = useRef(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const fetched: AppNotification[] = await res.json();

      const newUnread = fetched.filter((n) => !n.read).length;
      if (!isInitialLoad.current && newUnread > prevUnread.current) playDing();

      const byType: Record<string, number> = {};
      fetched.filter((n) => !n.read).forEach((n) => {
        const t = n.type || "other";
        byType[t] = (byType[t] || 0) + 1;
      });

      isInitialLoad.current = false;
      prevUnread.current = newUnread;
      setNotifications(fetched);
      setUnreadCount(newUnread);
      setUnreadByType(byType);
    } catch {
      // silently ignore network errors during background polling
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_MS);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch (e) {
      console.error("markAsRead failed", e);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch("/api/notifications", { method: "POST" });
    } catch (e) {
      console.error("markAllAsRead failed", e);
    }
  }, []);

  // Recompute counts whenever notifications change
  useEffect(() => {
    const unread = notifications.filter((n) => !n.read);
    setUnreadCount(unread.length);
    const byType: Record<string, number> = {};
    unread.forEach((n) => {
      const t = n.type || "other";
      byType[t] = (byType[t] || 0) + 1;
    });
    setUnreadByType(byType);
  }, [notifications]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, unreadByType, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useAdminNotifications() {
  return useContext(NotificationContext);
}
