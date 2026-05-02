# ScheduleIt — Comprehensive Project Context

> **Last Updated:** 2026-05-01  
> A centralized web platform that digitizes the booking of campus resources like labs, seminar halls, and equipment with real-time availability, online booking, and admin approvals.

---

## 1. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| Language | JavaScript (JSX) | ES2022+ |
| React | React + React DOM | 19.2.3 |
| Styling | Tailwind CSS v4 + shadcn/ui (base-maia style) | v4 |
| Database | PostgreSQL (Azure-hosted) | — |
| ORM | Prisma Client + `@prisma/adapter-pg` | 7.7.0 |
| Auth | NextAuth.js v5 (beta.30) — Credentials provider, JWT sessions | 5.0.0-beta.30 |
| Validation | Zod v4 | 4.3.6 |
| State Mgmt | Zustand | 5.0.11 |
| Animations | GSAP + Motion (Framer Motion) + OGL | gsap 3.14, motion 12.36 |
| Icons | HugeIcons (`@hugeicons/react`) + Lucide React | — |
| Email | Nodemailer (Gmail SMTP) | 7.0.7 |
| Fonts | Outfit (sans), Merriweather (serif), Fira Code (mono) — Google Fonts | — |
| Theming | next-themes (light/dark/system) | 0.4.6 |
| Toasts | Sonner | 2.0.7 |
| Date Utils | date-fns | 4.1.0 |
| Password | bcryptjs (12 salt rounds) | 3.0.3 |
| Component Lib | shadcn CLI v4 + Radix UI primitives | shadcn 4.0.6 |

---

## 2. Project Structure

```
ScheduleIt/
├── .git/
├── .gitignore
├── .vscode/
├── skills-lock.json
└── frontend/                         ← Entire app lives here
    ├── .env                          ← Environment variables
    ├── components.json               ← shadcn config
    ├── next.config.mjs               ← Next.js config (Unsplash images)
    ├── package.json
    ├── postcss.config.mjs
    ├── prisma/
    │   ├── schema.prisma             ← Database schema
    │   ├── seed.js                   ← Seed script
    │   └── migrations/               ← 9 migrations
    ├── prisma.config.ts
    ├── public/
    └── src/
        ├── auth.js                   ← NextAuth configuration
        ├── actions/                  ← Server Actions (business logic)
        │   ├── auth/
        │   │   ├── login-action.js
        │   │   ├── signup-action.js
        │   │   └── logout-action.js
        │   ├── admin/
        │   │   └── user-action.js
        │   ├── notifications/
        │   │   └── student-notification-action.js
        │   └── schedule/
        │       ├── classroom-access-action.js
        │       ├── lab-action.js
        │       └── timetable-action.js
        ├── app/
        │   ├── globals.css           ← Design tokens (oklch), light/dark themes
        │   ├── layout.js             ← Root layout (fonts, ThemeProvider, Toaster)
        │   ├── page.js               ← Landing page
        │   ├── (auth)/
        │   │   ├── signin/           ← Sign-in page
        │   │   └── signup/           ← Sign-up page
        │   ├── api/
        │   │   ├── auth/[...nextauth]/  ← NextAuth route handler
        │   │   └── uploads/lock-proof/  ← Lock proof image upload API
        │   └── dashboard/
        │       ├── layout.js         ← Dashboard shell (header, theme, logout)
        │       ├── page.js           ← Role-based redirect hub
        │       ├── admin/
        │       │   ├── layout.js     ← Admin sidebar layout
        │       │   ├── page.js       ← Admin dashboard (lab allocations)
        │       │   ├── AdminDashboardClient.jsx
        │       │   ├── classroom-requests/page.js
        │       │   ├── timetable/page.js
        │       │   └── users/
        │       │       ├── page.js
        │       │       └── UserManagementClient.jsx
        │       └── student/
        │           ├── layout.js     ← Student sidebar layout
        │           ├── page.js       ← Student schedule view
        │           ├── classroom-access/page.js
        │           └── notifications/page.js
        ├── components/
        │   ├── providers.jsx         ← SessionProvider + ThemeProvider wrapper
        │   ├── Navbar.jsx            ← Landing page navbar
        │   ├── HeroSection.jsx       ← Landing hero
        │   ├── ContentSection.jsx
        │   ├── FeaturesSection.jsx
        │   ├── TeamSection.jsx
        │   ├── CallToAction.jsx
        │   ├── MinimalFooter.jsx
        │   ├── LandingBackground.jsx
        │   ├── Calendar.jsx
        │   ├── AnimatedNotificationList.jsx
        │   ├── BentoGridShowcase.jsx
        │   ├── Folder.jsx
        │   ├── GlassSurface.jsx
        │   ├── Grainient.jsx
        │   ├── admin/
        │   │   ├── AdminSidebar.jsx
        │   │   ├── ClassroomRequestsReviewClient.jsx
        │   │   └── TimetableGeneratorClient.jsx
        │   ├── auth/
        │   │   ├── AuthLayout.jsx
        │   │   ├── SigninForm.jsx
        │   │   └── SignupForm.jsx
        │   ├── shared/
        │   │   └── DashboardBreadcrumb.jsx
        │   ├── student/
        │   │   ├── ClassroomAccessClient.jsx
        │   │   ├── NotificationSettingsClient.jsx
        │   │   ├── StudentScheduleCalendar.jsx
        │   │   └── StudentSidebar.jsx
        │   └── ui/                   ← 20 shadcn/radix primitives
        │       ├── alert-dialog.jsx, breadcrumb.jsx, button.jsx
        │       ├── card.jsx, collapsible.jsx, command.jsx
        │       ├── dialog.jsx, input-group.jsx, input.jsx
        │       ├── label.jsx, popover.jsx, select.jsx
        │       ├── separator.jsx, sheet.jsx, sidebar.jsx
        │       ├── skeleton.jsx, sonner.jsx, table.jsx
        │       ├── textarea.jsx, tooltip.jsx
        ├── hooks/
        │   └── use-mobile.js         ← useIsMobile() — 768px breakpoint
        └── lib/
            ├── mailer.js             ← Nodemailer SMTP transport
            ├── password.js           ← bcrypt hash/verify
            ├── permissions.js        ← Centralized RBAC
            ├── prisma.js             ← Prisma client singleton (pg pool)
            ├── student-notifications.js ← Next-lecture email builder
            ├── utils.js              ← cn() — clsx + tailwind-merge
            └── validations/
                └── auth.js           ← Zod login/signup schemas
```

