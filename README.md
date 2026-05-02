<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Prisma-7.7-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma 7.7" />
  <img src="https://img.shields.io/badge/PostgreSQL-Azure-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</p>

# 📅 ScheduleIt

> A centralized web platform that digitizes the booking of campus resources — labs, seminar halls, and classrooms — with real-time availability, online booking, role-based approvals, and automated timetable generation.

---

## ✨ Features

### 🗓️ Automated Timetable Generation
- Greedy scheduling algorithm that auto-generates conflict-free weekly timetables
- Supports theory lectures and 2-hour lab sessions with break-aware placement
- Publish/archive workflow with classroom assignment validation
- Extended hours slot (15:30–16:30) as automatic overflow fallback

### 🔬 Lab Allocation Management
- Full CRUD for lab slot assignments across FE / SE / TE / BE classes
- Unique constraint enforcement — no double-booking of labs or classes
- Day + time-range based scheduling

### 🏫 Classroom Access Workflow
A 5-stage approval pipeline for after-hours classroom booking:
```
REQUESTED → APPROVED → LOCK_PROOF_SUBMITTED → LOCK_CONFIRMED
                ↘ LOCK_REJECTED     ↗              ↘ LOCK_REJECTED
```
- Class Representatives (CRs) submit requests with date, time, purpose
- Class Teachers review, approve/reject, and confirm lock proof images
- Full audit trail with timestamps and teacher remarks

### 🔐 Role-Based Access Control (RBAC)
Six hierarchical roles with granular permissions:

| Role | Dashboard | Write Schedule | Manage Users | Review Requests | Request Access |
|------|:---------:|:--------------:|:------------:|:---------------:|:--------------:|
| **Super Admin** | Admin | ✅ | ✅ | — | — |
| **Admin** | Admin | ✅ | — | — | — |
| **Timetable Setter** | Admin | ✅ | — | — | — |
| **Class Teacher** | Admin | — | — | ✅ | — |
| **Normal Teacher** | Admin | — | — | — | — |
| **Student** | Student | — | — | — | ✅ *(CR only)* |

### 📧 Email Notifications
- Next-lecture notifications with smart schedule resolution
- Custom notification email support per student
- Gmail SMTP integration via Nodemailer

### 🎨 Modern UI/UX
- Light / Dark / System theme support
- GSAP + Framer Motion animations on the landing page
- Glassmorphism, grain textures, and 3D OGL effects
- oklch-based design tokens with warm orange-amber primary palette
- 20+ shadcn/ui + Radix UI primitives

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, React Server Components) |
| **Language** | JavaScript (JSX, ES2022+) |
| **UI** | React 19 · Tailwind CSS v4 · shadcn/ui (base-maia) |
| **Database** | PostgreSQL (Azure-hosted) |
| **ORM** | Prisma 7.7 + `@prisma/adapter-pg` |
| **Auth** | NextAuth.js v5 (beta.30) — Credentials, JWT sessions |
| **Validation** | Zod v4 |
| **State** | Zustand 5 |
| **Animations** | GSAP 3.14 · Framer Motion 12 · OGL |
| **Icons** | HugeIcons · Lucide React |
| **Email** | Nodemailer 7 (Gmail SMTP) |
| **Fonts** | Outfit (sans) · Merriweather (serif) · Fira Code (mono) |

---

## 📁 Project Structure

