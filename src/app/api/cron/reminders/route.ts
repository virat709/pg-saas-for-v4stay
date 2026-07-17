import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { sendEmail, rentReminderEmail } from "@/lib/email";

export async function GET(req: Request) {
  try {
    // Require cron secret authorization
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get("authorization");
    if (!cronSecret) {
      // Allow in local dev only (no secret configured)
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ message: "CRON_SECRET not configured" }, { status: 500 });
      }
      console.warn("[CRON] Running without CRON_SECRET (development only).");
    } else if (authHeader !== `Bearer ${cronSecret}`) {
      console.warn("[CRON] Unauthorized request blocked.");
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const pSnap = await adminDb.collection("properties").get();
    
    const activeTenants: any[] = [];
    
    for (const p of pSnap.docs) {
      const pData = p.data();
      const tSnap = await adminDb.collection("properties").doc(p.id).collection("tenants")
        .where("status", "==", "active").get();
      tSnap.forEach(t => {
        activeTenants.push({ id: t.id, ...t.data(), property: { id: p.id, ...pData } });
      });
    }

    const today = new Date();
    const currentDay = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    // Month key for deduplication — e.g. "2026-07"
    const monthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

    const remindersSent: any[] = [];

    for (const tenant of activeTenants) {
      let daysLeft = 0;
      if (currentDay <= tenant.billing_cycle_day) {
        daysLeft = tenant.billing_cycle_day - currentDay;
      } else {
        daysLeft = (daysInMonth - currentDay) + tenant.billing_cycle_day;
      }

      if (daysLeft === 5) {
        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
        const magicLink = `${baseUrl}/t/${tenant.id}`;

        // ── Deduplication: skip if already reminded this billing month ───────────
        const dedupKey = `reminder_${tenant.id}_${monthKey}`;
        const dedupSnap = await adminDb.collection("cron_dedup").doc(dedupKey).get();
        if (dedupSnap.exists) {
          console.log(`[CRON] Skipping ${tenant.name} — already reminded this month.`);
          continue;
        }

        remindersSent.push({ tenantId: tenant.id, name: tenant.name, phone: tenant.phone, daysLeft });

        // ── Push in-app notification to tenant portal bell ──────────────────────
        await adminDb.collection("notifications").add({
          title: "💰 Rent Due in 5 Days",
          message: `Your rent of ₹${tenant.rent_amount} is due on day ${tenant.billing_cycle_day}. Please arrange payment soon.`,
          read: false,
          recipientRole: "tenant",
          tenantId: tenant.id,
          propertyId: tenant.property.id,
          type: "rent_reminder",
          created_at: new Date(),
        });

        // ── Send reminder email if tenant has an email on file ───────────────────
        if (tenant.email) {
          await sendEmail({
            to: tenant.email,
            subject: `Rent Reminder: ₹${tenant.rent_amount} due in 5 days — ${tenant.property.name}`,
            html: rentReminderEmail({
              tenantName: tenant.name,
              pgName: tenant.property.name,
              rentAmount: tenant.rent_amount,
              dueDay: tenant.billing_cycle_day,
              magicLink,
            }),
          });
        } else {
          console.log(`[CRON] No email for tenant ${tenant.name} (${tenant.phone}). Skipping email.`);
        }

        // ── Record dedup marker so we don't resend this month ────────────────────
        await adminDb.collection("cron_dedup").doc(dedupKey).set({
          tenantId: tenant.id,
          month: monthKey,
          sent_at: new Date(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      scannedTenants: activeTenants.length,
      remindersSentCount: remindersSent.length,
      remindersSent
    });

  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
