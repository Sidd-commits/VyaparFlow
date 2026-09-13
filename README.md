# VyaparFlow — Export Logistics Readiness Platform

> **Deterministic Export Compliance, Readiness Scoring & Multi-Carrier Logistics SaaS for Indian MSMEs**  
> *Pan-India Operating System for Global Trade Corridors (USA, EU, UAE, UK, Japan, Australia)*

---

## 🌟 Overview

**VyaparFlow** transforms complex, multi-agency cross-border export workflows into a deterministic, step-by-step digital operating system. Designed specifically for Indian Micro, Small, and Medium Enterprises (MSMEs), VyaparFlow eliminates costly customs rejections, documentation errors, and shipment delays by evaluating end-to-end export readiness before cargo leaves the factory gate.

---

## 🏗️ System Architecture

```mermaid
graph TD
    A[MSME Exporter] -->|Input Business & Shipment Data| B(VyaparFlow Platform)
    B --> C[Deterministic Rules Engine]
    C -->|Evaluates Compliance| D{Readiness Scoring Engine 0-100}
    D -->|Score < 100 or Critical Blocker| E[Actionable Remediation Tasks]
    D -->|Score 100 & Blocker-Free| F[Export Clearance Approved]
    F --> G[Automated Document Generator]
    G -->|Commercial Invoice & Packing List| H[Customs Ready PDFs]
    F --> I[Multi-Carrier Rate & Quote Engine]
    I --> J[Live Milestone Tracking]
    
    K[Service Providers / CHAs] -->|Fulfill Quotes & Certifications| B
    L[Platform Admins] -->|Configure Compliance Rules| C
```

---

## 🎯 Key Features & Modules

### 1. 📊 Deterministic Readiness Scoring Engine (0–100)
- **Mathematical Transparency**: Avoids non-deterministic AI hallucination in regulatory compliance.
- **5-Pillar Weighted Evaluation**:
  - **Business Entity Readiness (20%)**: GST, IEC, Business registration validity.
  - **Trade Documentation (25%)**: Commercial invoices, packing lists, shipping bills, certificates of origin.
  - **Mandatory Certifications (20%)**: Product-country specific certifications (e.g., APEDA, FSSAI, Phytosanitary).
  - **Packaging & Labelling (15%)**: Destination-specific packaging, palletization, and language regulations.
  - **Logistics & Carrier Readiness (20%)**: Final booking confirmation, container allocation, dispatch readiness.
- **Critical Dispatch Blockers**: Mandatory missing prerequisites instantly throttle the dispatch status regardless of raw aggregate score.

### 2. 🔒 Enterprise Security & Session Hardening
- **HMAC-SHA256 Cryptographic Sessions**: Tamper-proof, signed JWT session tokens stored in secure `httpOnly` cookies.
- **Sliding-Window API Rate Limiting**: Built-in in-memory rate limiting on authentication and sensitive verification endpoints (`/api/gst/verify`).
- **Production HTTP Security Headers**: Configured HSTS, CSP, Anti-Clickjacking (`X-Frame-Options: DENY`), and MIME sniffing protection (`X-Content-Type-Options: nosniff`).

### 3. 🚢 Multi-Carrier Freight & Real-Time Tracking
- Multi-carrier rate quotes comparison across Sea, Air, and Express Courier modes.
- Real-time GPS and port milestone tracking (`Order Confirmed` → `Preparation` → `Pickup Scheduled` → `Picked Up` → `Export Customs` → `Dispatched` → `In Transit` → `Destination Customs` → `Delivered`).
- Automated notification dispatch and audit logging for all shipment events.

### 4. 📑 Automated Export Document Engine
- Server-side PDF generation for **Commercial Invoices** and **Packing Lists** with automated HS code lookup, INR/USD/EUR currency handling, and standard invoice nomenclature.

### 5. 👥 Multi-Stakeholder Role Architecture
- **MSME Exporters**: End-to-end dashboard, product catalog, compliance checklists, document generation, and quote acceptance.
- **Service Providers (CHA / Freight Forwarders / Labs)**: Submit bids, review documents, verify certifications, and log milestones.
- **Platform Admins**: Live compliance rules configurator, country-product requirement mapping, user management, and audit trail.

---

## 📂 Project Directory Structure

