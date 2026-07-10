"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  limit,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: any;
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

// ── Shared AudioContext singleton — survives across ding calls ───────────────
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

    // Resume the context if it is suspended (browser autoplay policy).
    // AudioContext starts in "suspended" state until a user gesture occurs.
    // Since this runs in response to a Firestore snapshot change (not a click),
    // we try to resume — it will succeed if the user has interacted with the
    // page at least once (clicked, scrolled, typed, etc.).
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

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

// Eagerly unlock AudioContext on first user interaction so that future
// notification dings can play without requiring a click at that exact moment.
if (typeof window !== "undefined") {
  const unlock = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    // Remove all listeners after first unlock
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

interface AdminNotificationProviderProps {
  children: React.ReactNode;
}

export function AdminNotificationProvider({ children }: AdminNotificationProviderProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadByType, setUnreadByType] = useState<Record<string, number>>({});
  const isInitialLoad = useRef(true);
  const prevUnread = useRef(0);

  useEffect(() => {
    const q = query(
      collection(db, "notifications"),
      where("recipientRole", "==", "admin"),
      limit(30)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched = snapshot.docs
          .map((d) => ({
            id: d.id,
            ...(d.data() as Omit<AppNotification, "id">),
          }))
          .sort((a, b) => {
            const getTime = (n: any) => n?.created_at?.toMillis?.() ?? (n?.created_at?.seconds ? n.created_at.seconds * 1000 : 0);
            return getTime(b) - getTime(a);
          });

        const newUnread = fetched.filter((n) => !n.read).length;

        if (!isInitialLoad.current && newUnread > prevUnread.current) {
          playDing();
        }

        // Count unread by type
        const byType: Record<string, number> = {};
        fetched.filter(n => !n.read).forEach(n => {
          const t = n.type || "other";
          byType[t] = (byType[t] || 0) + 1;
        });

        isInitialLoad.current = false;
        prevUnread.current = newUnread;

        setNotifications(fetched);
        setUnreadCount(newUnread);
        setUnreadByType(byType);
      },
      (error) => {
        // Surface Firestore query errors (e.g. missing composite index) in the console
        console.error(
          "[AdminNotifications] Firestore onSnapshot error:",
          error.message,
          "\n\nIf this is a 'requires an index' error, follow the link in the error message to create the required composite index in the Firebase Console."
        );
      }
    );

    return () => unsubscribe();
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await updateDoc(doc(db, "notifications", id), { read: true });
    } catch (e) {
      console.error("markAsRead failed", e);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    await Promise.all(
      notifications.filter((n) => !n.read).map((n) => markAsRead(n.id))
    );
  }, [notifications, markAsRead]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, unreadByType, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useAdminNotifications() {
  return useContext(NotificationContext);
}
