/**
 * Section 4: Payments & Receipts Tests
 */
export function run(test, assert) {
  // ── Logic Under Test: Amount validation ─────────────────────────────────────
  function validateAmount(amount) {
    if (!amount) return false;
    const parsed = parseFloat(amount);
    return !isNaN(parsed) && parsed > 0;
  }

  // ── Logic Under Test: UPI format validation ─────────────────────────────────
  function validateUpiId(upiId) {
    if (!upiId) return true; // empty allows clearing
    if (upiId.length > 100) return false;
    // Enhanced regex allowing dots/hyphens in the bank handle after the @ symbol
    return /^[a-zA-Z0-9._\-]+@[a-zA-Z0-9.\-_]+$/.test(upiId.trim());
  }

  // ── Logic Under Test: Receipt authorization check ───────────────────────────
  function authorizeReceipt({ sessionUserId, tenantIdParam, ownerPropertyIds, paymentDocData, tenantPropertyId }) {
    // 1. Owner authorization check
    if (sessionUserId) {
      // If the payment's property belongs to the logged-in owner
      if (ownerPropertyIds.includes(paymentDocData.propertyId)) {
        return { authorized: true, role: "owner" };
      }
    }

    // 2. Tenant authorization check
    if (tenantIdParam) {
      if (paymentDocData.tenantId === tenantIdParam && tenantPropertyId === paymentDocData.propertyId) {
        return { authorized: true, role: "tenant" };
      }
    }

    return { authorized: false };
  }

  // ── Test Cases ─────────────────────────────────────────────────────────────
  test("Amount validation: accepts valid positive numbers", () => {
    assert.equal(validateAmount("5000"), true);
    assert.equal(validateAmount("4500.50"), true);
  });

  test("Amount validation: rejects non-numbers and negatives", () => {
    assert.equal(validateAmount("abc"), false);
    assert.equal(validateAmount("-100"), false);
    assert.equal(validateAmount(""), false);
    assert.equal(validateAmount(null), false);
  });

  test("UPI ID validation: accepts standard handles", () => {
    assert.equal(validateUpiId("test@ybl"), true);
    assert.equal(validateUpiId("user.name_1@oksbi"), true);
  });

  test("UPI ID validation: accepts handles with dots/hyphens in bank handle", () => {
    assert.equal(validateUpiId("example@okhdfc-bank"), true);
    assert.equal(validateUpiId("name@ok.axis"), true);
  });

  test("UPI ID validation: rejects invalid formats or extremely long handles", () => {
    assert.equal(validateUpiId("invalid-format"), false);
    assert.equal(validateUpiId("name@"), false);
    assert.equal(validateUpiId("a".repeat(101) + "@ybl"), false);
  });

  test("Receipt authorization: allows owner if property matches", () => {
    const payment = { propertyId: "property-A", tenantId: "tenant-1" };
    const auth = authorizeReceipt({
      sessionUserId: "owner-123",
      ownerPropertyIds: ["property-A", "property-B"],
      paymentDocData: payment,
    });
    assert.equal(auth.authorized, true);
    assert.equal(auth.role, "owner");
  });

  test("Receipt authorization: rejects owner if property does not match", () => {
    const payment = { propertyId: "property-C", tenantId: "tenant-1" };
    const auth = authorizeReceipt({
      sessionUserId: "owner-123",
      ownerPropertyIds: ["property-A", "property-B"],
      paymentDocData: payment,
    });
    assert.equal(auth.authorized, false);
  });

  test("Receipt authorization: allows tenant if tenantId and propertyId match", () => {
    const payment = { propertyId: "property-A", tenantId: "tenant-1" };
    const auth = authorizeReceipt({
      tenantIdParam: "tenant-1",
      tenantPropertyId: "property-A",
      paymentDocData: payment,
    });
    assert.equal(auth.authorized, true);
    assert.equal(auth.role, "tenant");
  });

  test("Receipt authorization: rejects tenant if tenantId mismatch", () => {
    const payment = { propertyId: "property-A", tenantId: "tenant-1" };
    const auth = authorizeReceipt({
      tenantIdParam: "tenant-2", // mismatched tenant
      tenantPropertyId: "property-A",
      paymentDocData: payment,
    });
    assert.equal(auth.authorized, false);
  });

  test("Receipt authorization: rejects tenant if property mismatch", () => {
    const payment = { propertyId: "property-B", tenantId: "tenant-1" };
    const auth = authorizeReceipt({
      tenantIdParam: "tenant-1",
      tenantPropertyId: "property-A", // mismatched property
      paymentDocData: payment,
    });
    assert.equal(auth.authorized, false);
  });
}