---

## 3. Database Schema (Prisma)

### 3.1 Enums

| Enum | Values |
|------|--------|
| `Role` | `SUPER_ADMIN`, `ADMIN`, `TIMETABLE_SETTER`, `CLASS_TEACHER`, `NORMAL_TEACHER`, `STUDENT` |
| `StudentClass` | `FE`, `SE`, `TE`, `BE` |
| `ClassroomAccessStatus` | `REQUESTED`, `APPROVED`, `LOCK_PROOF_SUBMITTED`, `LOCK_CONFIRMED`, `LOCK_REJECTED` |
| `TimetablePlanStatus` | `DRAFT`, `PUBLISHED`, `ARCHIVED` |
| `TimetableEntryType` | `THEORY`, `LAB` |

### 3.2 Models

#### `User`
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| username | String | Unique |
| email | String | Unique |
| notificationEmail | String? | Custom email for notifications |
| notificationEnabled | Boolean | Default: true |
| mobNumber | String | Unique |
| passwordHash | String | bcrypt |
| role | Role | Default: STUDENT |
| studentClass | StudentClass? | Which class student belongs to |
| isCR | Boolean | Class Representative flag (default: false) |
| assignedClass | StudentClass? | For CLASS_TEACHER only |
| createdAt / updatedAt | DateTime | Auto-managed |

**Relations:** `classroomRequests`, `reviewedClassroomRequests`, `createdTimetablePlans`

#### `LabAllocation`
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| targetClass | StudentClass | |
| subject | String | |
| labName | String | |
| day | String | e.g. "Monday" |
| timeRange | String | e.g. "08:45 AM - 10:45 AM" |

**Unique constraints:** `[labName, day, timeRange]`, `[targetClass, day, timeRange]` — prevents double-booking.

#### `ClassroomAccessRequest`
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| requestedById | String | FK → User (student/CR) |
| classTeacherId | String | FK → User (class teacher) |
| studentClass | StudentClass | |
| classroomName | String | |
| requestedDate | DateTime | |
| requestedStartTime | String | Default: "15:30" |
| requestedEndTime | String | Default: "18:30" |
| purpose | String | |
| status | ClassroomAccessStatus | Default: REQUESTED |
| lockProofImageUrl | String? | Uploaded image proof |
| lockProofSubmittedAt | DateTime? | |
| teacherRemarks | String? | |
| teacherConfirmedAt | DateTime? | |

