/**
 * Unified Test Runner for all sections of the PGmate project.
 * Run with: npm test
 *
 * Division of Sections:
 *   - Section 1: Notifications & Notices
 *   - Section 2: Auth & Subscription
 *   - Section 3: CRM & Owners
 *   - Section 4: Payments & Receipts
 *   - Section 5: Tenant Portal
 */
import assert from "node:assert/strict";

// Import sections
import * as notificationsSec from "./sections/notifications.test.mjs";
import * as authSubSec from "./sections/auth-sub.test.mjs";
import * as crmOwnersSec from "./sections/crm-owners.test.mjs";
import * as paymentsReceiptsSec from "./sections/payments-receipts.test.mjs";
import * as tenantPortalSec from "./sections/tenant-portal.test.mjs";
import { runSecurityAndBuildTests } from "./sections/security-and-build.test.mjs";

let passed = 0;
let failed = 0;
let currentSection = "";

function test(name, fn) {
  try {
    fn();
    console.log(`    \u2713 [${currentSection}] ${name}`);
    passed++;
  } catch (e) {
    console.error(`    \u2717 [${currentSection}] ${name}`);
    console.error(`      ERROR: ${e.message}`);
    failed++;
  }
}

async function runSuite() {
  console.log("\n========================================================");
  console.log("             PGMATE SYSTEM TEST SUITE");
  console.log("========================================================\n");

  // Run Section 1
  currentSection = "Sec 1: Notifications & Notices";
  console.log(`\u25b6 Running ${currentSection}...`);
  notificationsSec.run(test, assert);

  // Run Section 2
  currentSection = "Sec 2: Auth & Subscription";
  console.log(`\n\u25b6 Running ${currentSection}...`);
  authSubSec.run(test, assert);

  // Run Section 3
  currentSection = "Sec 3: CRM & Owners";
  console.log(`\n\u25b6 Running ${currentSection}...`);
  crmOwnersSec.run(test, assert);

  // Run Section 4
  currentSection = "Sec 4: Payments & Receipts";
  console.log(`\n\u25b6 Running ${currentSection}...`);
  paymentsReceiptsSec.run(test, assert);

  // Run Section 5
  currentSection = "Sec 5: Tenant Portal";
  console.log(`\n\u25b6 Running ${currentSection}...`);
  tenantPortalSec.run(test, assert);

  // Run Section 6: Security & Build Verification
  await runSecurityAndBuildTests();

  // Summarize
  console.log("\n========================================================");
  console.log("                  TEST RESULTS SUMMARY");
  console.log("========================================================");
  console.log(`  Total Tests Run: ${passed + failed}`);
  console.log(`  Passed         : \x1b[32m${passed}\x1b[0m`);
  if (failed > 0) {
    console.log(`  Failed         : \x1b[31m${failed}\x1b[0m`);
    console.log("========================================================\n");
    process.exit(1);
  } else {
    console.log(`  Failed         : 0`);
    console.log("  Status         : \x1b[32mALL PASSED\x1b[0m");
    console.log("========================================================\n");
  }
}

runSuite().catch((err) => {
  console.error("Test Suite execution failed:", err);
  process.exit(1);
});
