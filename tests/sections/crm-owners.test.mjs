/**
 * Section 3: CRM & Owners Tests
 */
export function run(test, assert) {
  // ── Logic Under Test: Timestamp normalizer ──────────────────────────────────
  function parseTimestamp(val) {
    if (!val) return null;
    if (typeof val === "object" && typeof val.seconds === "number") {
      return new Date(val.seconds * 1000);
    }
    return new Date(val);
  }

  // ── Logic Under Test: Plan duration calculator ──────────────────────────────
  function getPlanDurationMonths(planTier) {
    const plan = planTier || "Free / Trial";
    const planLower = plan.toLowerCase();
    if (planLower.includes("6 months") || planLower.includes("starter")) {
      return 6;
    }
    if (planLower.includes("1 year") || planLower.includes("premium")) {
      return 12;
    }
    return 0;
  }

  // ── Logic Under Test: Subscription expiry and days left ──────────────────────
  function calculateSubscriptionStatus({ status, activatedAt, durationMonths, isTrial, nowTime }) {
    if (status !== "active" || !activatedAt || (!isTrial && durationMonths <= 0)) {
      return { expiresAt: null, daysLeft: null };
    }

    const expiresAt = new Date(activatedAt);
    if (isTrial) {
      expiresAt.setDate(expiresAt.getDate() + 30);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + durationMonths);
    }

    const diffTime = expiresAt.getTime() - nowTime;
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      expiresAt,
      daysLeft: daysLeft !== null ? Math.max(0, daysLeft) : null,
    };
  }

  // ── Logic Under Test: Property grouping ─────────────────────────────────────
  function countPropertiesPerOwner(propertiesDocs) {
    const counts = {};
    propertiesDocs.forEach((d) => {
      const ownerId = d.ownerId;
      if (ownerId) {
        counts[ownerId] = (counts[ownerId] || 0) + 1;
      }
    });
    return counts;
  }

  // ── Test Cases ─────────────────────────────────────────────────────────────
  test("Timestamp parser: parses firestore timestamp object", () => {
    const input = { seconds: 1780000000 };
    const date = parseTimestamp(input);
    assert.equal(date.getTime(), 1780000000000);
  });

  test("Timestamp parser: parses raw string/date values", () => {
    const date = parseTimestamp("2026-07-15T12:00:00.000Z");
    assert.equal(date.toISOString(), "2026-07-15T12:00:00.000Z");
  });

  test("Plan duration: parses Starter / 6 Months correctly", () => {
    assert.equal(getPlanDurationMonths("Starter Plan"), 6);
    assert.equal(getPlanDurationMonths("6 Months Pro"), 6);
    assert.equal(getPlanDurationMonths("starter"), 6);
  });

  test("Plan duration: parses Premium / 1 Year correctly", () => {
    assert.equal(getPlanDurationMonths("Premium Plan"), 12);
    assert.equal(getPlanDurationMonths("1 Year Access"), 12);
    assert.equal(getPlanDurationMonths("premium"), 12);
  });

  test("Plan duration: returns 0 for trial/free plans", () => {
    assert.equal(getPlanDurationMonths("Free / Trial"), 0);
    assert.equal(getPlanDurationMonths("Any plan"), 0);
  });

  test("Expiry: calculates correct future date and positive days left", () => {
    const activatedAt = new Date("2026-07-01T12:00:00.000Z");
    const durationMonths = 6;
    const nowTime = new Date("2026-07-15T12:00:00.000Z").getTime();

    const { expiresAt, daysLeft } = calculateSubscriptionStatus({
      status: "active",
      activatedAt,
      durationMonths,
      nowTime,
    });

    // Expiry should be exactly 6 months later: 2027-01-01
    assert.equal(expiresAt.toISOString().startsWith("2027-01-01"), true);
    // Days between July 15 and Jan 1: ~170 days
    assert.ok(daysLeft > 165 && daysLeft < 172);
  });

  test("Expiry: returns 0 days left if subscription has expired in time but marked active", () => {
    const activatedAt = new Date("2025-07-01T12:00:00.000Z");
    const durationMonths = 6; // expired Jan 2026
    const nowTime = new Date("2026-07-15T12:00:00.000Z").getTime();

    const { daysLeft } = calculateSubscriptionStatus({
      status: "active",
      activatedAt,
      durationMonths,
      nowTime,
    });

    assert.equal(daysLeft, 0); // clamped to 0
  });

  test("Expiry: returns null for inactive plan", () => {
    const activatedAt = new Date("2026-07-01");
    const { expiresAt, daysLeft } = calculateSubscriptionStatus({
      status: "inactive",
      activatedAt,
      durationMonths: 6,
      nowTime: Date.now(),
    });
    assert.equal(expiresAt, null);
    assert.equal(daysLeft, null);
  });

  test("Property counting: groups properties per owner correctly", () => {
    const props = [
      { ownerId: "owner-1" },
      { ownerId: "owner-2" },
      { ownerId: "owner-1" },
      { ownerId: "owner-3" },
      { ownerId: null },
    ];
    const res = countPropertiesPerOwner(props);
    assert.equal(res["owner-1"], 2);
    assert.equal(res["owner-2"], 1);
    assert.equal(res["owner-3"], 1);
    assert.equal(res["owner-4"], undefined);
  });

  test("Expiry: calculates correct trial expiry (30 days) and positive days left", () => {
    const activatedAt = new Date("2026-07-01T12:00:00.000Z");
    const nowTime = new Date("2026-07-15T12:00:00.000Z").getTime();

    const { expiresAt, daysLeft } = calculateSubscriptionStatus({
      status: "active",
      activatedAt,
      durationMonths: 0,
      isTrial: true,
      nowTime,
    });

    // Expiry should be exactly 30 days after July 1: July 31
    assert.equal(expiresAt.toISOString().startsWith("2026-07-31"), true);
    // Days between July 15 and July 31: 16 days
    assert.equal(daysLeft, 16);
  });

  test("Expiry: returns 0 days left if trial has expired", () => {
    const activatedAt = new Date("2026-06-01T12:00:00.000Z"); // expired July 1
    const nowTime = new Date("2026-07-15T12:00:00.000Z").getTime();

    const { daysLeft } = calculateSubscriptionStatus({
      status: "active",
      activatedAt,
      durationMonths: 0,
      isTrial: true,
      nowTime,
    });

    assert.equal(daysLeft, 0);
  });
}
