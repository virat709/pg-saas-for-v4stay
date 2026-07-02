"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
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

function playDing() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    gain1.gain.setValueAtTime(0, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.45, ctx.currentTime + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.5);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(660, ctx.currentTime + 0.15);
    gain2.gain.setValueAtTime(0, ctx.currentTime + 0.15);
    gain2.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.17);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.65);
  } catch (e) {
    console.warn("Audio play failed", e);
  }
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
      orderBy("created_at", "desc"),
      limit(30)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<AppNotification, "id">),
      }));

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
    });

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
