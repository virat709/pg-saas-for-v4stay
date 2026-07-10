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

  // Query all properties in parallel to locate the tenant.
  // Subsequent calls for this tenant will hit the in-memory cache instantly.
  const pSnap = await adminDb.collection("properties").get();
  const results = await Promise.all(
    pSnap.docs.map(async (pDoc) => {
      try {
        const tDoc = await pDoc.ref.collection("tenants").doc(tenantId).get();
        if (tDoc.exists) {
          return { propertyId: pDoc.id, tenantDoc: tDoc };
        }
      } catch (e) {
        console.error(`Error checking tenant ${tenantId} in property ${pDoc.id}:`, e);
      }
      return null;
    })
  );

  const found = results.find(r => r !== null);
  if (found) {
    tenantPropertyCache.set(tenantId, found.propertyId);
    return found;
  }

  return null;
}
