"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { SkeletonStatGrid } from "@/components/SkeletonCard";
import RevenueChart from "@/components/RevenueChart";
import { useProperties } from "@/context/PropertyContext";

export default function DashboardOverview() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { activePropertyId, properties, setActivePropertyId } = useProperties();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const queryParam = activePropertyId ? `?propertyId=${activePropertyId}` : "";
        const [tenantsRes, roomsRes, paymentsRes] = await Promise.all([
          fetch(`/api/tenants${queryParam}`),
          fetch(`/api/rooms${queryParam}`),
          fetch(`/api/payments${queryParam}`),
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
            totalBeds += r.beds?.length || 0;
            occupiedBeds += (r.beds || []).filter((b: any) => b.status === "occupied").length;
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
          // Build last-6-months revenue data
          const monthlyRevenue: Record<string, number> = {};
          for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = d.toLocaleString("en-IN", { month: "short", year: "2-digit" });
            monthlyRevenue[key] = 0;
          }
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
            if (isNaN(pDate.getTime())) return;
            const key = pDate.toLocaleString("en-IN", { month: "short", year: "2-digit" });
            if (key in monthlyRevenue) monthlyRevenue[key] += p.amount_paid || 0;
          });

          // Calculate per-property stats
          const propStats = properties.map((p) => {
            let pTotalBeds = 0;
            let pOccupiedBeds = 0;
            let pExpectedCollection = 0;
            let pOverdueTenants = 0;

            rooms.forEach((r: any) => {
              if (r.propertyId === p.id) {
                pTotalBeds += r.beds?.length || 0;
                pOccupiedBeds += (r.beds || []).filter((b: any) => b.status === "occupied").length;
              }
            });

            tenants.forEach((t: any) => {
              if (t.propertyId === p.id && t.status === "active") {
                pExpectedCollection += t.rent_amount || 0;
                if (now.getDate() > (t.billing_cycle_day || 0) && !paidThisMonth.has(t.id)) {
                  pOverdueTenants += 1;
                }
              }
            });

            return {
              id: p.id,
              name: p.name,
              address: p.address || "",
              city: p.city || "",
              totalBeds: pTotalBeds,
              occupiedBeds: pOccupiedBeds,
              occupancyRate: pTotalBeds ? Math.round((pOccupiedBeds / pTotalBeds) * 100) : 0,
              expectedCollection: pExpectedCollection,
              overdueTenants: pOverdueTenants,
            };
          });

          setStats({
            totalBeds,
            occupiedBeds,
            occupancyRate: totalBeds ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
            expectedCollection,
            overdueTenants,
            revenueChart: Object.entries(monthlyRevenue).map(([month, amount]) => ({ month, amount })),
            propertiesStats: propStats,
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [activePropertyId]);

  if (loading) return (
    <div>
      <h1 className="mb-8">Dashboard Overview</h1>
      <SkeletonStatGrid />
    </div>
  );

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

      {/* My PGs List — Shown only in All Properties Overview */}
      {activePropertyId === "all" && stats?.propertiesStats && (
        <AnimatedSection delay={380}>
          <h2 className="mb-6 mt-8">My PG Properties</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
            {stats.propertiesStats.map((p: any) => (
              <div key={p.id} className="card animate-fade-in" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <h3 style={{ margin: 0, color: "var(--primary)" }}>{p.name}</h3>
                    <span style={{ 
                      fontSize: "0.75rem", 
                      padding: "2px 8px", 
                      borderRadius: "12px", 
                      backgroundColor: "rgba(30, 96, 145, 0.1)", 
                      color: "var(--primary)",
                      fontWeight: 600
                    }}>
                      {p.occupancyRate}% Occupied
                    </span>
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0 0 1rem 0" }}>
                    📍 {p.address || "No Address"}{p.city ? `, ${p.city}` : ""}
                  </p>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem", fontSize: "0.875rem" }}>
                    <div>
                      <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem" }}>Occupied Beds</span>
                      <strong>{p.occupiedBeds} / {p.totalBeds}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem" }}>Available Beds</span>
                      <strong>{p.totalBeds - p.occupiedBeds}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem" }}>Expected Rent</span>
                      <strong style={{ color: "var(--success)" }}>₹{p.expectedCollection.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem" }}>Dues Alert</span>
                      <strong style={{ color: p.overdueTenants > 0 ? "var(--danger)" : "var(--text-main)" }}>
                        {p.overdueTenants} unpaid
                      </strong>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setActivePropertyId(p.id)}
                  className="btn-primary w-full"
                  style={{ 
                    marginTop: "0.5rem", 
                    padding: "0.6rem 1rem", 
                    fontSize: "0.9rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.25rem"
                  }}
                >
                  🚪 Open PG
                </button>
              </div>
            ))}
          </div>
        </AnimatedSection>
      )}

      {/* Revenue Chart */}
      {stats?.revenueChart?.length > 0 && (
        <AnimatedSection delay={390}>
          <RevenueChart data={stats.revenueChart} />
        </AnimatedSection>
      )}

      {/* Quick actions — enters last */}
      <AnimatedSection delay={400}>
        <div className="card">
          <h2 className="mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            {activePropertyId === "all" ? (
              <Link
                href="/onboarding/property"
                className="btn-primary"
                style={{ backgroundColor: "var(--surface-color)", color: "var(--primary)", border: "1px solid var(--primary)" }}
              >
                + Add PG Property
              </Link>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