**Indexes:** `[requestedById, status]`, `[classTeacherId, status]`

#### `TimetablePlan`
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| title | String | |
| targetClass | StudentClass | |
| status | TimetablePlanStatus | Default: DRAFT |
| effectiveFrom | DateTime? | |
| usedExtendedHours | Boolean | |
| createdById | String | FK → User |

**Relations:** `requirements[]`, `entries[]`

#### `TimetableRequirement`
| Field | Type |
|-------|------|
| id | String (cuid) |
| planId | String (FK → TimetablePlan) |
| subjectName | String |
| theoryHours | Int |
| labHours | Int |

#### `TimetableEntry`
| Field | Type |
|-------|------|
| id | String (cuid) |
| planId | String (FK → TimetablePlan) |
| day | String |
| startTime / endTime | String (24h format) |
| slotIndex | Int |
| subjectName | String |
| entryType | TimetableEntryType |
| classroom | String? |

### 3.3 Migration History (9 migrations)
1. `first` — Initial schema
2. `init_roles_and_labs` — Roles and lab allocations
3. `add_rbac_roles_and_cr_flag` — Extended role system + isCR
4. `sync_laballocation_unique_indexes` — Unique constraint fixes
5. `add_classroom_access_requests` — Classroom access workflow
6. `fix_lab_index_names` — Index naming fixes
7. `add_approved_status_for_classroom_access` — APPROVED status
8. `add_timetable_generator_models` — Timetable plan/entry/requirement
9. `add_student_notification_settings` — notificationEmail + notificationEnabled

---

## 4. Authentication System

- **Provider:** NextAuth.js v5 (beta.30) with **Credentials** provider
- **Strategy:** JWT sessions (no database sessions)
- **Login:** Username OR email + password
- **Password:** bcryptjs with 12 salt rounds
- **Validation:** Zod schemas (`loginSchema`, `signupSchema`)
- **Custom sign-in page:** `/signin`
- **Post-login redirect:** `/dashboard` (then role-based redirect)

### JWT Token Contents
`id`, `username`, `mobNumber`, `role`, `studentClass`, `isCR`, `assignedClass`

### Session Object
All JWT fields are forwarded to `session.user`.

### Auth Flow
1. User submits credentials via `SigninForm` → `loginAction` server action
2. Server action calls `signIn("credentials", ...)` from NextAuth
3. `authorize()` callback looks up user by email or username
4. Password verified via bcrypt
5. JWT populated with user fields via `jwt` callback
6. Session enriched via `session` callback
7. Redirect to `/dashboard`

### Signup Flow
1. `SignupForm` → `signupAction` server action
2. Validates via Zod, checks uniqueness (username, email, mobNumber)
3. Creates user with `role: STUDENT` (default)
4. Auto-signs in after creation → redirect to `/dashboard`

---

## 5. Role-Based Access Control (RBAC)

### Role Hierarchy & Permissions

| Role | Dashboard | Write Schedule | Manage Users | Review Classroom Requests | Request Classroom Access |
|------|-----------|---------------|-------------|--------------------------|------------------------|
| SUPER_ADMIN | Admin | ✅ | ✅ | ❌ | ❌ |
| ADMIN | Admin | ✅ | ❌ | ❌ | ❌ |
| TIMETABLE_SETTER | Admin | ✅ | ❌ | ❌ | ❌ |
| CLASS_TEACHER | Admin | ❌ | ❌ | ✅ | ❌ |
| NORMAL_TEACHER | Admin | ❌ | ❌ | ❌ | ❌ |
| STUDENT | Student | ❌ | ❌ | ❌ | ✅ (if CR) |

### Permission Functions (in `lib/permissions.js`)
- `isStaff(role)` — All non-student roles
- `canWriteSchedule(role)` — SUPER_ADMIN, ADMIN, TIMETABLE_SETTER
- `canManageUsers(role)` — SUPER_ADMIN only
- `getRoleLabel(role)` — Human-readable label

### Route Protection
- `/dashboard` — Redirects staff → `/dashboard/admin`, students → `/dashboard/student`
- `/dashboard/admin/*` — Server-side `isStaff()` check in layout; non-staff → redirect
- `/dashboard/student/*` — Server-side check; staff → redirect to admin
- Server actions have their own `requireXxx()` guard functions

