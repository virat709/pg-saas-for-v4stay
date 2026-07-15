import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

// Allowed admin email(s) to view global CRM
const ADMIN_EMAILS = ["v4services.in@gmail.com"];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email.toLowerCase();
    const isAdmin = ADMIN_EMAILS.includes(userEmail);

    if (!isAdmin) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const ownersQuery = adminDb.collection("owners");

    const ownersSnapshot = await ownersQuery.get();
    const propertiesSnapshot = await adminDb.collection("properties").get();

    // Group properties count by ownerId
    const propertyCounts: Record<string, number> = {};
    propertiesSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const ownerId = data.ownerId;
      if (ownerId) {
        propertyCounts[ownerId] = (propertyCounts[ownerId] || 0) + 1;
      }
    });

    const ownersData = ownersSnapshot.docs.map((doc) => {
      const data = doc.data();
      const ownerId = doc.id;
      
      const createdAt = data.created_at
        ? typeof data.created_at === "object" && data.created_at.seconds
          ? new Date(data.created_at.seconds * 1000)
          : new Date(data.created_at)
        : null;

      const activatedAt = data.subscription_activated_at
        ? typeof data.subscription_activated_at === "object" && data.subscription_activated_at.seconds
          ? new Date(data.subscription_activated_at.seconds * 1000)
          : new Date(data.subscription_activated_at)
        : null;

      const planTier = data.plan_tier || data.subscription_plan || "No Active Plan";
      let status = data.subscription_status || "inactive";

      // Calculate subscription duration
      const planTierLower = planTier.toLowerCase();
      let durationMonths = 0;
      if (planTierLower.includes("6 months") || planTierLower.includes("starter")) {
        durationMonths = 6;
      } else if (planTierLower.includes("1 year") || planTierLower.includes("premium")) {
        durationMonths = 12;
      }

      let expiresAt: Date | null = null;
      let daysLeft: number | null = null;

      if (status === "active" && activatedAt && durationMonths > 0) {
        expiresAt = new Date(activatedAt);
        expiresAt.setMonth(expiresAt.getMonth() + durationMonths);
        
        const diffTime = expiresAt.getTime() - Date.now();
        daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (daysLeft <= 0) {
          daysLeft = 0;
          status = "expired";
        }
      } else if (status === "active") {
        // Active status but missing activation or duration => treat as inactive
        status = "inactive";
      }

      return {
        id: ownerId,
        name: data.name || "Unnamed Owner",
        email: data.email || "",
        phone: data.phone || "",
        createdAt: createdAt ? createdAt.toISOString() : null,
        planTier,
        status,
        activatedAt: activatedAt ? activatedAt.toISOString() : null,
        expiresAt: expiresAt ? expiresAt.toISOString() : null,
        daysLeft: daysLeft !== null ? Math.max(0, daysLeft) : null,
        propertyCount: propertyCounts[ownerId] || 0,
        propertyLimit: data.property_limit || 1,
      };
    });

    // Sort by registration date descending
    ownersData.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json({
      isAdmin,
      owners: ownersData,
    });
  } catch (error) {
    console.error("[CRM GET Error]", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
