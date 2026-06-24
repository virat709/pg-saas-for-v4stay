import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export async function GET(req: Request) {
  try {
    const propertiesRef = collection(db, "properties");
    const pSnap = await getDocs(propertiesRef);
    
    let activeTenants: any[] = [];
    
    for (const p of pSnap.docs) {
      const pData = p.data();
      const tenantsRef = collection(db, "properties", p.id, "tenants");
      const tQ = query(tenantsRef, where("status", "==", "active"));
      const tSnap = await getDocs(tQ);
      
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

    activeTenants.forEach(tenant => {
      let daysLeft = 0;
      if (currentDay <= tenant.billing_cycle_day) {
        daysLeft = tenant.billing_cycle_day - currentDay;
      } else {
        daysLeft = (daysInMonth - currentDay) + tenant.billing_cycle_day;
      }

      if (daysLeft === 5) {
        const message = `Hi ${tenant.name}, your rent of ₹${tenant.rent_amount} for ${tenant.property.name} is due in 5 days (on the ${tenant.billing_cycle_day}th). Please arrange payment to avoid late fees.`;
        console.log(`[WHATSAPP MOCK] Sent to ${tenant.phone}: ${message}`);
        
        remindersSent.push({
          tenantId: tenant.id,
          name: tenant.name,
          phone: tenant.phone,
          daysLeft,
          message
        });
      }
    });

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
