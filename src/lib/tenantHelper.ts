import { adminDb } from "@/lib/firebaseAdmin";
import { FieldPath } from "firebase-admin/firestore";

// In-memory cache to map tenantId to propertyId
const tenantPropertyCache = new Map<string, string>();

export async function getTenantAndProperty(tenantId: string) {
  if (!tenantId) return null;

  // 1. Check in-memory cache
  let propertyId = tenantPropertyCache.get(tenantId);
  if (propertyId) {
    try {
      const tDoc = await adminDb
        .collection("properties")
        .doc(propertyId)
        .collection("tenants")
        .doc(tenantId)
        .get();

      if (tDoc.exists) {
        return { propertyId, tenantDoc: tDoc };
      }
    } catch (e) {
      console.warn(`[tenantHelper] Cached lookup failed for property ${propertyId}, tenant ${tenantId}. Recalculating...`, e);
    }
    // If not found or failed, remove stale cache entry
    tenantPropertyCache.delete(tenantId);
  }

  // ponytail: use collectionGroup query to find tenant by ID across properties
  // avoids scanning and querying all properties in parallel, reducing DB reads to O(1)
  const tSnap = await adminDb
    .collectionGroup("tenants")
    .where(FieldPath.documentId(), "==", tenantId)
    .limit(1)
    .get();

  if (!tSnap.empty) {
    const tDoc = tSnap.docs[0];
    const propertyId = tDoc.ref.parent.parent!.id;
    tenantPropertyCache.set(tenantId, propertyId);
    return { propertyId, tenantDoc: tDoc };
  }

  return null;
}