---

## 6. Server Actions (Business Logic)

### 6.1 Auth Actions (`actions/auth/`)

| Action | File | Description |
|--------|------|-------------|
| `loginAction` | `login-action.js` | Validates credentials, calls `signIn()`, redirects to `/dashboard` |
| `signupAction` | `signup-action.js` | Creates user (default STUDENT), checks uniqueness, auto-login |
| `logoutAction` | `logout-action.js` | Calls `signOut()`, redirects to `/` |

### 6.2 Admin Actions (`actions/admin/`)

| Action | File | Guard | Description |
|--------|------|-------|-------------|
| `assignUserRole` | `user-action.js` | SUPER_ADMIN | Change user role + assignedClass |
| `setStudentCR` | `user-action.js` | SUPER_ADMIN | Toggle Class Representative flag |
| `getAllUsers` | `user-action.js` | SUPER_ADMIN | Fetch all users for management UI |

### 6.3 Schedule Actions (`actions/schedule/`)

| Action | File | Guard | Description |
|--------|------|-------|-------------|
| `createLabAllocation` | `lab-action.js` | Schedule-write roles | Create lab slot (conflict detection via unique constraints) |
| `updateLabAllocation` | `lab-action.js` | Schedule-write roles | Update existing allocation |
| `deleteLabAllocation` | `lab-action.js` | Schedule-write roles | Delete allocation |
| `generateTimetableDraft` | `timetable-action.js` | Timetable-setter roles | Auto-generate timetable from subject requirements |
| `publishTimetablePlan` | `timetable-action.js` | Timetable-setter roles | Publish draft (archives previous, assigns classrooms) |

### 6.4 Classroom Access Actions (`actions/schedule/classroom-access-action.js`)

| Action | Guard | Description |
|--------|-------|-------------|
| `createClassroomAccessRequest` | CR only | Request after-hours classroom access |
| `getClassroomAccessRequestsForCR` | CR only | List own requests |
| `submitLockProof` | CR only | Upload lock proof image after approval |
| `approveClassroomAccessRequest` | CLASS_TEACHER | Approve pending request |
| `rejectClassroomAccessRequest` | CLASS_TEACHER | Reject request |
| `getClassroomRequestsForTeacher` | CLASS_TEACHER | List assigned class requests |
| `confirmClassroomLock` | CLASS_TEACHER | Confirm/reject lock proof |

### 6.5 Notification Actions (`actions/notifications/`)

| Action | Guard | Description |
|--------|-------|-------------|
| `getStudentNotificationSettings` | STUDENT | Get notification prefs + next lecture |
| `updateStudentNotificationSettings` | STUDENT | Update notification email + toggle |
| `sendMyNextLectureNotification` | STUDENT | Send email about next upcoming lecture |

---

## 7. Timetable Generation Algorithm

The system auto-generates weekly timetables with a greedy scheduling algorithm:

### Time Slots
- **Base slots (6):** 08:45–09:45, 09:45–10:45, 11:00–12:00, 12:00–13:00, 13:30–14:30, 14:30–15:30
- **Extended slot (optional):** 15:30–16:30
- **Break windows:** 10:45–11:00 (Short), 13:00–13:30 (Long)
- **Days:** Monday through Friday

### Algorithm Steps
1. Normalize subject requirements (theory hours + lab sessions as 2-hour blocks)
2. Validate slots don't overlap break windows
3. **Phase 1 — Lab placement:** Place lab sessions first (need 2 consecutive slots). Pick day with lowest load. Supports cross-break consecutive pairing.
4. **Phase 2 — Theory placement:** Fill remaining slots. Max 2 same-subject sessions per day. Scoring: `dailyLoad * 10 + sameDaySameSubject * 2 + slotIndex`
5. **Fallback:** If base slots overflow, auto-tries with extended slot
6. Saves as DRAFT with a Prisma `$transaction` (plan + requirements + entries)

### Publishing
- Archives any existing PUBLISHED plan for the same class
- Requires classroom assignment for every entry
- Sets `effectiveFrom` date

---

## 8. Classroom Access Workflow

A 5-stage workflow for after-hours classroom booking:

```
REQUESTED → APPROVED → LOCK_PROOF_SUBMITTED → LOCK_CONFIRMED
                ↘ LOCK_REJECTED     ↗              ↘ LOCK_REJECTED
```