```
ScheduleIt/
└── frontend/                           ← Entire application
    ├── prisma/
    │   ├── schema.prisma               ← Database schema (6 models, 5 enums)
    │   ├── seed.js                     ← Development seed data
    │   └── migrations/                 ← 9 migration files
    ├── prisma.config.ts                ← Prisma CLI configuration
    ├── src/
    │   ├── auth.js                     ← NextAuth configuration
    │   ├── actions/                    ← Server Actions (business logic)
    │   │   ├── auth/                   ← Login, Signup, Logout
    │   │   ├── admin/                  ← User management (SUPER_ADMIN)
    │   │   ├── notifications/          ← Student email notifications
    │   │   └── schedule/               ← Labs, Timetable, Classroom access
    │   ├── app/                        ← Routes & layouts
    │   │   ├── (auth)/                 ← Sign-in / Sign-up pages
    │   │   ├── api/                    ← NextAuth handler, file uploads
    │   │   └── dashboard/
    │   │       ├── admin/              ← Staff dashboard (4 pages)
    │   │       └── student/            ← Student dashboard (3 pages)
    │   ├── components/                 ← UI components
    │   │   ├── admin/                  ← Admin-specific components
    │   │   ├── student/                ← Student-specific components
    │   │   ├── auth/                   ← Auth form components
    │   │   ├── shared/                 ← Breadcrumbs, providers
    │   │   └── ui/                     ← 20 shadcn/Radix primitives
    │   └── lib/                        ← Utilities
    │       ├── prisma.js               ← Prisma client singleton (pg pool)
    │       ├── permissions.js          ← Centralized RBAC functions
    │       ├── mailer.js               ← Nodemailer SMTP transport
    │       ├── password.js             ← bcrypt hash/verify
    │       └── validations/            ← Zod schemas
    └── public/
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **PostgreSQL** database (local or cloud-hosted)
- **Gmail App Password** for email notifications *(optional)*

### 1. Clone & Install

```bash
git clone https://github.com/your-username/ScheduleIt.git
cd ScheduleIt/frontend
npm install
```

### 2. Configure Environment

Create a `.env` file in the `frontend/` directory:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/scheduleit?sslmode=require&uselibpqcompat=true&schema=public"

# For Prisma Studio (without uselibpqcompat, which breaks Studio in Prisma 7.5+)
STUDIO_DATABASE_URL="postgresql://user:password@host:5432/scheduleit?sslmode=require&schema=public"

# Auth
AUTH_URL="http://localhost:3000"
AUTH_SECRET="your-base64-secret-here"    # Generate with: openssl rand -base64 32

# Email Notifications (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com
```

### 3. Set Up Database

```bash
# Push schema to your database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Seed with test data
npm run seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Dev** | `npm run dev` | Start Next.js development server |
| **Build** | `npm run build` | Create production build |
| **Start** | `npm run start` | Run production server |
| **Lint** | `npm run lint` | Run ESLint |
| **Seed** | `npm run seed` | Seed database with test data |
| **Studio** | `npm run db:studio` | Open Prisma Studio GUI |

---

## 🗃️ Database Schema

Built with **Prisma ORM** — 6 models and 5 enums:

```
User ──────────────┐
                    │
LabAllocation       │ 1:N
                    ├──── ClassroomAccessRequest
TimetablePlan ──────┤
   │                │
   ├── TimetableRequirement
   └── TimetableEntry
```

| Model | Purpose |
|-------|---------|
| `User` | All platform users with role, class assignment, CR flag |
| `LabAllocation` | Lab time-slot bookings with conflict prevention |
| `ClassroomAccessRequest` | After-hours classroom booking workflow |
| `TimetablePlan` | Generated timetable plans (Draft → Published → Archived) |
| `TimetableRequirement` | Subject hour requirements per plan |
| `TimetableEntry` | Individual time-slot entries in a timetable |

---

## 👤 Test Accounts

After running `npm run seed`, the following accounts are available.  
**Default password for all accounts:** `password123`

| Username | Role | Class | Notes |
|----------|------|:-----:|-------|
| `super_admin` | Super Admin | — | Full system access |
| `admin_user` | Admin | — | Schedule write access |
| `tt_setter` | Timetable Setter | — | Timetable generation |
| `ct_fe` | Class Teacher | FE | Reviews FE classroom requests |
| `ct_te` | Class Teacher | TE | Reviews TE classroom requests |
| `mr_sharma` | Normal Teacher | — | View-only admin dashboard |
| `fe_student` | Student | FE | **Class Representative** ✅ |
| `fe_student2` | Student | FE | Regular student |
| `se_student` | Student | SE | Regular student |
| `te_student` | Student | TE | **Class Representative** ✅ |
| `be_student` | Student | BE | Regular student |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                    Client                        │
│  React 19 · Tailwind v4 · shadcn/ui · Zustand   │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│              Next.js App Router                  │
│  Server Components · Server Actions · API Routes │
│  NextAuth v5 (JWT) · Zod Validation              │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│             Prisma ORM + pg Adapter              │
│          Connection pooling via pg.Pool           │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│           Azure PostgreSQL Database              │
└─────────────────────────────────────────────────┘
```

### Key Patterns

- **Full-stack monolith** — No separate backend; Next.js server actions handle all business logic
- **Server Components by default** — Client components explicitly marked with `"use client"`
- **Guard pattern** — Every server action checks auth + role before proceeding
- **Error-as-value** — Actions return `{ error }` or `{ success, ...data }` instead of throwing
- **Transaction safety** — Multi-step DB operations wrapped in `prisma.$transaction()`
- **Path revalidation** — `revalidatePath()` called after mutations to refresh cached pages

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is developed as a **Mini Project** for the Third Year (TE) Computer Engineering curriculum.

---

<p align="center">
  Built with ❤️ using Next.js, Prisma, and PostgreSQL
</p>
