"use client";

import { useState, useEffect, useRef } from "react";
import { useProperties } from "@/context/PropertyContext";
import { useToast } from "@/context/ToastContext";
import { storage } from "@/lib/firebase";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { AnimatedSection } from "@/components/animations/AnimatedSection";

const CATEGORIES = [
  { value: "electricity", label: "⚡ Electricity" },
  { value: "water", label: "💧 Water" },
  { value: "maintenance", label: "🔧 Maintenance/Repairs" },
  { value: "salary", label: "👷 Salary" },
  { value: "internet", label: "🌐 Internet" },
  { value: "cleaning", label: "🧹 Cleaning" },
  { value: "groceries", label: "🛒 Groceries" },
  { value: "miscellaneous", label: "📦 Miscellaneous" },
  { value: "custom", label: "✏️ Custom..." },
];

const CATEGORY_COLORS: Record<string, string> = {
  electricity: "#f59e0b", water: "#3b82f6", maintenance: "#ef4444",
  salary: "#8b5cf6", internet: "#06b6d4", cleaning: "#10b981",
  groceries: "#f97316", miscellaneous: "#6b7280", custom: "#ec4899",
};

type Expense = {
  id: string; category: string; custom_category: string;
  amount: number; date: number; description: string;
  is_recurring: boolean; recurring_frequency: string | null;
  photo_url: string | null; propertyId: string; propertyName: string;
};

const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"
];

