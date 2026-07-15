/**
 * Section 5: Tenant Portal Helper Tests
 */
export function run(test, assert) {
  // ── Logic Under Test: Billing cycle days left calculator ─────────────────────
  function getDaysLeft({ billingDay, today }) {
    if (!billingDay) return 0;
    const day = parseInt(billingDay.toString());
    const currentDay = today.getDate();

    if (currentDay <= day) {
      return day - currentDay;
    } else {
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      return (daysInMonth - currentDay) + day;
    }
  }

  // ── Logic Under Test: In-memory Tenant Property Cache ───────────────────────
  class TenantPropertyResolver {
    constructor() {
      this.cache = new Map();
      this.dbHits = 0;
    }

    async resolve(tenantId, mockDb) {
      if (!tenantId) return null;

      // 1. Check in-memory cache
      const cachedPropertyId = this.cache.get(tenantId);
      if (cachedPropertyId) {
        const tenantExists = mockDb.checkTenantExists(cachedPropertyId, tenantId);
        if (tenantExists) {
          return { propertyId: cachedPropertyId };
        }
        // remove stale cache entry
        this.cache.delete(tenantId);
      }

      // 2. Mock DB check
      this.dbHits++;
      const result = mockDb.findTenant(tenantId);
      if (result) {
        this.cache.set(tenantId, result.propertyId);
        return result;
      }
      return null;
    }
  }

  // ── Test Cases ─────────────────────────────────────────────────────────────
  test("Days left: billing day in the future (same month)", () => {
    const today = new Date("2026-07-15T12:00:00Z");
    const days = getDaysLeft({ billingDay: 20, today });
    assert.equal(days, 5); // 20 - 15
  });

  test("Days left: billing day in the past (next month)", () => {
    const today = new Date("2026-07-15T12:00:00Z");
    const days = getDaysLeft({ billingDay: 5, today });
    // July has 31 days. (31 - 15) + 5 = 21 days left.
    assert.equal(days, 21);
  });

  test("Days left: billing day on February boundary leap year", () => {
    // 2024 is a leap year (February has 29 days)
    const today = new Date("2024-02-25T12:00:00Z");
    const days = getDaysLeft({ billingDay: 2, today });
    // (29 - 25) + 2 = 6 days left (Feb 25 -> Feb 29 is 4 days + 2 days of March)
    assert.equal(days, 6);
  });

  test("Days left: billing day on February boundary non-leap year", () => {
    // 2025 is a non-leap year (February has 28 days)
    const today = new Date("2025-02-25T12:00:00Z");
    const days = getDaysLeft({ billingDay: 2, today });
    // (28 - 25) + 2 = 5 days left (Feb 25 -> Feb 28 is 3 days + 2 days of March)
    assert.equal(days, 5);
  });

  test("Days left: handles string inputs correctly", () => {
    const today = new Date("2026-07-15T12:00:00Z");
    const days = getDaysLeft({ billingDay: "25", today });
    assert.equal(days, 10);
  });

  test("Cache resolver: retrieves from database on first call", async () => {
    const resolver = new TenantPropertyResolver();
    const mockDb = {
      findTenant: (tid) => (tid === "tenant-1" ? { propertyId: "prop-A" } : null),
      checkTenantExists: () => true,
    };

    const res = await resolver.resolve("tenant-1", mockDb);
    assert.equal(res.propertyId, "prop-A");
    assert.equal(resolver.dbHits, 1);
  });

  test("Cache resolver: hits in-memory cache on subsequent call", async () => {
    const resolver = new TenantPropertyResolver();
    const mockDb = {
      findTenant: (tid) => (tid === "tenant-1" ? { propertyId: "prop-A" } : null),
      checkTenantExists: (pid, tid) => pid === "prop-A" && tid === "tenant-1",
    };

    // First call: DB query
    await resolver.resolve("tenant-1", mockDb);
    // Second call: Cache hit
    const res = await resolver.resolve("tenant-1", mockDb);

    assert.equal(res.propertyId, "prop-A");
    assert.equal(resolver.dbHits, 1); // dbHits should still be 1 (second hit was cached)
  });

  test("Cache resolver: clears stale cache and falls back if tenant moved properties", async () => {
    const resolver = new TenantPropertyResolver();
    let tenantLocation = "prop-A";
    const mockDb = {
      findTenant: (tid) => (tid === "tenant-1" ? { propertyId: tenantLocation } : null),
      checkTenantExists: (pid, tid) => pid === tenantLocation && tid === "tenant-1",
    };

    // 1. Resolve and cache under prop-A
    await resolver.resolve("tenant-1", mockDb);

    // 2. Simulate tenant moving to prop-B in DB
    tenantLocation = "prop-B";

    // 3. Resolve again. Cache check for prop-A fails. Should hit DB again and update cache.
    const res = await resolver.resolve("tenant-1", mockDb);

    assert.equal(res.propertyId, "prop-B");
    assert.equal(resolver.dbHits, 2); // DB queried again
  });
}
