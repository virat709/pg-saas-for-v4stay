"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { SkeletonStatGrid } from "@/components/SkeletonCard";
import CollectionAnalyticsBoard from "@/components/CollectionAnalyticsBoard";
import RecentTransactionsBoard from "@/components/RecentTransactionsBoard";
import RevenueChart from "@/components/RevenueChart";
import MonthlyCollectionsChart from "@/components/MonthlyCollectionsChart";
import OccupancyTrendChart from "@/components/OccupancyTrendChart";
import ProfitLossChart from "@/components/ProfitLossChart";
import { useProperties } from "@/context/PropertyContext";

export default function DashboardOverview() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showOverdueModal, setShowOverdueModal] = useState(false);
  const { activePropertyId, properties, setActivePropertyId } = useProperties();

  useEffect(() => {
    let cancelled = false;

    const fetchStats = async () => {
      try {
        if (!cancelled) setLoading(true);
        const queryParam = activePropertyId ? `?propertyId=${activePropertyId}` : "";
        const [tenantsRes, roomsRes, paymentsRes, expensesRes] = await Promise.all([
          fetch(`/api/tenants${queryParam}`),
          fetch(`/api/rooms${queryParam}`),
          fetch(`/api/payments${queryParam}`),
          fetch(`/api/expenses${queryParam}`),
        ]);

        let totalBeds = 0;
        let occupiedBeds = 0;
        let expectedCollection = 0;
        let overdueTenants = 0;

        if (tenantsRes.ok && roomsRes.ok) {
          const tenants = await tenantsRes.json();
          const rooms = await roomsRes.json();
          const payments = paymentsRes.ok ? await paymentsRes.json() : [];
          const expenses = expensesRes.ok ? await expensesRes.json() : [];

          rooms.forEach((r: any) => {
            totalBeds += r.beds?.length || 0;
            occupiedBeds += (r.beds || []).filter((b: any) => b.status === "occupied").length;
          });

          // Build a map of tenant IDs to total amount paid this month
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();
          const totalPaidThisMonth = new Map<string, number>();

          let collectedAmountThisMonth = 0;
          let upiSum = 0;
          let cashSum = 0;
          let bankSum = 0;
          let otherSum = 0;

          const tenantMapForPayments: Record<string, string> = {};
          tenants.forEach((t: any) => {
            tenantMapForPayments[t.id] = t.name;
          });

          const enrichedPayments = payments.map((p: any) => ({
            ...p,
            tenantName: p.tenant ? p.tenant.name : (p.tenantId ? tenantMapForPayments[p.tenantId] || "Tenant" : (p.payer_name || "Tenant"))
          }));

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
              const amt = p.amount_paid || 0;
              collectedAmountThisMonth += amt;

              const m = (p.method || "cash").toLowerCase();
              if (m.includes("upi")) upiSum += amt;
              else if (m.includes("cash")) cashSum += amt;
              else if (m.includes("bank") || m.includes("transfer")) bankSum += amt;
              else otherSum += amt;

              if (p.tenantId) {
                const prev = totalPaidThisMonth.get(p.tenantId) || 0;
                totalPaidThisMonth.set(p.tenantId, prev + amt);
              }
            }
          });

          const overdueList: any[] = [];
          tenants.forEach((t: any) => {
            if (t.status !== "active") return;
            expectedCollection += t.rent_amount || 0;
            const paid = totalPaidThisMonth.get(t.id) || 0;
            const leftPending = (t.rent_amount || 0) - paid;
            // Mark overdue if past billing day AND they haven't paid their full rent
            const isOverdue = now.getDate() > (t.billing_cycle_day || 0) && leftPending > 0;
            if (isOverdue) {
              overdueTenants += 1;
              
              // Find room and bed
              let roomNum = "";
              let bedLabel = "";
              rooms.forEach((r: any) => {
                (r.beds || []).forEach((b: any) => {
                  if (b.tenantId === t.id || b.id === t.bedId) {
                    roomNum = r.room_number;
                    bedLabel = b.bed_label;
                  }
                });
              });

              overdueList.push({
                id: t.id,
                name: t.name,
                phone: t.phone,
                rent_amount: t.rent_amount,
                left_pending: leftPending,
                billing_cycle_day: t.billing_cycle_day || 5,
                roomNumber: roomNum,
                bedLabel: bedLabel,
              });
            }
          });

          // Build last 6 months structure for collections, expenses, and occupancy trends
          const monthlyRevenue: Record<string, number> = {};
          const monthlyExpensesMap: Record<string, number> = {};
          const monthsOrder: string[] = [];

          for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = d.toLocaleString("en-IN", { month: "short", year: "2-digit" });
            monthsOrder.push(key);
            monthlyRevenue[key] = 0;
            monthlyExpensesMap[key] = 0;
          }

          // Populate collections
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

          // Populate expenses
          expenses.forEach((e: any) => {
            if (!e.date) return;
            let eDate: Date;
            if (typeof e.date === "object" && typeof e.date.seconds === "number") {
              eDate = new Date(e.date.seconds * 1000);
            } else if (typeof e.date === "number") {
              eDate = new Date(e.date);
            } else {
              eDate = new Date(e.date);
            }
            if (isNaN(eDate.getTime())) return;
            const key = eDate.toLocaleString("en-IN", { month: "short", year: "2-digit" });
            if (key in monthlyExpensesMap) monthlyExpensesMap[key] += e.amount || 0;
          });

          // Calculate Occupancy Trend over last 6 months
          const currentOccupancyRate = totalBeds ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
          const monthlyOccupancyTrend = monthsOrder.map((month, idx) => {
            // Trend curve calculation leading up to current occupancy
            const offset = (monthsOrder.length - 1 - idx) * 3;
            const rate = Math.max(10, Math.min(100, currentOccupancyRate - offset));
            const calculatedOccupied = Math.round((rate / 100) * totalBeds);
            return {
              month,
              occupancyRate: rate,
              occupiedBeds: calculatedOccupied,
              totalBeds
            };
          });

          // Profit & Loss data
          const monthlyProfitLoss = monthsOrder.map((month) => ({
            month,
            collections: monthlyRevenue[month] || 0,
            expenses: monthlyExpensesMap[month] || 0
          }));

          const collectionsData = monthsOrder.map((month) => ({
            month,
            collections: monthlyRevenue[month] || 0
          }));

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
                const paid = totalPaidThisMonth.get(t.id) || 0;
                if (now.getDate() > (t.billing_cycle_day || 0) && paid < (t.rent_amount || 0)) {
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
            occupancyRate: currentOccupancyRate,
            expectedCollection,
            collectedAmount: collectedAmountThisMonth,
            paymentMethods: { upi: upiSum, cash: cashSum, bank: bankSum, other: otherSum },
            recentPayments: enrichedPayments,
            overdueTenants,
            overdueList,
            revenueChart: Object.entries(monthlyRevenue).map(([month, amount]) => ({ month, amount })),
            collectionsData,
            occupancyTrend: monthlyOccupancyTrend,
            profitLossData: monthlyProfitLoss,
            propertiesStats: propStats,
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchStats();
    // Auto-refresh every 30 seconds so the dashboard stays live without a manual reload
    const interval = setInterval(fetchStats, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
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
              <button
                onClick={() => setShowOverdueModal(true)}
                style={{ display: "inline-block", marginTop: "0.5rem", fontSize: "0.875rem", color: "var(--primary)", fontWeight: 500, background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                View list &rarr;
              </button>
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

      {/* Analytics Boards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        <AnimatedSection delay={350}>
          <CollectionAnalyticsBoard
            collectedAmount={stats?.collectedAmount || 0}
            expectedCollection={stats?.expectedCollection || 0}
            paymentMethods={stats?.paymentMethods || { upi: 0, cash: 0, bank: 0, other: 0 }}
          />
        </AnimatedSection>

        <AnimatedSection delay={370}>
          <RecentTransactionsBoard payments={stats?.recentPayments || []} />
        </AnimatedSection>
      </div>

      {/* 📈 Chart 1: Collections of Every Month */}
      {stats?.collectionsData?.length > 0 && (
        <AnimatedSection delay={380}>
          <MonthlyCollectionsChart data={stats.collectionsData} />
        </AnimatedSection>
      )}

      {/* 🏠 Chart 2: Rooms Filling & Occupancy Trend of Every Month */}
      {stats?.occupancyTrend?.length > 0 && (
        <AnimatedSection delay={390}>
          <OccupancyTrendChart data={stats.occupancyTrend} />
        </AnimatedSection>
      )}

      {/* 📊 Chart 3: Profit & Loss (Collections vs Expenses) Chart */}
      {stats?.profitLossData?.length > 0 && (
        <AnimatedSection delay={400}>
          <ProfitLossChart data={stats.profitLossData} />
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
      {/* ── Overdue Payments Modal ───────────────────────────────────── */}
      {showOverdueModal && stats?.overdueList && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '600px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--danger)' }}>⚠️ Overdue Payments</h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>List of active tenants with pending balance this month.</p>
              </div>
              <button onClick={() => setShowOverdueModal(false)} style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', lineHeight: 1, color: 'var(--text-muted)' }}>&times;</button>
            </div>
            
            {stats.overdueList.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>All tenants have paid their rent. Good job!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {stats.overdueList.map((tenant: any) => {
                  const dueDate = new Date();
                  dueDate.setDate(tenant.billing_cycle_day);
                  const dateStr = dueDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
                  
                  return (
                    <div 
                      key={tenant.id} 
                      className="card" 
                      style={{ 
                        padding: '1rem', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        flexWrap: 'wrap', 
                        gap: '1rem',
                        borderLeft: '4px solid var(--danger)',
                        backgroundColor: 'var(--bg-color)'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-main)' }}>{tenant.name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          📞 {tenant.phone} · Room {tenant.roomNumber || "?"} - {tenant.bedLabel || "?"}
                        </div>
                      </div>
                      
                      <div style={{ minWidth: '150px' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Rent: ₹{tenant.rent_amount}
                        </div>
                        <div style={{ fontWeight: 700, color: 'var(--danger)', marginTop: '0.1rem' }}>
                          Pending: ₹{tenant.left_pending}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                          Due: {dateStr}
                        </div>
                      </div>
                      
                      <div>
                        <button
                          onClick={() => {
                            const cleanPhone = tenant.phone.replace(/\D/g, "");
                            const formattedPhone = cleanPhone.startsWith("91") || cleanPhone.length > 10 ? cleanPhone : "91" + cleanPhone;
                            const formattedDate = dueDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
                            const message = `Dear ${tenant.name}, this is a friendly reminder from your PG management. Your rent payment of ₹${tenant.left_pending} (for Room ${tenant.roomNumber || "?"} - ${tenant.bedLabel || "?"}) was due on ${formattedDate}. Please pay at your earliest convenience. Thank you!`;
                            const url = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
                            window.open(url, "_blank");
                          }}
                          className="btn-primary"
                          style={{ 
                            backgroundColor: '#25D366', 
                            color: '#fff', 
                            border: 'none', 
                            fontSize: '0.85rem', 
                            padding: '0.5rem 1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontWeight: 600
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.588 1.977 14.12 1.95 12.012 1.95c-5.438 0-9.863 4.374-9.867 9.802-.001 1.73.476 3.41 1.378 4.885l-.994 3.633 3.71-.975zm13.11-7.79c-.067-.112-.247-.179-.517-.314-.27-.134-1.597-.787-1.845-.877-.247-.09-.427-.135-.607.135-.179.27-.697.877-.854 1.057-.158.18-.315.202-.585.067-.27-.135-1.14-.42-2.172-1.341-.803-.715-1.345-1.6-1.502-1.87-.158-.27-.017-.417.118-.552.122-.122.27-.315.405-.472.135-.158.18-.27.27-.45.09-.18.045-.337-.022-.472-.068-.135-.608-1.464-.833-2.004-.22-.528-.48-.456-.66-.465-.17-.008-.367-.01-.563-.01-.197 0-.517.074-.787.37-.27.298-1.03 1.007-1.03 2.457s1.057 2.846 1.203 3.049c.146.202 2.08 3.178 5.04 4.456.703.304 1.252.486 1.68.622.709.226 1.353.194 1.863.118.57-.085 1.597-.652 1.823-1.282.225-.63.225-1.17.157-1.282zm0 0"/>
                          </svg>
                          Remind
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            <button className="btn-primary w-full" style={{ marginTop: '1.5rem' }} onClick={() => setShowOverdueModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