1. **CR creates request** — Classroom name, date, time (must be after 15:30), purpose
2. **System auto-finds class teacher** — Matches CR's `studentClass` to teacher's `assignedClass`
3. **Class Teacher approves/rejects** — Can add remarks
4. **CR submits lock proof** — Uploads image (via `/api/uploads/lock-proof/`)
5. **Class Teacher confirms lock** — Final approval or rejection

---

## 9. Notification System

### Email Notifications
- **Transport:** Nodemailer with Gmail SMTP
- **Sender:** Configured via `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL` env vars
- **Content:** HTML + plain text email with next lecture details

### Next Lecture Resolution
1. Looks for PUBLISHED timetable plan for student's class (effective ≤ now)
2. Falls back to `LabAllocation` records if no published plan
3. Calculates next occurrence based on day-of-week + time
4. Supports both 24h (timetable entries) and 12h (lab allocations) time formats

### Student Settings
- Custom notification email (optional, falls back to account email)
- Enable/disable toggle
- Manual "Send Now" trigger

---

## 10. Frontend Pages & Routes

### Public Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `page.js` | Landing page with Hero, Content, Features, Team, CTA, Footer |
| `/signin` | `(auth)/signin/` | Sign-in form |
| `/signup` | `(auth)/signup/` | Sign-up form |

### Dashboard Routes

| Route | Role Access | Description |
|-------|------------|-------------|
| `/dashboard` | All authenticated | Role-based redirect (staff → admin, student → student) |
| `/dashboard/admin` | Staff only | Lab allocations management (CRUD) |
| `/dashboard/admin/timetable` | Staff (write: setter roles) | Timetable generator + publish |
| `/dashboard/admin/classroom-requests` | Staff (actions: CLASS_TEACHER) | Review classroom access requests |
| `/dashboard/admin/users` | Staff (actions: SUPER_ADMIN) | User management — role assignment, CR toggle |
| `/dashboard/student` | Students only | Weekly schedule calendar view |
| `/dashboard/student/classroom-access` | Students (actions: CR only) | Request & track classroom access |
| `/dashboard/student/notifications` | Students only | Notification settings + send test |

### API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handler |
| `/api/uploads/lock-proof/` | POST | Lock proof image upload |

---

## 11. Key UI Components

### Landing Page
- `Navbar.jsx` — Sticky nav with theme toggle, auth links
- `HeroSection.jsx` — Animated hero with GSAP/Motion
- `ContentSection.jsx` — Feature overview
- `FeaturesSection.jsx` — Detailed feature cards
- `TeamSection.jsx` — Team members display
- `CallToAction.jsx` — CTA section
- `MinimalFooter.jsx` — Footer
- `LandingBackground.jsx` — Background effects
- `Grainient.jsx` — Grain texture + gradient effects
- `GlassSurface.jsx` — Glassmorphism component
- `Calendar.jsx` — Animated calendar visualization
- `AnimatedNotificationList.jsx` — Notification animation
- `BentoGridShowcase.jsx` — Bento grid layout
- `Folder.jsx` — 3D folder animation (OGL)

### Auth
- `AuthLayout.jsx` — Shared auth page layout
- `SigninForm.jsx` — Login form with useActionState
- `SignupForm.jsx` — Registration form with useActionState

### Admin Dashboard
- `AdminSidebar.jsx` — Sidebar navigation (Dashboard, Timetable, Classroom Requests, Users)
- `AdminDashboardClient.jsx` — Lab allocation CRUD UI (22KB — full table, forms, dialogs)
- `TimetableGeneratorClient.jsx` — Timetable generation wizard (20KB)
- `ClassroomRequestsReviewClient.jsx` — Request review with status management
- `UserManagementClient.jsx` — User list, role assignment dialog, CR toggle

### Student Dashboard
- `StudentSidebar.jsx` — Sidebar navigation (Schedule, Classroom Access, Notifications)
- `StudentScheduleCalendar.jsx` — Weekly schedule calendar grid
- `ClassroomAccessClient.jsx` — Request form + request history + lock proof upload
- `NotificationSettingsClient.jsx` — Email settings + send test notification

### Shared
- `DashboardBreadcrumb.jsx` — Dynamic breadcrumbs based on pathname
- `providers.jsx` — SessionProvider + ThemeProvider combo

