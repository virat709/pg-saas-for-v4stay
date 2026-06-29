import { adminDb } from "@/lib/firebaseAdmin";

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

  // 2. Fallback: Scan properties in parallel
  const pSnapList = await adminDb.collection("properties").get();
  const checks = await Promise.all(
    pSnapList.docs.map(async (doc) => {
      const tDoc = await doc.ref.collection("tenants").doc(tenantId).get();
      return tDoc.exists ? { propertyId: doc.id, tenantDoc: tDoc } : null;
    })
  );

  const found = checks.find((c) => c !== null);
  if (found) {
    tenantPropertyCache.set(tenantId, found.propertyId);
    return found;
  }

  return null;
}
