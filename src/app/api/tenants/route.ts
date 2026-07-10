import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";
import { sendEmail, welcomeTenantEmail } from "@/lib/email";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const pSnap = await adminDb.collection("properties").where("ownerId", "==", session.user.id).get();
    if (pSnap.empty) return NextResponse.json([], { status: 200 }); // Return empty instead of error to prevent breaking client dashboard

    const propertyIds = pSnap.docs.map(doc => doc.id);
    const propertiesMap = Object.fromEntries(pSnap.docs.map(doc => [doc.id, doc.data()]));

    const { searchParams } = new URL(req.url);
    const propertyIdParam = searchParams.get("propertyId");

    let targets = propertyIds;
    if (propertyIdParam && propertyIdParam !== "all") {
      if (!propertyIds.includes(propertyIdParam)) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
      targets = [propertyIdParam];
    }

    const allTenants: any[] = [];

    await Promise.all(
      targets.map(async (pId) => {
        const tSnap = await adminDb.collection("properties").doc(pId).collection("tenants").get();
        
        const bedsMap: Record<string, any> = {};
        const roomsMap: Record<string, any> = {};

        await Promise.all(
          tSnap.docs.map(async (tDoc) => {
            const tData = tDoc.data();
            if (tData.roomId && tData.bedId) {
              try {
                const bedRef = adminDb.collection("properties").doc(pId).collection("rooms").doc(tData.roomId).collection("beds").doc(tData.bedId);
                const roomRef = adminDb.collection("properties").doc(pId).collection("rooms").doc(tData.roomId);

                const [bedSnap, roomSnap] = await Promise.all([
                  bedRef.get(),
                  roomsMap[tData.roomId] ? Promise.resolve(null) : roomRef.get()
                ]);

                if (roomSnap && roomSnap.exists) {
                  roomsMap[tData.roomId] = { id: roomSnap.id, ...roomSnap.data() };
                }

                if (bedSnap.exists) {
                  bedsMap[tData.bedId] = {
                    id: bedSnap.id,
                    ...bedSnap.data(),
                    room: roomsMap[tData.roomId] || null
                  };
                }
              } catch (e) {
                console.error(`Failed to load bed/room details for tenant ${tDoc.id}:`, e);
              }
            }
          })
        );

        tSnap.docs.forEach((tDoc) => {
          const tData = tDoc.data();
          const bedData = tData.bedId ? (bedsMap[tData.bedId] || null) : null;
          allTenants.push({
            id: tDoc.id,
            ...tData,
            bed: bedData,
            propertyId: pId,
            propertyName: propertiesMap[pId]?.name || "My PG"
          });
        });
      })
    );

    // Sort descending by created_at
    allTenants.sort((a: any, b: any) => {
      const aTime = a.created_at?.toMillis ? a.created_at.toMillis() : (a.created_at instanceof Date ? a.created_at.getTime() : 0);
      const bTime = b.created_at?.toMillis ? b.created_at.toMillis() : (b.created_at instanceof Date ? b.created_at.getTime() : 0);
      return bTime - aTime;
    });

    return NextResponse.json(allTenants, {
      headers: { 'Cache-Control': 'private, max-age=30, stale-while-revalidate=60' }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const pSnap = await adminDb.collection("properties").where("ownerId", "==", session.user.id).get();
    if (pSnap.empty) return NextResponse.json({ message: "No property found" }, { status: 404 });
    const propertyIds = pSnap.docs.map(doc => doc.id);

    const body = await req.json();
    const { name, phone, bedId: combinedBedId, date_joined, rent_amount, billing_cycle_day, security_deposit_amount, emergency_contact, photo, id_proof_doc, propertyId } = body;

    let targetPropertyId = propertyId;
    if (!targetPropertyId) {
      targetPropertyId = pSnap.docs[0].id;
    } else if (!propertyIds.includes(targetPropertyId)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Input validation
    if (!name?.trim()) return NextResponse.json({ message: "Name is required" }, { status: 400 });
    if (!phone?.trim()) return NextResponse.json({ message: "Phone is required" }, { status: 400 });
    if (!combinedBedId || !combinedBedId.includes("_")) {
      return NextResponse.json({ message: "A valid bed assignment is required" }, { status: 400 });
    }
    if (!rent_amount || isNaN(parseFloat(rent_amount))) {
      return NextResponse.json({ message: "Valid rent amount is required" }, { status: 400 });
    }

    const [roomId, bedId] = combinedBedId.split("_");

    // Check if bed is already occupied
    const bSnap = await adminDb.collection("properties").doc(targetPropertyId).collection("rooms").doc(roomId).collection("beds").doc(bedId).get();
    if (!bSnap.exists || bSnap.data()?.status === "occupied") {
      return NextResponse.json({ message: "Bed is unavailable" }, { status: 400 });
    }

    const batch = adminDb.batch();
    const newTenantRef = adminDb.collection("properties").doc(targetPropertyId).collection("tenants").doc();

    batch.set(newTenantRef, {
      roomId,
      bedId,
      name,
      phone,
      date_joined,
      rent_amount: parseFloat(rent_amount),
      billing_cycle_day: parseInt(billing_cycle_day),
      security_deposit_amount: parseFloat(security_deposit_amount),
      emergency_contact: emergency_contact || null,
      photo: photo || null,
      id_proof_doc: id_proof_doc || null,
      status: "active",
      created_at: new Date()
    });

    const bedRef = adminDb.collection("properties").doc(targetPropertyId).collection("rooms").doc(roomId).collection("beds").doc(bedId);
    batch.update(bedRef, {
      status: "occupied",
      tenantId: newTenantRef.id,
      updated_at: new Date()
    });

    await batch.commit();

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const magicLink = `${baseUrl}/t/${newTenantRef.id}`;
    const propertyDoc = pSnap.docs.find(doc => doc.id === targetPropertyId);
    const propertyData = propertyDoc ? propertyDoc.data() : { name: "My PG" };

    // Send welcome email if tenant has an email on file
    const tenantEmail = body.email?.trim();
    if (tenantEmail) {
      await sendEmail({
        to: tenantEmail,
        subject: `Welcome to ${propertyData.name} — Your Tenant Portal`,
        html: welcomeTenantEmail({
          tenantName: name,
          pgName: propertyData.name,
          magicLink,
        }),
      });
    } else {
      // Fallback: log magic link for manual sharing
      console.log(`[TENANT] Magic link for ${name} (${phone}): ${magicLink}`);
    }

    return NextResponse.json({ id: newTenantRef.id, name, status: "active", magicLink }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
