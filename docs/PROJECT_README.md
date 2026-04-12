# StudioDesk 📸

India's most powerful platform for event photography & videography studios.

## 🚀 Overview
StudioDesk is a specialized SaaS designed to help Indian photography studios manage their entire business lifecycle. From first inquiry to AI-powered face-recognition photo delivery, all with GST-compliant invoicing and integrated UPI payments.

## 🛠 Tech Stack
- **Frontend**: Next.js 14 (App Router), Tailwind CSS, shadcn/ui
- **Backend/DB**: Supabase (Postgres + Auth + Storage)
- **AI Engine**: Immich (Self-hosted)
- **Payments**: Razorpay (UPI, Cards, Netbanking)
- **Communications**: WhatsApp Business API + Resend (Email)

## 📦 Features
- **CRM**: Lead Kanban, Client management, Booking pipeline.
- **Contracting**: Branded proposals & E-signature compliance.
- **Financials**: India-standard GST invoicing (CGST/SGST/IGST), automated Razorpay payment links.
- **Gallery**: AI Face Recognition for guest photo lookup.
- **Automations**: WhatsApp/Email reminders for payments and shoots.
- **PWA**: Installable on iOS/Android for a native mobile experience.

## 👨‍💻 Getting Started

### 1. Requirements
- Node.js 18+
- Supabase Project
- Razorpay Account (Test mode available)

### 2. Installation
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local` and fill in:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

### 4. Running Locally
```bash
npm run dev
```

## 🏗 Launch Preparation
See [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md) for production deployment steps.
