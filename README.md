<div align="center">

# 🏠 V4Stay — PG Management SaaS

**The complete management platform for Paying Guest (PG) accommodation owners in India.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![Firebase](https://img.shields.io/badge/Firebase-Admin-orange?logo=firebase)](https://firebase.google.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Deploy on Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)

[Live Demo](https://v4stay.com) · [Report Bug](https://github.com/virat709/pg-saas-for-v4stay/issues) · [Request Feature](https://github.com/virat709/pg-saas-for-v4stay/issues)

</div>

---

## ✨ Features

### 🏗️ Property & Room Management
- Manage multiple PG properties from one dashboard
- Room & bed assignment with availability tracking
- Tenant onboarding with room assignment

### 👥 Tenant Management
- Full tenant profiles with contact details
- Security deposit ledger (collected / returned / deductions)
- Bulk CSV import/export
- Magic-link tenant portal (`/t/[id]`) — no app needed

### 💰 Payments & Finance
- Record rent, deposits, and refunds
- Monthly analytics: collections, expenses, net profit, efficiency %
- Online payment via UPI deep-link (Google Pay / PhonePe)
- Payment receipt generation & print
- CSV export of payment history

### 📊 Expense Tracking
- Log property expenses by category (electricity, water, maintenance, salary…)
- Recurring expense support
- Bill photo upload
- Monthly profit/loss overview

### 📢 Updates (Complaints + Notice Board)
- Tenants submit complaints from their portal
- Admin resolves complaints with one click
- Post notices to all tenants instantly

### 👷 Staff / Caretaker Role
- Separate login for caretakers (Property ID + email + password)
- Restricted access — cannot delete tenants or change settings
- Can record payments and resolve complaints

### 📱 Tenant Portal
- Magic link access — no signup required
- View notices, submit complaints, pay rent online
- View payment history and receipts

### 🔔 Notifications & Reminders
- In-app notification bell for owners and tenants
- Automatic rent reminders (5 days before due date)
- Email + in-app notification on new complaint/payment

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Auth | NextAuth.js v4 (JWT + Firebase ID Token) |
| Database | Firebase Firestore (via Admin SDK) |
| Storage | Local `/public/uploads` (swap for Cloud Storage in prod) |
| Email | Nodemailer / SMTP |
| Animation | Framer Motion, GSAP |
| Deployment | Vercel |

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 20.19
- A Firebase project (Firestore enabled)
- A Google account for Firebase Auth

### 1. Clone & Install

```bash
git clone https://github.com/virat709/pg-saas-for-v4stay.git
cd pg-saas-for-v4stay
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local` — see [Environment Variables](#-environment-variables) below.

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🔑 Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```
# NextAuth
NEXTAUTH_SECRET=          # Strong random secret (openssl rand -base64 32)
NEXTAUTH_URL=             # http://localhost:3000 in dev, your domain in prod

# Firebase Client SDK (public — safe to expose)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin SDK (server-only — never expose)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=     # Paste the full private key (with \n escaped)

# Email (SMTP)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

# Cron secret (required in production)
CRON_SECRET=              # Matches the Authorization: Bearer <secret> header
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/                  # All REST API routes
│   │   ├── complaints/       # Complaint management
│   │   ├── expenses/         # Expense tracking
│   │   ├── notices/          # Notice board
│   │   ├── payments/         # Payments + status + receipt
│   │   ├── properties/       # Property CRUD
│   │   ├── rooms/            # Room & bed management
│   │   ├── staff/            # Caretaker accounts
│   │   ├── t/[id]/           # Tenant portal APIs (public)
│   │   └── tenants/          # Tenant management + deposit ledger
│   ├── dashboard/            # Owner dashboard pages
│   │   ├── complaints/       # Updates (complaints + notices) page
│   │   ├── expenses/         # Expense tracker page
│   │   ├── payments/         # Payments + analytics page
│   │   ├── rooms/            # Room management page
│   │   ├── settings/         # Settings + caretaker management
│   │   └── tenants/          # Tenant management page
│   ├── staff-login/          # Caretaker login page
│   └── t/[id]/               # Tenant magic-link portal
├── context/                  # React context (Property, Toast, Auth)
├── lib/                      # Server utilities (Firebase Admin, auth, email)
└── middleware.ts             # Route protection
```

---

## 🧪 Running Tests

```bash
npm test
```

Tests are in `tests/` using plain Node.js (no framework required).

---

## 🤝 Deployment

The project is optimised for **Vercel**:

1. Push to `main`
2. Import the repo in [Vercel](https://vercel.com/new)
3. Add all environment variables from `.env.example`
4. Set up a cron job to hit `/api/cron/reminders` daily with `Authorization: Bearer <CRON_SECRET>`

---

## 🔒 Security Notes

- All owner API routes verify `ownerId` against the session — no IDOR possible
- Staff routes are property-scoped — caretakers cannot access other properties
- Tenant portal does not expose other tenants' data
- File uploads: extension + MIME type double-validation, 5 MB limit
- Cron endpoint requires `CRON_SECRET` in production

---

## 📄 License

MIT © [V4Stay](https://v4stay.com)
