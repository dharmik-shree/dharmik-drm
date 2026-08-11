# 🧿 DharmikShree CRM & Lead Management System

Production-ready, full-stack CRM and Lead Management System for **Dharmikshree** (`dharmikshree.com`) — 13th-generation Vedic Astrologer, Vastu Consultant, and Spiritual Guide.

---

## 🏗️ Architecture & Deployment Overview

As requested, the CRM System is designed to be hosted on a separate secure URL (e.g. `admin-dharmikshree.vercel.com`), while the main website remains on `dharmikshree.com`.

- **CRM Domain (`admin-dharmikshree.vercel.com`)**: Hosts the Admin Panel, Reminders Engine, Financial Reports, Team Management, and Customer Client Portal (`/portal`).
- **Website Integration (`dharmikshree.com`)**: The Public Lead Capture Form can be embedded via iframe or submitted directly to `https://admin-dharmikshree.vercel.com/api/leads/public-enquiry`.

---

## 🚀 Quick Start Guide

### 1. Environment Setup
Clone the repository and copy the environment variables template:

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

*(Note: The system includes a full offline mock fallback mode for instant local testing without live Supabase credentials).*

### 2. Database Migrations & Seeding (Supabase)
Run local or cloud migrations and load seed data (8 core services & 14 stage checklists):

```bash
npx supabase db push
npx supabase db seed
```

Or apply the SQL scripts located in:
- `supabase/migrations/20260811000000_initial_schema.sql`
- `supabase/seed.sql`

### 3. Run Locally
Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 User Roles & Permissions Access

| Role | Access URL | Capabilities |
|---|---|---|
| **Super Admin (Owner — Dharmikshree)** | `/admin/dashboard` | Full control, financial reports, team management, templates, settings |
| **Admin (Senior Team — K)** | `/admin/dashboard` | Manage leads, payments, consultations, stage checklists |
| **Team Member (Staff — N, D)** | `/admin/dashboard` | RLS-filtered assigned leads, update stages, add notes/calls, mark reminders |
| **Customer (Client Portal)** | `/portal/dashboard` | View journey timeline, upcoming appointments, receipts, shared remedies |

*Demo Switcher*: On `/login` or using the top header dropdown in the Admin panel, you can switch roles instantly to test RBAC permissions.

---

## 📱 Embedding Enquiry Form on `dharmikshree.com`

To place the lead capture form on your main website `dharmikshree.com`:

### Option A: Embed via iFrame
Add this code on `dharmikshree.com`:

```html
<iframe 
  src="https://admin-dharmikshree.vercel.com/enquiry?embed=true" 
  width="100%" 
  height="750 shadow-none border-0"
  frameborder="0">
</iframe>
```

### Option B: Direct API Submission
Submit form data directly from any HTML/React form on `dharmikshree.com` to:

```javascript
fetch("https://admin-dharmikshree.vercel.com/api/leads/public-enquiry", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    full_name: "Client Name",
    phone: "+91 9876543210",
    city: "Mumbai",
    service_interest: "divine_consultation",
    consultation_mode: "online",
    lead_source: "website"
  })
});
```

---

## 💬 WhatsApp Integration & Reminders Setup

1. **Meta WhatsApp Cloud API**: Configure `WHATSAPP_API_TOKEN` and `WHATSAPP_PHONE_ID` in environment variables.
2. **`wa.me` Fallback**: If API keys are not provided, all WhatsApp action buttons generate pre-filled `wa.me` quick links that staff can click to send messages instantly.
3. **Daily Reminders Cron**: Deploy the Deno Edge function in `supabase/functions/send-reminders/index.ts` and set up `pg_cron` in Supabase to run daily at 9:00 AM IST:

```sql
SELECT cron.schedule(
  'daily-9am-reminders',
  '30 3 * * *', -- 9:00 AM IST (3:30 AM UTC)
  $$ SELECT net.http_post(
       url:='https://<project-ref>.supabase.co/functions/v1/send-reminders',
       headers:='{"Content-Type": "application/json", "Authorization": "Bearer <service-role-key>"}'::jsonb
     ) $$
);
```

---

## 📄 Financial PDF Receipts
Clicking **Download Official PDF Receipt** on any payment entry generates a branded A4 PDF with:
- Deep Navy (`#1A3C5E`) & Saffron Gold (`#C9933A`) header
- Unique receipt serial number (`DS-REC-XXXXXXXX`)
- Detailed service particulars & Dakshina breakdown
- Client balance dues status
- Sacred Vedic blessing footnote