export default function ExpensesPage() {
  const { activePropertyId, properties } = useProperties();
  const { toast } = useToast();

  const now = new Date();
  const [filterMonth, setFilterMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  );
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // form state
  const [category, setCategory] = useState("electricity");
  const [customCat, setCustomCat] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(now.toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFreq, setRecurringFreq] = useState("monthly");
  const [billFile, setBillFile] = useState<File | null>(null);
  const [billPreview, setBillPreview] = useState<string | null>(null);
  const [selectedPropId, setSelectedPropId] = useState("");
  const [saving, setSaving] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activePropertyId && activePropertyId !== "all") setSelectedPropId(activePropertyId);
    else if (properties.length > 0) setSelectedPropId(properties[0].id);
  }, [activePropertyId, properties]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = activePropertyId
        ? `?propertyId=${activePropertyId}&month=${filterMonth}`
        : `?month=${filterMonth}`;
      const res = await fetch(`/api/expenses${q}`);
      if (res.ok) setExpenses(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [activePropertyId, filterMonth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let photo_url = null;
      if (billFile) {
        const sRef = storageRef(storage, `properties/${selectedPropId}/expenses/${Date.now()}_${billFile.name}`);
        const snap = await uploadBytes(sRef, billFile);
        photo_url = await getDownloadURL(snap.ref);
      }
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: selectedPropId, category,
          custom_category: category === "custom" ? customCat : "",
          amount, date, description, is_recurring: isRecurring,
          recurring_frequency: isRecurring ? recurringFreq : null, photo_url
        }),
      });
      if (res.ok) {
        toast("Expense recorded!", "success");
        setShowForm(false);
        resetForm();
        fetchData();
      } else {
        const d = await res.json().catch(() => ({}));
        toast(d.message || "Failed to save.", "error");
      }
    } catch (err) { toast("Error saving expense.", "error"); }
    finally { setSaving(false); }
  };

  const resetForm = () => {
    setCategory("electricity"); setCustomCat(""); setAmount("");
    setDate(new Date().toISOString().slice(0, 10)); setDescription("");
    setIsRecurring(false); setRecurringFreq("monthly");
    setBillFile(null); setBillPreview(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this expense?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      if (res.ok) { toast("Expense deleted.", "info"); fetchData(); }
      else toast("Failed to delete.", "error");
    } catch { toast("Error.", "error"); }
    finally { setDeleting(null); }
  };

  // ── Derived stats ───────────────────────────────────────────────────────
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    const key = e.category === "custom" ? (e.custom_category || "custom") : e.category;
    acc[key] = (acc[key] || 0) + e.amount;
    return acc;
  }, {});

  const labelFor = (e: Expense) =>
    e.category === "custom"
      ? (e.custom_category || "Custom")
      : CATEGORIES.find(c => c.value === e.category)?.label || e.category;

  const colorFor = (e: Expense) =>
    CATEGORY_COLORS[e.category] || CATEGORY_COLORS.custom;

  const [y, m] = filterMonth.split("-");
  const monthLabel = `${MONTHS[parseInt(m) - 1]} ${y}`;

  return (
    <div>
      <AnimatedSection delay={0}>
        <div className="flex justify-between items-center mb-8" style={{ flexWrap: "wrap", gap: "1rem" }}>
          <h1>Expenses</h1>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
            <input
              type="month"
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              className="input-field"
              style={{ padding: "0.5rem 0.75rem", maxWidth: "160px" }}
            />
            <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? "Cancel" : "+ Add Expense"}
            </button>
          </div>
        </div>
      </AnimatedSection>

      {/* ── Summary stats ─────────────────────────────────────────────── */}
      <AnimatedSection delay={80}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
          <div className="card" style={{ borderLeft: "4px solid var(--danger)" }}>
            <div style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 500 }}>
              Total Expenses
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--danger)", margin: "0.4rem 0" }}>
              ₹{totalExpenses.toLocaleString()}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{monthLabel}</div>
          </div>
          <div className="card" style={{ borderLeft: "4px solid var(--warning)" }}>
            <div style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 500 }}>
              Recurring Items
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--warning)", margin: "0.4rem 0" }}>
              {expenses.filter(e => e.is_recurring).length}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>This month</div>
          </div>
          <div className="card" style={{ borderLeft: "4px solid var(--primary)" }}>
            <div style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 500 }}>
              Top Category
            </div>
            <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--primary)", margin: "0.4rem 0" }}>
              {Object.keys(byCategory).length > 0
                ? CATEGORIES.find(c => c.value === Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0])?.label ||
                  Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || "—"
                : "—"}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ── Category breakdown ────────────────────────────────────────── */}
      {Object.keys(byCategory).length > 0 && (
        <AnimatedSection delay={120}>
          <div className="card" style={{ marginBottom: "2rem" }}>
            <h2 style={{ marginBottom: "1rem" }}>Category Breakdown</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => {
                const pct = totalExpenses > 0 ? Math.round((amt / totalExpenses) * 100) : 0;
                const catObj = CATEGORIES.find(c => c.value === cat);
                const label = catObj?.label || cat;
                const color = CATEGORY_COLORS[cat] || CATEGORY_COLORS.custom;
                return (
                  <div key={cat}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "0.3rem" }}>
                      <span>{label}</span>
                      <span style={{ fontWeight: 600 }}>₹{amt.toLocaleString()} <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>({pct}%)</span></span>
                    </div>
                    <div style={{ height: "6px", borderRadius: "99px", background: "var(--border-color)" }}>
                      <div style={{ width: `${pct}%`, height: "100%", borderRadius: "99px", backgroundColor: color, transition: "width 0.6s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* ── Add Form ──────────────────────────────────────────────────── */}
      {showForm && (
        <AnimatedSection delay={0}>
          <div className="card mb-8 animate-fade-in">
            <h3>Add Expense</h3>
            <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
              {activePropertyId === "all" && (
                <div className="input-group mb-0">
                  <label className="input-label">Property</label>
                  <select className="input-field" value={selectedPropId} onChange={e => setSelectedPropId(e.target.value)} required>
                    {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}

              <div className="input-group mb-0">
                <label className="input-label">Category</label>
                <select className="input-field" value={category} onChange={e => setCategory(e.target.value)} required>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              {category === "custom" && (
                <div className="input-group mb-0">
                  <label className="input-label">Custom Category Name</label>
                  <input type="text" className="input-field" value={customCat} onChange={e => setCustomCat(e.target.value)} placeholder="e.g., Pest control" required maxLength={50} />
                </div>
              )}

              <div className="input-group mb-0">
                <label className="input-label">Amount (₹)</label>
                <input type="number" className="input-field" value={amount} onChange={e => setAmount(e.target.value)} min="1" step="0.01" required />
              </div>

              <div className="input-group mb-0">
                <label className="input-label">Date</label>
                <input type="date" className="input-field" value={date} onChange={e => setDate(e.target.value)} required />
              </div>

              <div className="input-group mb-0" style={{ gridColumn: "1 / -1" }}>
                <label className="input-label">Description (optional)</label>
                <input type="text" className="input-field" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g., BESCOM bill for July" maxLength={300} />
              </div>

              {/* Recurring toggle */}
              <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontWeight: 500 }}>
                  <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} style={{ width: "16px", height: "16px", cursor: "pointer" }} />
                  Recurring expense
                </label>
                {isRecurring && (
                  <select className="input-field" value={recurringFreq} onChange={e => setRecurringFreq(e.target.value)} style={{ maxWidth: "160px" }}>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                )}
              </div>

              {/* Bill/photo upload */}
              <div className="input-group mb-0" style={{ gridColumn: "1 / -1" }}>
                <label className="input-label">Attach Bill / Photo (optional)</label>
                <input ref={fileRef} type="file" accept="image/*,.pdf" className="input-field"
                  onChange={e => {
                    const f = e.target.files?.[0] || null;
                    setBillFile(f);
                    if (f && f.type.startsWith("image/")) {
                      const reader = new FileReader();
                      reader.onload = ev => setBillPreview(ev.target?.result as string);
                      reader.readAsDataURL(f);
                    } else setBillPreview(null);
                  }}
                />
                {billPreview && (
                  <img src={billPreview} alt="Bill preview" style={{ marginTop: "0.75rem", maxHeight: "120px", borderRadius: "8px", objectFit: "cover" }} />
                )}
              </div>

              <div style={{ gridColumn: "1 / -1", display: "flex", gap: "0.75rem" }}>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "Save Expense"}
                </button>
                <button type="button" style={{ padding: "0.6rem 1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", background: "none", cursor: "pointer", color: "var(--text-main)" }} onClick={() => { setShowForm(false); resetForm(); }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </AnimatedSection>
      )}

      {/* ── Expense list ──────────────────────────────────────────────── */}
      <AnimatedSection delay={160}>
        {loading ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Loading...</div>
        ) : expenses.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>💸</div>
            No expenses recorded for {monthLabel}.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {expenses.map(exp => (
              <div key={exp.id} className="card animate-fade-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap", borderLeft: `4px solid ${colorFor(exp)}` }}>
                <div style={{ flex: 1, minWidth: "180px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600 }}>{labelFor(exp)}</span>
                    {exp.is_recurring && (
                      <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: "99px", backgroundColor: "rgba(139,92,246,0.15)", color: "#8b5cf6", fontWeight: 600 }}>
                        🔁 {exp.recurring_frequency}
                      </span>
                    )}
                    {activePropertyId === "all" && (
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{exp.propertyName}</span>
                    )}
                  </div>
                  {exp.description && (
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>{exp.description}</div>
                  )}
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                    {exp.date ? new Date(exp.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--danger)", minWidth: "90px", textAlign: "right" }}>
                    ₹{exp.amount.toLocaleString()}
                  </div>
                  {exp.photo_url && (
                    <a href={exp.photo_url} target="_blank" rel="noreferrer"
                      title="View bill"
                      style={{ padding: "0.4rem 0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", fontSize: "0.8rem", textDecoration: "none", color: "var(--text-main)", whiteSpace: "nowrap" }}>
                      📎 Bill
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(exp.id)}
                    disabled={deleting === exp.id}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", fontSize: "1.2rem", padding: "0.25rem" }}
                    title="Delete expense"
                  >
                    {deleting === exp.id ? "…" : "🗑"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </AnimatedSection>
    </div>
  );
}
