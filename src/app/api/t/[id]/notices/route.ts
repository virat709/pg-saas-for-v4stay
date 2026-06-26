import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const tenantId = params.id;
    if (!tenantId) return NextResponse.json({ message: "Tenant ID required" }, { status: 400 });

    // Find the property that this tenant belongs to
    // Since tenants are stored in properties/{propertyId}/tenants/{tenantId}
    const pSnap = await adminDb.collection("properties").get();
    let propertyId = null;

    for (const doc of pSnap.docs) {
      const tDoc = await doc.ref.collection("tenants").doc(tenantId).get();
      if (tDoc.exists) {
        propertyId = doc.id;
        break;
      }
    }

    if (!propertyId) {
      return NextResponse.json({ message: "Tenant not found" }, { status: 404 });
    }

    // Fetch notices for this property
    const nSnap = await adminDb.collection("properties").doc(propertyId).collection("notices").orderBy("created_at", "desc").get();
    
    const notices = nSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(notices);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
