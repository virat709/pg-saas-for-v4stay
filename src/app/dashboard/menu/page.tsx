"use client";

import { useState, useEffect } from "react";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const MEALS = ["breakfast", "lunch", "dinner"] as const;
const MEAL_LABELS: Record<string, string> = {
  breakfast: "☀️ Breakfast",
  lunch: "🍱 Lunch",
  dinner: "🌙 Dinner",
};
const DAY_LABELS: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

type DayMenu = { breakfast: string; lunch: string; dinner: string };
type WeekMenu = Record<string, DayMenu>;

function emptyMenu(): WeekMenu {
  const m: WeekMenu = {};
  for (const d of DAYS) m[d] = { breakfast: "", lunch: "", dinner: "" };
  return m;
}

export default function MenuPage() {
  const [menu, setMenu] = useState<WeekMenu>(emptyMenu());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/menu")
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.message) {
          // Merge to ensure all keys exist
          const merged = emptyMenu();
          for (const d of DAYS) {
            if (data[d]) {
              merged[d] = { ...merged[d], ...data[d] };
            }
          }
          setMenu(merged);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (day: string, meal: keyof DayMenu, value: string) => {
    setMenu((prev) => ({
      ...prev,
      [day]: { ...prev[day], [meal]: value },
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/menu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(menu),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert("Failed to save menu.");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving menu.");
    } finally {
      setSaving(false);
    }
  };

  // Highlight today
  const todayIndex = new Date().getDay(); // 0=Sun, 1=Mon...
  const todayKey = todayIndex === 0 ? "sunday" : DAYS[todayIndex - 1];

  return (
    <div>
      {/* Header */}
      <div className="flex-responsive mb-8">
        <div>
          <h1>Weekly Menu</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Set the meal plan for the entire week. Tenants will see this on their portal.
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "0.65rem 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            opacity: saving ? 0.7 : 1,
            whiteSpace: "nowrap",
          }}
        >
          {saving ? (
            "Saving..."
          ) : saved ? (
            <>✅ Saved!</>
          ) : (
            <>💾 Save Menu</>
          )}
        </button>
      </div>

      {loading ? (
        <p>Loading menu...</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {DAYS.map((day) => {
            const isToday = day === todayKey;
            return (
              <div
                key={day}
                className="card animate-fade-in"
                style={{
                  borderLeft: isToday ? "4px solid var(--primary)" : "4px solid var(--border-color)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                  <h3 style={{ margin: 0, textTransform: "capitalize" }}>{DAY_LABELS[day]}</h3>
                  {isToday && (
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "12px",
                        backgroundColor: "rgba(30, 96, 145, 0.15)",
                        color: "var(--primary)",
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                      }}
                    >
                      Today
                    </span>
                  )}
                </div>

                <div className="meals-grid">
                  {MEALS.map((meal) => (
                    <div key={meal} className="input-group" style={{ margin: 0 }}>
                      <label className="input-label">{MEAL_LABELS[meal]}</label>
                      <textarea
                        className="input-field"
                        placeholder="e.g. Idli&#10;Upma..."
                        value={menu[day][meal]}
                        onChange={(e) => handleChange(day, meal, e.target.value)}
                        rows={3}
                        style={{ resize: "vertical" }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
