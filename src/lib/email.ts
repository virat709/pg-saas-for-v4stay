/**
 * Email utility using Resend.
 *
 * Setup:
 *  1. npm install resend
 *  2. Add RESEND_API_KEY=re_xxxx to .env.local
 *  3. (Production) verify your domain at resend.com and update FROM_EMAIL
 *
 * For testing, Resend allows sending from onboarding@resend.dev to your own verified email.
 */

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "PGmate <onboarding@resend.dev>";
const RESEND_API_KEY = process.env.RESEND_API_KEY;

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  if (!RESEND_API_KEY) {
    // Graceful degradation: log and skip if no key configured
    console.warn(`[EMAIL] No RESEND_API_KEY set. Skipping email to ${to} | Subject: ${subject}`);
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("[EMAIL] Resend API error:", err);
    } else {
      console.log(`[EMAIL] Sent to ${to} | Subject: ${subject}`);
    }
  } catch (err) {
    console.error("[EMAIL] Failed to send email:", err);
  }
}

// ── Email Templates ───────────────────────────────────────────────────────────

const baseStyle = `
  font-family: 'Helvetica Neue', Arial, sans-serif;
  background-color: #0f172a;
  color: #f8fafc;
  margin: 0; padding: 0;
`;

const containerStyle = `
  max-width: 600px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem;
`;

const headerStyle = `
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
`;

const logoStyle = `
  font-size: 1.75rem;
  font-weight: 800;
  color: #00c49f;
  letter-spacing: -0.5px;
`;

const cardStyle = `
  background-color: #0e1e38;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 1.5rem 2rem;
  margin-bottom: 1.5rem;
`;

const footerStyle = `
  text-align: center;
  margin-top: 2rem;
  color: #475569;
  font-size: 0.8rem;
  line-height: 1.6;
`;

/** Sent to a tenant when they are added to the system */
export function welcomeTenantEmail({
  tenantName,
  pgName,
  magicLink,
}: {
  tenantName: string;
  pgName: string;
  magicLink: string;
}): string {
  return `<!DOCTYPE html><html><body style="${baseStyle}">
  <div style="${containerStyle}">
    <div style="${headerStyle}">
      <div style="${logoStyle}">PGmate</div>
      <p style="color:#94a3b8; margin-top:0.5rem; font-size:0.9rem;">by v4stay</p>
    </div>

    <h1 style="color:#f8fafc; font-size:1.5rem; margin-bottom:0.5rem;">Welcome to ${pgName}! 🎉</h1>
    <p style="color:#94a3b8; margin-bottom:1.5rem;">Hi ${tenantName}, your stay has been confirmed. Here's your personal tenant portal to track your rent, view notices, and raise any maintenance requests.</p>

    <div style="${cardStyle}">
      <p style="color:#94a3b8; margin:0 0 1rem; font-size:0.9rem;">Your Secure Tenant Portal:</p>
      <a href="${magicLink}" style="display:inline-block; padding:0.75rem 1.75rem; background-color:#00c49f; color:#0f172a; border-radius:8px; text-decoration:none; font-weight:700; font-size:1rem;">
        Access My Portal →
      </a>
      <p style="color:#475569; font-size:0.8rem; margin-top:1rem;">This link is unique to you. Do not share it.</p>
    </div>

    <div style="color:#94a3b8; font-size:0.875rem; line-height:1.7;">
      <p>If you have any questions, contact your PG manager directly.</p>
    </div>

    <div style="${footerStyle}">
      <p>© ${new Date().getFullYear()} PGmate (v4stay) · <a href="mailto:v4services.in@gmail.com" style="color:#00c49f; text-decoration:none;">v4services.in@gmail.com</a></p>
    </div>
  </div>
</body></html>`;
}

