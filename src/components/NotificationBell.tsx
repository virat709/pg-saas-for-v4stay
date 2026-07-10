"use client";

import { useState } from "react";
import Link from "next/link";
import { useAdminNotifications } from "@/context/AdminNotificationContext";
import { useFaviconBadge } from "@/hooks/useFaviconBadge";
import { AppNotification } from "@/context/AdminNotificationContext";

// ── Tenant-side bell (keeps its own Firestore sub) ────────────────────────
import { useEffect, useRef } from "react";
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

// ── Shared AudioContext singleton for tenant-side notification sound ─────────
let tenantAudioCtx: AudioContext | null = null;

function getTenantAudioContext(): AudioContext | null {
  try {
    if (tenantAudioCtx && tenantAudioCtx.state !== "closed") return tenantAudioCtx;
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return null;
    tenantAudioCtx = new Ctx();
    return tenantAudioCtx;
  } catch {
    return null;
  }
}

async function playDing() {
  try {
    const ctx = getTenantAudioContext();
    if (!ctx) return;

    // Resume the context if suspended (browser autoplay policy)
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

// Eagerly unlock AudioContext on first user interaction
if (typeof window !== "undefined") {
  const unlockTenant = () => {
    const ctx = getTenantAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    window.removeEventListener("click", unlockTenant);
    window.removeEventListener("keydown", unlockTenant);
    window.removeEventListener("touchstart", unlockTenant);
  };
  window.addEventListener("click", unlockTenant, { once: true });
  window.addEventListener("keydown", unlockTenant, { once: true });
  window.addEventListener("touchstart", unlockTenant, { once: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared dropdown UI
// ─────────────────────────────────────────────────────────────────────────────
function BellDropdown({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
}: {
  notifications: AppNotification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Notifications"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          position: "relative",
          padding: "0.45rem",
          color: "var(--text-main)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.07)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "2px",
              right: "2px",
              backgroundColor: "#ef4444",
              color: "#fff",
              fontSize: "0.6rem",
              fontWeight: 700,
              borderRadius: "50%",
              width: "17px",
              height: "17px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 0 2px var(--surface-color)",
              animation: "bell-pulse 1.5s infinite",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 98 }} onClick={() => setIsOpen(false)} />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width: "310px",
              maxHeight: "420px",
              backgroundColor: "var(--surface-color)",
              border: "1px solid var(--border-color)",
              borderRadius: "12px",
              boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
              zIndex: 99,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "0.9rem 1rem",
                borderBottom: "1px solid var(--border-color)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "sticky",
                top: 0,
                backgroundColor: "var(--surface-color)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>Notifications</span>
                {unreadCount > 0 && (
                  <span
                    style={{
                      backgroundColor: "#ef4444",
                      color: "#fff",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      borderRadius: "20px",
                      padding: "1px 6px",
                    }}
                  >
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={() => { onMarkAllAsRead(); setIsOpen(false); }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--primary)",
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  Mark all read
                </button>
              )}
            </div>

            <div style={{ overflowY: "auto" }}>
              {notifications.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.88rem" }}>
                  🔕 No notifications yet
                </div>
              ) : (
                notifications.map((n) => {
                  const linkHref =
                    n.type === "complaint"
                      ? "/dashboard/complaints"
                      : n.type === "payment"
                      ? "/dashboard/payments"
                      : null;

                  const row = (
                    <div
                      key={n.id}
                      onClick={() => { if (!n.read) onMarkAsRead(n.id); setIsOpen(false); }}
                      style={{
                        padding: "0.8rem 1rem",
                        borderBottom: "1px solid var(--border-color)",
                        backgroundColor: n.read ? "transparent" : "rgba(30,96,145,0.06)",
                        cursor: "pointer",
                        transition: "background 0.2s",
                        display: "flex",
                        gap: "0.75rem",
                        alignItems: "flex-start",
                        textDecoration: "none",
                        color: "inherit",
                      }}
                    >
                      <span style={{ fontSize: "1.1rem", flexShrink: 0, marginTop: "1px" }}>
                        {n.type === "complaint" ? "🛠️" : n.type === "payment" ? "💰" : "📢"}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: n.read ? 400 : 600,
                            color: n.read ? "var(--text-muted)" : "var(--text-main)",
                            marginBottom: "0.2rem",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {n.title}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                          {n.message}
                        </div>
                      </div>
                      {!n.read && (
                        <div
                          style={{
                            width: "7px",
                            height: "7px",
                            borderRadius: "50%",
                            backgroundColor: "#ef4444",
                            flexShrink: 0,
                            marginTop: "5px",
                          }}
                        />
                      )}
                    </div>
                  );

                  return linkHref ? (
                    <Link key={n.id} href={linkHref} style={{ textDecoration: "none", display: "block" }}>
                      {row}
                    </Link>
                  ) : row;
                })
              )}
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes bell-pulse {
          0%, 100% { box-shadow: 0 0 0 2px var(--surface-color), 0 0 0 4px rgba(239,68,68,0.3); }
          50%       { box-shadow: 0 0 0 2px var(--surface-color), 0 0 0 6px rgba(239,68,68,0); }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin bell — reads from shared AdminNotificationContext
// ─────────────────────────────────────────────────────────────────────────────
function AdminBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useAdminNotifications();

  // Update browser tab favicon badge
  useFaviconBadge(unreadCount);

  return (
    <BellDropdown
      notifications={notifications}
      unreadCount={unreadCount}
      onMarkAsRead={markAsRead}
      onMarkAllAsRead={markAllAsRead}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tenant bell — own Firestore subscription
// ─────────────────────────────────────────────────────────────────────────────
function TenantBell({ tenantId }: { tenantId: string }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const isInitialLoad = useRef(true);
  const prevUnread = useRef(0);

  useFaviconBadge(unreadCount);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, "notifications", id), { read: true });
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    await Promise.all(notifications.filter((n) => !n.read).map((n) => markAsRead(n.id)));
  };

  useEffect(() => {
    const q = query(
      collection(db, "notifications"),
      where("recipientRole", "==", "tenant"),
      where("tenantId", "==", tenantId),
      limit(20)
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

        isInitialLoad.current = false;
        prevUnread.current = newUnread;

        setNotifications(fetched);
        setUnreadCount(newUnread);
      },
      (error) => {
        console.error(
          "[TenantNotifications] Firestore onSnapshot error:",
          error.message,
          "\n\nIf this is a 'requires an index' error, follow the link in the error message to create the required composite index in the Firebase Console."
        );
      }
    );

    return () => unsubscribe();
  }, [tenantId]);

  return (
    <BellDropdown
      notifications={notifications}
      unreadCount={unreadCount}
      onMarkAsRead={markAsRead}
      onMarkAllAsRead={markAllAsRead}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Public export
// ─────────────────────────────────────────────────────────────────────────────
export default function NotificationBell({
  role,
  tenantId,
}: {
  role: "admin" | "tenant";
  tenantId?: string;
}) {
  if (role === "admin") return <AdminBell />;
  if (!tenantId) return null;
  return <TenantBell tenantId={tenantId} />;
}
