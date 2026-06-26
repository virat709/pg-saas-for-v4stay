"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AnimatedSection } from "@/components/animations/AnimatedSection";

export default function DashboardOverview() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [tenantsRes, roomsRes, paymentsRes] = await Promise.all([
          fetch("/api/tenants"),
          fetch("/api/rooms"),
          fetch("/api/payments"),
        ]);

        let totalBeds = 0;
        let occupiedBeds = 0;
        let expectedCollection = 0;
        let overdueTenants = 0;

        if (tenantsRes.ok && roomsRes.ok) {
          const tenants = await tenantsRes.json();
          const rooms = await roomsRes.json();
          const payments = paymentsRes.ok ? await paymentsRes.json() : [];

          rooms.forEach((r: any) => {
            totalBeds += r.beds.length;
            occupiedBeds += r.beds.filter((b: any) => b.status === "occupied").length;
          });

          // Build a set of tenant IDs who have paid this month
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();
          const paidThisMonth = new Set<string>();
          payments.forEach((p: any) => {
            if (!p.payment_date || p.type !== "rent") return;
            let pDate: Date;
            if (typeof p.payment_date === "object" && typeof p.payment_date.seconds === "number") {
              pDate = new Date(p.payment_date.seconds * 1000);
            } else if (typeof p.payment_date === "object" && typeof p.payment_date._seconds === "number") {
              pDate = new Date(p.payment_date._seconds * 1000);
            } else {
              pDate = new Date(p.payment_date);
            }
            if (!isNaN(pDate.getTime()) && pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear) {
              if (p.tenantId) paidThisMonth.add(p.tenantId);
            }
          });

          tenants.forEach((t: any) => {
            if (t.status !== "active") return;
            expectedCollection += t.rent_amount || 0;
            // Only mark overdue if past billing day AND no payment this month
            if (now.getDate() > (t.billing_cycle_day || 0) && !paidThisMonth.has(t.id)) {
              overdueTenants += 1;
            }
          });
        }

        setStats({
          totalBeds,
          occupiedBeds,
          occupancyRate: totalBeds ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
          expectedCollection,
          overdueTenants,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div>
      {/* Heading — reveals first */}
      <AnimatedSection delay={0}>
        <h1 className="mb-8">Dashboard Overview</h1>
      </AnimatedSection>

      {/* Stat cards — stagger in 80ms apart */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <AnimatedSection delay={80}>
          <div className="card">
            <h3 style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: 500, textTransform: "uppercase" }}>
              Occupancy
            </h3>
            <div style={{ fontSize: "2rem", fontWeight: 700, margin: "0.5rem 0", color: "var(--text-main)" }}>
              {stats?.occupancyRate}%
            </div>
            <p style={{ margin: 0, fontSize: "0.875rem" }}>
              {stats?.occupiedBeds} of {stats?.totalBeds} beds occupied
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={160}>
          <div className="card">
            <h3 style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: 500, textTransform: "uppercase" }}>
              Available Beds
            </h3>
            <div style={{ fontSize: "2rem", fontWeight: 700, margin: "0.5rem 0", color: "var(--primary)" }}>
              {stats ? stats.totalBeds - stats.occupiedBeds : 0}
            </div>
            <p style={{ margin: 0, fontSize: "0.875rem" }}>Beds ready for new tenants</p>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={240}>
          <div className="card">
            <h3 style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: 500, textTransform: "uppercase" }}>
              Monthly Collection
            </h3>
            <div style={{ fontSize: "2rem", fontWeight: 700, margin: "0.5rem 0", color: "var(--success)" }}>
              ₹{(stats?.expectedCollection ?? 0).toLocaleString()}
            </div>
            <p style={{ margin: 0, fontSize: "0.875rem" }}>Expected this month</p>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={320}>
          <div
            className="card"
            style={{ borderLeft: stats?.overdueTenants > 0 ? "4px solid var(--danger)" : "" }}
          >
            <h3 style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: 500, textTransform: "uppercase" }}>
              Overdue Payments
            </h3>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                margin: "0.5rem 0",
                color: stats?.overdueTenants > 0 ? "var(--danger)" : "var(--text-main)",
              }}
            >
              {stats?.overdueTenants}
            </div>
            <p style={{ margin: 0, fontSize: "0.875rem" }}>Tenants behind on rent</p>
            {stats?.overdueTenants > 0 && (
              <Link
                href="/dashboard/payments"
                style={{ display: "inline-block", marginTop: "0.5rem", fontSize: "0.875rem", color: "var(--primary)", fontWeight: 500 }}
              >
                View list &rarr;
              </Link>
            )}
          </div>
        </AnimatedSection>
      </div>

      {/* Quick actions — enters last */}
      <AnimatedSection delay={400}>
        <div className="card">
          <h2 className="mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <Link
              href="/dashboard/tenants"
              className="btn-primary"
              style={{ backgroundColor: "var(--surface-color)", color: "var(--primary)", border: "1px solid var(--primary)" }}
            >
              + Add Tenant
            </Link>
            <Link
              href="/dashboard/payments"
              className="btn-primary"
              style={{ backgroundColor: "var(--surface-color)", color: "var(--primary)", border: "1px solid var(--primary)" }}
            >
              Record Payment
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
