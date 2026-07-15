/**
 * Section 1: Notifications & Notices Tests
 */
export function run(test, assert) {
  // ── Helpers under test ─────────────────────────────────────────────────────
  function computeCounts(notifications) {
    const unread = notifications.filter((n) => !n.read);
    const byType = {};
    unread.forEach((n) => {
      const t = n.type || "other";
      byType[t] = (byType[t] || 0) + 1;
    });
    return { unreadCount: unread.length, unreadByType: byType };
  }

  function applyMarkAsRead(notifications, id) {
    return notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
  }

  function applyMarkAllAsRead(notifications) {
    return notifications.map((n) => ({ ...n, read: true }));
  }

  function sortAndSlice(docs) {
    return docs
      .map((d) => ({
        id: d.id,
        ...d.data,
        created_at: d.data.created_at ?? null,
      }))
      .sort((a, b) => {
        const aTime = a.created_at ?? 0;
        const bTime = b.created_at ?? 0;
        return bTime - aTime;
      })
      .slice(0, 30);
  }

  // ── Fixtures ────────────────────────────────────────────────────────────────
  const notifs = [
    { id: "a", title: "T1", message: "M1", read: false, created_at: 1000, type: "payment" },
    { id: "b", title: "T2", message: "M2", read: true,  created_at: 2000, type: "complaint" },
    { id: "c", title: "T3", message: "M3", read: false, created_at: 3000, type: "complaint" },
    { id: "d", title: "T4", message: "M4", read: false, created_at: 4000, type: "payment" },
  ];

  // ── Test Cases ─────────────────────────────────────────────────────────────
  test("Notification count computation", () => {
    const { unreadCount, unreadByType } = computeCounts(notifs);
    assert.equal(unreadCount, 3);
    assert.equal(unreadByType["payment"], 2);
    assert.equal(unreadByType["complaint"], 1);
  });

  test("Optimistic markAsRead decrements counts correctly", () => {
    const next = applyMarkAsRead(notifs, "a");
    const { unreadCount, unreadByType } = computeCounts(next);
    assert.equal(unreadCount, 2);
    assert.equal(unreadByType["payment"], 1);
  });

  test("Optimistic markAllAsRead zeroes out all counts", () => {
    const next = applyMarkAllAsRead(notifs);
    const { unreadCount, unreadByType } = computeCounts(next);
    assert.equal(unreadCount, 0);
    assert.deepEqual(unreadByType, {});
  });

  test("API notifications GET sorting & slicing", () => {
    const makeDoc = (id, millis) => ({
      id,
      data: { created_at: millis }
    });
    const docs = Array.from({ length: 50 }, (_, i) => makeDoc(String(i), i * 1000));
    const result = sortAndSlice(docs);
    assert.equal(result.length, 30);
    assert.equal(result[0].created_at, 49000); // Most recent first
    assert.equal(result[29].created_at, 20000);
  });

  test("API notifications handles null created_at", () => {
    const docs = [
      { id: "a", data: { created_at: null } },
      { id: "b", data: { created_at: 5000 } }
    ];
    const result = sortAndSlice(docs);
    assert.equal(result[0].id, "b");
  });
}
