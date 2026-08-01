# Vitalis — Antigravity Build Plan

Paste this entire file into Antigravity as the project brief. Tell Antigravity explicitly:

> "Implement this file phase by phase, in order. Do not start a new phase until the previous one is verified against its checklist. Do not deviate from the design system in Section 2 at any point in the project — every screen, in every phase, must visually match it exactly (colors, type, spacing, components). Re-read Section 2 before building any new screen."

---

## 0. PROJECT OVERVIEW

**Vitalis** — a full-stack Hospital Management System with three roles (Patient, Doctor, Admin), JWT auth, real-time updates via SSE, and MongoDB Atlas storage.

### Tech Stack (fixed — do not substitute)
- **Frontend:** React 18 + Vite, TailwindCSS (configured with the exact design tokens in Section 2 — no default Tailwind palette), React Router, `date-fns` for dates
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas via Mongoose ODM
- **Auth:** JWT (access token + refresh token), bcrypt for password hashing, role-based middleware (patient / doctor / admin)
- **Real-time:** Server-Sent Events (SSE) — **not** WebSockets, **not** Socket.io. A single `/api/events` endpoint streaming typed events; client subscribes with the native `EventSource` API.
- **File uploads:** Multer → store on disk (or S3-compatible bucket if available) for test reports; store only the file reference/URL in MongoDB.

