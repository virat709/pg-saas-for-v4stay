import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { sendEmail, rentReminderEmail } from "@/lib/email";

export async function GET(req: Request) {
  try {
    // Optional Cron Secret Authorization Check
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = req.headers.get("authorization");
      if (authHeader !== `Bearer ${cronSecret}`) {
        console.warn("[CRON] Unauthorized request blocked.");
        return new Response(JSON.stringify({ message: "Unauthorized" }), { 
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
    } else {
      console.warn("[CRON] Running without CRON_SECRET authorization check (development mode).");
    }

    const propertiesRef = adminDb.collection("properties");
    const pSnap = await propertiesRef.get();
    
    let activeTenants: any[] = [];
    
    for (const p of pSnap.docs) {
      const pData = p.data();
      const tenantsRef = adminDb.collection("properties").doc(p.id).collection("tenants");
      const tSnap = await tenantsRef.where("status", "==", "active").get();
      
      tSnap.forEach(t => {
         activeTenants.push({
            id: t.id,
            ...t.data(),
            property: { id: p.id, ...pData }
         });
      });
    }

    const today = new Date();
    const currentDay = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

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

        remindersSent.push({
          tenantId: tenant.id,
          name: tenant.name,
          phone: tenant.phone,
          daysLeft,
        });

        // Send reminder email if tenant has an email on file
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
          console.log(`[CRON] No email for tenant ${tenant.name} (${tenant.phone}). Skipping reminder.`);
        }
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