/** Sent 5 days before rent due date */
export function rentReminderEmail({
  tenantName,
  pgName,
  rentAmount,
  dueDay,
  magicLink,
}: {
  tenantName: string;
  pgName: string;
  rentAmount: number;
  dueDay: number;
  magicLink: string;
}): string {
  return `<!DOCTYPE html><html><body style="${baseStyle}">
  <div style="${containerStyle}">
    <div style="${headerStyle}">
      <div style="${logoStyle}">PGmate</div>
      <p style="color:#94a3b8; margin-top:0.5rem; font-size:0.9rem;">by v4stay</p>
    </div>

    <h1 style="color:#f8fafc; font-size:1.5rem; margin-bottom:0.5rem;">Rent Reminder ⏰</h1>
    <p style="color:#94a3b8; margin-bottom:1.5rem;">Hi ${tenantName}, your rent for <strong style="color:#f8fafc">${pgName}</strong> is due in <strong style="color:#f59e0b">5 days</strong> (on the ${dueDay}th of this month). Please arrange payment to avoid late fees.</p>

    <div style="${cardStyle}">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <p style="color:#94a3b8; margin:0; font-size:0.8rem; text-transform:uppercase; letter-spacing:0.05em;">Amount Due</p>
          <p style="color:#00c49f; font-size:2rem; font-weight:800; margin:0.25rem 0 0;">₹${rentAmount.toLocaleString("en-IN")}</p>
        </div>
        <div style="text-align:right;">
          <p style="color:#94a3b8; margin:0; font-size:0.8rem; text-transform:uppercase; letter-spacing:0.05em;">Due Date</p>
          <p style="color:#f8fafc; font-size:1.1rem; font-weight:600; margin:0.25rem 0 0;">${dueDay}th of this month</p>
        </div>
      </div>
    </div>

    <a href="${magicLink}" style="display:inline-block; padding:0.75rem 1.75rem; background-color:#1e6091; color:#fff; border-radius:8px; text-decoration:none; font-weight:600; font-size:0.9rem; margin-bottom:1.5rem;">
      View My Tenant Portal →
    </a>

    <div style="${footerStyle}">
      <p>© ${new Date().getFullYear()} PGmate (v4stay) · <a href="mailto:v4services.in@gmail.com" style="color:#00c49f; text-decoration:none;">v4services.in@gmail.com</a></p>
    </div>
  </div>
</body></html>`;
}

/** Sent to tenant after a payment is recorded by the PG owner */
export function paymentReceiptEmail({
  tenantName,
  pgName,
  amount,
  method,
  receiptId,
  paymentDate,
}: {
  tenantName: string;
  pgName: string;
  amount: number;
  method: string;
  receiptId: string;
  paymentDate: string;
}): string {
  return `<!DOCTYPE html><html><body style="${baseStyle}">
  <div style="${containerStyle}">
    <div style="${headerStyle}">
      <div style="${logoStyle}">PGmate</div>
      <p style="color:#94a3b8; margin-top:0.5rem; font-size:0.9rem;">by v4stay</p>
    </div>

    <h1 style="color:#f8fafc; font-size:1.5rem; margin-bottom:0.5rem;">Payment Received ✅</h1>
    <p style="color:#94a3b8; margin-bottom:1.5rem;">Hi ${tenantName}, your payment for <strong style="color:#f8fafc">${pgName}</strong> has been recorded. Here's your receipt for your records.</p>

    <div style="${cardStyle}">
      <table style="width:100%; border-collapse:collapse; font-size:0.9rem;">
        <tr>
          <td style="color:#94a3b8; padding:0.5rem 0;">Receipt No.</td>
          <td style="color:#f8fafc; font-weight:600; text-align:right; font-family:monospace;">${receiptId.slice(-8).toUpperCase()}</td>
        </tr>
        <tr><td colspan="2"><hr style="border:none; border-top:1px solid rgba(255,255,255,0.06); margin:0.5rem 0;" /></td></tr>
        <tr>
          <td style="color:#94a3b8; padding:0.5rem 0;">Date</td>
          <td style="color:#f8fafc; text-align:right;">${paymentDate}</td>
        </tr>
        <tr>
          <td style="color:#94a3b8; padding:0.5rem 0;">Property</td>
          <td style="color:#f8fafc; text-align:right;">${pgName}</td>
        </tr>
        <tr>
          <td style="color:#94a3b8; padding:0.5rem 0;">Payment Method</td>
          <td style="color:#f8fafc; text-align:right; text-transform:capitalize;">${method}</td>
        </tr>
        <tr><td colspan="2"><hr style="border:none; border-top:1px solid rgba(255,255,255,0.06); margin:0.5rem 0;" /></td></tr>
        <tr>
          <td style="color:#f8fafc; font-weight:700; font-size:1rem; padding:0.5rem 0;">Total Paid</td>
          <td style="color:#00c49f; font-weight:800; font-size:1.25rem; text-align:right;">₹${amount.toLocaleString("en-IN")}</td>
        </tr>
      </table>
    </div>

    <div style="${footerStyle}">
      <p>Keep this email as your payment proof.</p>
      <p>© ${new Date().getFullYear()} PGmate (v4stay) · <a href="mailto:v4services.in@gmail.com" style="color:#00c49f; text-decoration:none;">v4services.in@gmail.com</a></p>
    </div>
  </div>
</body></html>`;
}