```text
VyaparFlow/
├── app/                        # Next.js 16 App Router (Routes & Server Actions)
│   ├── actions.ts              # Type-safe Server Actions for mutations
│   ├── layout.tsx              # Root HTML Layout, Fonts & Metadata
│   ├── globals.css             # Tailwind CSS tokens and themes
│   ├── page.tsx                # Landing Page & Solution Overview
│   ├── login/                  # Multi-persona Authentication & Account Switcher
│   ├── dashboard/              # MSME Operational Command Center
│   ├── business/               # Business Profile, GST/IEC Verification
│   ├── products/               # Product Catalog & HS Code Mapping
│   ├── readiness/              # 5-Pillar Export Readiness Audit & Scorers
│   ├── documents/              # Export Documentation Vault & PDF Viewer
│   ├── certifications/         # Mandatory Trade Certificates Manager
│   ├── packaging/              # Packaging & Labelling Compliance Checklists
│   ├── shipments/              # Shipment Booking, Quotes & Milestone Tracking
│   ├── provider/               # Freight Forwarder & CHA Bid Portal
│   ├── admin/                  # Compliance Rules Configurator & Audit Logs
│   └── api/                    # REST Endpoints (Health, PDF Stream, GST Sandbox proxy)
├── components/                 # Reusable UI & Client Components
│   └── AppShell.tsx            # Global Navigation with Active Persona Switcher
├── lib/                        # Core Domain Logic & Utilities
│   ├── prisma.ts               # Prisma Client Singleton with Connection Pooling
│   ├── session.ts              # HMAC-SHA256 Cryptographic Session Tokens
│   ├── rateLimit.ts            # Sliding-Window In-Memory Rate Limiter
│   ├── authCookies.ts          # Secure Cookie Configuration
│   ├── authGuards.ts           # Server-side Authorization Guards
│   ├── crypto.ts               # PBKDF2 Password Hashing
│   └── services/
│       ├── readiness.ts        # Deterministic Scoring & Blocker Calculations
│       ├── documentGenerator.ts# jsPDF-based Trade Document Generator
│       └── sandboxGst.ts       # Sandbox.co.in GST API client with offline fallback
├── prisma/                     # Database Layer
│   ├── schema.prisma           # Prisma Data Model (PostgreSQL / Supabase)
│   └── seed.ts                 # Golden Demo Seed Data (Agro & Industrial Exports)
├── tests/                      # Automated Test Suites
│   ├── security/               # Session & Admin Authorization Security Tests
│   ├── integration/            # Phase 3 Shipment Workflow & Route Protection Tests
│   ├── e2e/                    # Comprehensive Diagnostics (26 Live Endpoints)
│   └── run_all_tests.ts        # Automated Master Test Runner
├── Dockerfile                  # Multi-stage production container build
├── docker-compose.yml          # Container orchestration template
├── .env.example                # Environment variables template
├── jest.config.js              # Jest configuration for TypeScript
├── package.json                # Project dependencies & scripts
└── tsconfig.json               # TypeScript compiler options
```

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **ORM & Database**: [Prisma ORM 5](https://www.prisma.io/) + [Supabase PostgreSQL](https://supabase.com/)
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable)
- **Charts & Visualizations**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Testing**: [Jest](https://jestjs.io/) + [ts-jest](https://kulshekhar.github.io/ts-jest/) + [tsx](https://github.com/privatenumber/tsx)
- **Containerization**: [Docker](https://www.docker.com/) (Multi-stage Node 20 Alpine)

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher
- **PostgreSQL Database** (e.g. Supabase)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Sidd-commits/VyaparFlow.git
cd VyaparFlow
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to create your local `.env`:
```bash
cp .env.example .env
```
Fill in your `DATABASE_URL`, `DIRECT_URL`, and `SESSION_SECRET`.

### 3. Synchronize Database & Seed
```bash
# Push schema to live PostgreSQL
npx prisma db push

# Populate with golden dataset
npx prisma db seed
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker Deployment

To build and run the production container locally or in staging:
```bash
# Build & Start Container
docker compose up --build -d

# Check Container Health Status
curl http://localhost:3000/api/health
```

---

## 🧪 Running Automated Tests

```bash
# 1. Run Jest Unit Tests
npm test

# 2. Run Automated Master Test Suite (Security, Auth, Workflow & E2E)
npx tsx tests/run_all_tests.ts

# 3. Run Live Comprehensive 26-Point Endpoint Diagnostics
npx tsx tests/e2e/comprehensive_diagnostics.ts
```

---

## 🔑 Demo Personas & Credentials

| Persona | Email | Password | Primary Role & Workflow |
| :--- | :--- | :--- | :--- |
| **MSME Exporter** | `msme@apex-exports.com` | `password123` | Exporter Dashboard, Readiness Scoring, Shipments, Packaging |
| **Logistics / CHA Provider** | `provider@freight.com` | `password123` | Service Provider Queue, Document Verification, Bids |
| **Platform Administrator** | `admin@vyaparflow.com` | `admin123` | Platform Admin Console, Compliance Rules, Audit Trail |

---

## 🔒 Security & Contribution Guidelines

- **Never commit `.env` or secrets**: Use [.env.example](.env.example) as reference.
- **Strict type checking**: Always ensure `npx tsc --noEmit` returns 0 errors.
- **Clean builds**: Ensure `npm test` and `npx next build` pass before submitting pull requests.