### UI Primitives (shadcn/Radix — 20 components)
alert-dialog, breadcrumb, button, card, collapsible, command, dialog, input-group, input, label, popover, select, separator, sheet, sidebar, skeleton, sonner, table, textarea, tooltip

---

## 12. Environment Configuration

```env
# Database (Azure PostgreSQL)
DATABASE_URL="postgresql://...@chris-server.postgres.database.azure.com:5432/scheduleit?sslmode=require..."
STUDIO_DATABASE_URL="..." # Separate URL for Prisma Studio (no uselibpqcompat)

# Auth
AUTH_URL="http://localhost:3000"
AUTH_SECRET="<base64-secret>"

# Email (Gmail SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=yeageristsrule@gmail.com
SMTP_PASS=<app-password>
FROM_EMAIL=yeageristsrule@gmail.com
```

---

## 13. Prisma Client Setup

- Uses `@prisma/adapter-pg` with a raw `pg.Pool` for Azure compatibility
- SSL auto-detected from connection string (`sslmode=require`)
- Global singleton pattern to prevent connection leaks in dev (hot reload)
- Cache validation checks for model existence before reusing cached client

---

## 14. Design System

### Color Scheme (oklch-based)
- **Primary:** Warm orange-amber `oklch(0.6420 0.1691 38.5815)`
- **Secondary:** Deep blue-purple `oklch(0.4138 0.0846 259.8759)`
- **Light bg:** `oklch(0.9383 0.0042 236.4993)` / **Dark bg:** `oklch(0.2178 0 0)`
- Full light + dark mode support with CSS custom properties

### Typography
- **Sans:** Outfit (primary)
- **Serif:** Merriweather (accent)
- **Mono:** Fira Code (code)

### Component Style
- shadcn `base-maia` style preset
- Icon library: HugeIcons
- Border radius: `0.375rem` base with scaling variants
- Registry: `@react-bits` from reactbits.dev

---

## 15. Seed Data

Default password for all seed accounts: `password123`

| Username | Role | Class | Notes |
|----------|------|-------|-------|
| `super_admin` | SUPER_ADMIN | — | Full access |
| `admin_user` | ADMIN | — | Schedule write |
| `tt_setter` | TIMETABLE_SETTER | — | Timetable generation |
| `ct_fe` | CLASS_TEACHER | FE | Reviews FE classroom requests |
| `ct_te` | CLASS_TEACHER | TE | Reviews TE classroom requests |
| `mr_sharma` | NORMAL_TEACHER | — | View-only admin |
| `fe_student` | STUDENT | FE | CR ✅ |
| `fe_student2` | STUDENT | FE | Regular student |
| `se_student` | STUDENT | SE | Regular student |
| `te_student` | STUDENT | TE | CR ✅ |
| `be_student` | STUDENT | BE | Regular student |

**Seed Lab Allocations:** 8 entries across FE/SE/TE/BE classes covering various subjects and labs.

---

## 16. Key Scripts

```bash
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run start        # Start production server
npm run seed         # Run database seeder (node prisma/seed.js)
npm run db:studio    # Open Prisma Studio
npm run lint         # ESLint
npm run postinstall  # prisma generate (auto after npm install)
```

---

## 17. Next.js Configuration

- **Image domains:** `images.unsplash.com` allowed for remote patterns
- **App Router** (not Pages Router)
- **RSC enabled** (components.json `rsc: true`)

---

## 18. Third-Party Integrations

| Integration | Purpose |
|-------------|---------|
| Azure PostgreSQL | Cloud database hosting |
| Gmail SMTP | Email notifications via Nodemailer |
| Unsplash | Remote images for UI |
| Google Fonts | Outfit, Merriweather, Fira Code |
| reactbits.dev | Additional component registry |

---

## 19. Architecture Patterns

1. **Full-stack in one project** — No separate backend; Next.js server actions handle all business logic
2. **Server Components by default** — Pages are async server components; client components marked with `"use client"`
3. **Server Actions for mutations** — All data mutations go through `"use server"` action functions
4. **Guard pattern** — Every server action has a `requireXxx()` guard that checks auth + role before proceeding
5. **Error-as-value** — Actions return `{ error: string }` or `{ success: true, ...data }` instead of throwing
6. **Path revalidation** — `revalidatePath()` called after mutations to refresh cached pages
7. **Progressive data loading** — Student schedule falls back from published timetable → lab allocations
8. **Transaction safety** — Multi-step DB operations wrapped in `prisma.$transaction()`