### Environment variables (backend `.env`, never hardcoded, never committed)
```
MONGODB_URI=<see note below>
JWT_ACCESS_SECRET=<generate a strong random secret>
JWT_REFRESH_SECRET=<generate a strong random secret>
PORT=5000
CLIENT_URL=http://localhost:5173
```
**MongoDB URI:** use the connection string the user provided you outside this file. Put it directly in `.env` (which must be in `.gitignore` from commit #1). Never print it in logs, never hardcode it in any `.js`/`.ts` file, never commit it. If a `.env.example` is created for the repo, it must contain a placeholder only (`MONGODB_URI=your_connection_string_here`).

---

## 1. FOLDER STRUCTURE

```
vitalis-hms/
├── client/                  # React + Vite
│   ├── src/
│   │   ├── components/ui/   # shared design-system components (Section 2)
│   │   ├── components/layout/  # ChartRail, ChartBar, TopBar
│   │   ├── pages/patient/
│   │   ├── pages/doctor/
│   │   ├── pages/admin/
│   │   ├── pages/auth/
│   │   ├── hooks/useSSE.js
│   │   ├── context/AuthContext.jsx
│   │   ├── api/
│   │   └── styles/tokens.css
├── server/
│   ├── models/               # User, Doctor, Patient, Appointment, Prescription, MedicalRecord, Invoice
│   ├── routes/
│   ├── controllers/
│   ├── middleware/auth.js
│   ├── middleware/roleGuard.js
│   ├── sse/eventBus.js
│   └── server.js
├── .env
├── .gitignore
└── README.md
```

---

## 2. DESIGN SYSTEM — "The Chart Rail" (LOCKED — replicate exactly on every screen)

This must be built ONCE as a shared component + token library in Phase 1, then reused everywhere. Never redefine colors/fonts/spacing inline in a page component.

### 2.1 Color tokens (`styles/tokens.css` → Tailwind config)
```css
--bg: #F2F3EF;           /* page background, clinical paper-grey */
--surface: #FFFFFF;
--ink: #14171C;          /* near-black text, nav rail bg */
--sub: #5B6058;
--faint: #8B9089;
--line: #DBDED6;
--line-strong: #C4C8BE;

--teal: #0F6E5D;         /* Patient ward */
--teal-deep: #0B4F43;
--teal-tint: #E4F0EC;

--indigo: #3A4B8C;       /* Doctor ward */
--indigo-deep: #2B3868;
--indigo-tint: #E8EAF5;

--rust: #B1631F;         /* Admin ward */
--rust-deep: #8C4E17;
--rust-tint: #F6ECDC;

--red: #B33A2E;          /* urgent / cancelled */
--red-tint: #F7E7E4;
--amber: #C68A1E;        /* pending */
--amber-tint: #F8EEDA;
```
Ward-color rule: **teal = patient, indigo = doctor, rust = admin** — never swap these across the app.

### 2.1a Brand mark
Vitalis uses a fixed logo: a stylized leaf/V mark in solid `--teal` (#0F6E5D), transparent background. Antigravity should receive this asset (`vitalis-logo.png`, provided separately — place it at `client/src/assets/vitalis-logo.png`) and use it everywhere the design previously called for a placeholder "brand mark" shape:
- Login screen: centered above "Vitalis" wordmark, roughly 56–64px.
- Rail mark (top of the left nav rail): small version, ~32–40px, on a transparent or `--ink` background — do NOT put it in a colored tile/badge shape, just place the mark directly (it's already a complete icon).
- Favicon: export a square-cropped version of the same mark.
Do not recolor, outline, or add a background shape to the logo — use it exactly as supplied, teal on transparent.

### 2.2 Typography
- Display/headings: **Instrument Sans**, 600–700 weight, tight tracking
- Body: **Work Sans**, 400–500
- Data/labels/IDs/timestamps/status text: **IBM Plex Mono**, uppercase, letter-spacing ~0.06–0.09em, small size (9.5–11px)

### 2.3 Shared layout components (build these first, as reusable React components)

**`<AppShell>`** — used on every logged-in screen:
- Top bar: product wordmark left, a few contextual quick-action links (varies per role — e.g. "Search Patient / Add Entry / Report Issue" for patient; module tabs like "Overview / ER-1 / Ward-B / ICU-4" for admin), then a ward-color pill (`● Patient Ward` / `● Doctor Ward` / `● Admin Ward`), notification bell icon, help icon, user avatar — all right-aligned.
- Left nav rail: narrow (72–96px), `--ink` background, icon-only (small mono label under each icon), organized as die-cut folder tabs. Active tab gets a 3–4px colored left border in the current ward color plus a small glowing dot. Bottom of the rail holds a settings gear icon and the user avatar/thumbnail.

**`<ChartBar>`** — page header used under the top bar on every screen: big page title (Instrument Sans), a monospace metadata subline (IDs, dates, counts), ward-color pill or action buttons on the right.

**`<StatCard>`** — card with a colored 3px top border (ward color, contextual per stat), a small uppercase mono label, a large Instrument Sans value, and an optional mono sub-line/action link underneath.

**`<StampBadge status="pending|confirmed|completed|cancelled">`** — monospace uppercase pill-ish tag, 1.5px solid border in the status color, tinted background, rotated -2deg, small dot before the text. Colors: pending=amber, confirmed=teal, completed=indigo, cancelled=red.

**`<PulseDivider label="...">`** — thin horizontal rule with a small heartbeat/ECG SVG icon inline and a mono uppercase caption, used as the section divider everywhere instead of a plain `<hr>`.

**`<DataTable>`** — clean table: bold mono uppercase column headers with a thicker bottom border, hairline row dividers, no zebra striping, ghost buttons in the action column.

**Buttons:** solid `--ink` or ward-color primary buttons with mono uppercase label + arrow (→); ghost variant = transparent bg, ink border/text, fills on hover. Sharp-ish corners (3–4px radius) everywhere except avatars/dots/pills, which are fully round. No drop shadows, no gradients.

---

## 3. SCREENS TO BUILD (reference: the 18 Stitch mockups already generated — replicate pixel-for-pixel where structure is shown, extrapolate consistently where a state isn't shown)

| # | Screen | Route | Role |
|---|--------|-------|------|
| 1 | Login / role select | `/login` | public |
| 2 | Patient registration (3-step) | `/register` | public |
| 3 | Patient dashboard | `/patient/home` | patient |
| 4 | Book a visit (specialization → doctor/slot → confirm) | `/patient/book` | patient |
| 5 | Booking confirmation | `/patient/book/confirm/:id` | patient |
| 6 | Doctor dashboard / today's queue | `/doctor/queue` | doctor |
| 7 | Doctor directory (admin) | `/admin/doctors` | admin |
| 8 | Add/edit doctor profile | `/admin/doctors/new`, `/admin/doctors/:id/edit` | admin |
| 9 | Patient directory (admin) | `/admin/patients` | admin |
| 10 | Medical record detail (patient-facing) | `/patient/records/:id` | patient |
| 11 | Medical record detail (doctor-facing) | `/doctor/patients/:id/record` | doctor |
| 12 | Attach test report | `/doctor/patients/:id/attach-report` | doctor |
| 13 | New prescription (doctor pad) | `/doctor/patients/:id/prescribe` | doctor |
| 14 | Prescription view/download (patient) | `/patient/prescriptions/:id` | patient |
| 15 | Billing & payments | `/patient/billing` | patient |
| 16 | Secure checkout / payment | `/patient/billing/pay/:invoiceId` | patient |
| 17 | Admin overview / analytics | `/admin/overview` | admin |
| 18 | Reports & export | `/admin/reports` | admin |

Every screen uses `<AppShell>` + `<ChartBar>` as scaffolding. Do not build a one-off layout for any screen.

---

## 4. REAL-TIME (SSE) SPEC

Single endpoint: `GET /api/events` (JWT-authenticated, keeps connection open, sends `retry:` + `event:`/`data:` frames).

Event types to implement:
- `appointment:created` / `appointment:statusChanged` → payload `{ appointmentId, patientId, doctorId, status }` — drives live status-badge updates on the patient's dashboard, the doctor's queue, and admin's pending-confirmations table without a page refresh.
- `queue:update` → doctor's "today's queue" list re-orders/refreshes live as patients are marked confirmed/completed.
- `prescription:issued` → patient's prescriptions list updates live.
- `invoice:paid` → billing screens update live.
- `notification:new` → generic bell-icon notification for any role.

Backend: maintain an in-memory map of `userId → response stream(s)` in `sse/eventBus.js`; on any relevant DB write, call `eventBus.emit(userId, eventType, payload)` to push to that user (and to other affected users — e.g. both patient and doctor on an appointment change).

Frontend: a single `useSSE()` hook opens one `EventSource` per session, dispatches incoming events into a small event-driven context so any subscribed component (dashboard cards, queue table, notification bell) reacts without polling.

---

## 5. AUTH SPEC

- `POST /api/auth/register` (patient self-registration — Screen 2 flow)
- `POST /api/auth/login` — returns access token (short-lived, ~15min) + refresh token (httpOnly cookie, ~7 days)
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password` / `POST /api/auth/reset-password`
- Role-based middleware (`roleGuard('patient' | 'doctor' | 'admin')`) protecting every non-public route.
- Admin accounts and doctor accounts are provisioned by an existing admin (not self-registered) — only patients self-register.
- Passwords hashed with bcrypt (cost factor 12). Never log or return password hashes.

---

## 6. PHASED BUILD PLAN — execute strictly in order

For every phase: **build → run locally → self-verify against the checklist → report a short summary of what was built and the verification result → wait for go-ahead before the next phase** (or proceed automatically only if explicitly told to run all phases unattended).

### **Phase 0 — Scaffold**
- Init `client/` (Vite + React + Tailwind) and `server/` (Express + Mongoose) in the folder structure above.
- Set up `.env`, `.gitignore` (must include `.env`, `node_modules`, `dist`).
- Connect to MongoDB Atlas using `MONGODB_URI` from `.env`; log a single "MongoDB connected" message on success, never log the URI itself.
- Set up Tailwind config with every token from Section 2.2/2.3 as custom theme values (colors, fontFamily).
- Install and configure Google Fonts (Instrument Sans, Work Sans, IBM Plex Mono).

**Verify:** server boots, logs "MongoDB connected", client boots on Vite dev server, a blank page renders using `--bg` background color and the three fonts load (check Network tab / computed styles). No secrets in any committed file.

### **Phase 1 — Design system + Auth**
- Build every shared component in Section 2.3.
- Build Screens 1 & 2 (Login, Registration) wired to real `/api/auth` endpoints.
- Implement JWT issuing/verification, `AuthContext` on the client, protected route wrapper.

**Verify:** can register a new patient end-to-end (data lands in MongoDB `users`/`patients` collection), can log in and receive a valid JWT, protected routes redirect to `/login` when unauthenticated. Visually compare Login + Registration screens against the reference mockups (wristband card, striped top edge, role-select tiles, 3-step tracker) — flag any deviation before continuing.

### **Phase 2 — Patient module**
- Screens 3, 4, 5 (dashboard, book a visit, confirmation).
- Models: `Doctor`, `Appointment`.
- Endpoints: list doctors by specialization, get available slots, create appointment (status defaults to `pending`), get patient's own appointments.
- Wire SSE: appointment status changes reflect live on the dashboard.

**Verify:** booking flow works end-to-end and creates a real `Appointment` document; dashboard's "Next Appointment" card reflects real data; slot picker correctly disables already-booked slots; confirmation screen shows the correct stamp state and a working "status flow" indicator.

### **Phase 3 — Doctor module**
- Screens 6, 11, 12, 13.
- Models: `MedicalRecord`, `Prescription`, `TestReport`.
- Endpoints: doctor's queue for today, patient chart lookup, issue prescription, attach test report (Multer upload), add diagnosis note.
- Wire SSE: `queue:update` on visit start/complete; `prescription:issued` notifies the patient.

**Verify:** doctor can start a visit, issue a prescription, and attach a report, each of which correctly appears on the corresponding patient-facing screens (14, 10) in real time without refresh. Confirm the "quick prescription" and "full prescription pad" both write to the same `Prescription` model correctly.

### **Phase 4 — Admin module**
- Screens 7, 8, 9, 17, 18.
- Endpoints: CRUD doctors, list/search patients, dashboard aggregate stats (counts, revenue, department breakdown, doctor performance), CSV export per report type.
- Wire SSE: `appointment:statusChanged` reflected live in the "pending confirmations" table on the admin overview.

**Verify:** adding a doctor via the form actually creates a queryable `Doctor` and immediately appears in the directory + patient-side specialization search from Phase 2. Admin overview stat cards pull real aggregate numbers (not hardcoded). CSV export produces a downloadable file with correct data for the selected date range.

### **Phase 5 — Billing**
- Screens 15, 16.
- Model: `Invoice`.
- Endpoints: generate invoice (auto-created after a completed consultation — link to consultation charge + any attached medicine/test line items), list patient's invoices/payment history, process payment (mock/stub payment gateway is fine — clearly stubbed, not a real payment integration), mark invoice paid.
- Wire SSE: `invoice:paid` updates billing screen live; also updates the "Outstanding Balance" stat card on the patient dashboard (Phase 2).

**Verify:** completing a doctor visit (Phase 3) auto-generates an invoice visible on the patient's billing screen; paying it updates status everywhere it's referenced (dashboard stat card, billing screen, payment history table) via SSE, not a manual refresh.

### **Phase 6 — Cross-cutting polish + hardening**
- Notification bell wired to `notification:new` SSE events across all roles.
- Loading/skeleton states for all data-fetching screens (per the ux-guidelines: never leave the UI frozen with no feedback >300ms).
- Empty states designed in the same visual language (e.g. "no appointments yet" using the same card style, not a generic centered message).
- Error handling: form validation matches the field style already used (bordered input + mono label), inline error text in `--red`.
- Responsive check: rail collapses to icon-only compactly on narrower viewports (already designed at 820px/560px breakpoints in the original mockup CSS — carry those breakpoints through).
- Full re-audit: open every one of the 18 screens side by side with the reference mockups and confirm ward colors, fonts, stamp badges, and rail styling are identical across all of them — no drift by the time you reach screen 18.

**Verify:** run through the entire user journey once per role (register → book → get diagnosed → get prescribed → pay invoice as a patient; manage queue → prescribe → attach report as a doctor; add a doctor → review pending appointments → export a report as admin) with zero console errors and zero visual inconsistencies against Section 2.

### **Phase 7 — Deployment readiness**
- Production build for client (`vite build`), serve via Express static or separate host.
- Environment-based config (dev/prod `.env` handling documented in README, no secrets in repo).
- Final `.gitignore` audit — confirm `.env`, `node_modules`, build artifacts are excluded, and that no MongoDB URI ever appears in git history (check with `git log -p -- .env` returns nothing).

**Verify:** production build runs cleanly, health-check endpoint (`/api/health`) responds, MongoDB connects using env var only.

---

## 7. STANDING RULES FOR ANTIGRAVITY (apply throughout, every phase)

1. Never hardcode the MongoDB URI, JWT secrets, or any credential in a source file — env vars only.
2. Never restyle or introduce new colors/fonts outside Section 2 — if a new UI need arises (e.g. a toast notification), derive its style from existing tokens rather than inventing new ones.
3. Every new screen must use `<AppShell>` + `<ChartBar>`; do not build bespoke page chrome.
4. After each phase, give a short written verification report (what was tested, what passed/failed) before moving on.
5. Keep ward-color mapping consistent everywhere: teal=patient, indigo=doctor, rust=admin. Never let a component default to blue/purple/generic SaaS colors.
6. SSE only for real-time — do not introduce polling or WebSockets as a substitute.
