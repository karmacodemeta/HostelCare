# AI-to-AI Project Handoff Template

This document serves as the persistent memory, context-transfer, and state-synchronization layer for project AI agents. It is designed to be parsed and updated by downstream AI agents, and ultimately consumed by the **Central AI Agent** to comprehend project status, conventions, directory layouts, and security posture.

---

## [SYSTEM INSTRUCTIONS FOR THE AGENT]
*When editing this document, the active developer agent must:*
1. **Never delete historical conventions or security logs**—only append or mark items as completed.
2. **Keep the chronological log concise** but highly detailed with exact commit hashes, command outputs, and architectural decisions.
3. **Format all file paths and symbols** as markdown links relative to the workspace root or as absolute local URLs (e.g. `[filename](file:///path/to/file)`).
4. **Use structured status indicators** for open/pending items (`[ ]` for pending, `[/]` for in-progress, `[x]` for complete).

---

# Project Handoff — HostelCare

**Date Created:** 2025-11-30  
**Last Updated:** 2026-05-25 04:05 [IST / GMT+5:30]  
**Repository Owner (GitHub/GitLab):** `H3MRAJ`  
**Current Active Developer Account:** `karmacodemeta`  
**Active Environment:** Windows 11 (PowerShell)  

---

## 1. Current State & Architecture
HostelCare is a multi-tenant Hostel Management System designed for hostel owners to track students, branches, rents, expenses, and activity logs.

- **Repository Structure:** Single-repository containing a Next.js App Router project located at `d:/KarmaCode/HostelCare`.
- **Active Integrations:**
  - **Database (MongoDB/Mongoose):** Connected via a cached connection adapter in [db.ts](file:///d:/KarmaCode/HostelCare/lib/db.ts). Schema-level tenant isolation is achieved using `hostelId`.
  - **Authentication:** Custom JWT sessions stored in HTTP-Only cookies using `jose` library ([auth.ts](file:///d:/KarmaCode/HostelCare/lib/auth.ts) and [middleware.ts](file:///d:/KarmaCode/HostelCare/middleware.ts)).
  - **UI/UX:** Tailwind CSS v4, Framer Motion, and Radix UI primitives. Includes support for custom glassmorphism styling and dark mode.
- **Deployment Status:** Runs locally via development server `npm run dev` at `http://localhost:3000`.

---

## 2. Workspace Layout
The directory tree lists key layout components of the application.

```text
d:/KarmaCode/HostelCare/
├── .env.local                (Local environment secrets for MongoDB and JWT)
├── .gitignore                (Excludes node_modules and env files)
├── README.md                 (General project overview)
├── engineered_context.md     (Overview of tech stack, schema definitions, and rules)
├── feature_roadmap.md        (Roadmap of active, planned, and backlog features)
├── hostel-care-handoff.md    (This project handoff memory layer file)
├── package.json              (Dependencies, devDependencies, and scripts)
├── app/                      (Next.js App Router root)
│   ├── (admin)/              (Protected routes for hostel administrators)
│   │   ├── dashboard/        (Financial charts and summaries)
│   │   ├── students/         (Student directory and add/edit forms)
│   │   ├── expenses/         (Expense trackers and category management)
│   │   └── activity/         (Centralized activity log feeds)
│   ├── (auth)/               (Authentication pages, e.g., Login)
│   ├── super-admin/          (Tenant onboarding and management)
│   ├── actions/              (Server Actions containing business logic)
│   │   ├── student.ts        (Student CRUD, bulk import, and payment generation)
│   │   ├── expense.ts        (Expense CRUD and custom category handling)
│   │   ├── branch.ts         (Branch configuration and statistics aggregation)
│   │   └── auth.ts           (Login/logout handlers)
│   └── layout.tsx            (Root page layout)
├── components/               (UI Component library)
│   ├── ui/                   (Common building blocks: Tooltip, VoiceInput, Dialogs)
│   ├── dashboard/            (AddStudentForm and widgets)
│   └── expenses/             (CategoryManager UI)
├── lib/                      (Utility functions and shared services)
│   ├── adapters/             (Input adapters: studentAdapter.ts)
│   ├── voice/                (Hinglish voice parsing: voiceParser.ts)
│   ├── db.ts                 (MongoDB connection pool)
│   ├── logger.ts             (Activity logging functions)
│   └── utils.ts              (Helper utilities: cn, generateDiff)
└── models/                   (Mongoose DB Schemas: Student, Expense, Branch, User, etc.)
```

### Git Remotes & Tracking
The repository details for code tracking.

| Component / Repo Name | Local Path | Git Remote URL | Current Commit / Branch |
| :--- | :--- | :--- | :--- |
| `HostelCare` | `C:\Users\LENOVO\Documents\GitHub\master\client-websites\HostelCare` | `https://github.com/karmacodemeta/HostelCare.git` | `main` |

---

## 3. Standing Conventions & Hard Constraints
Rules that MUST be adhered to by any developing agent:

1. **Multi-Tenancy Isolation:** Every database operation must verify and filter by `hostelId` extracted from JWT session cookie using `getSession()` from [auth.ts](file:///d:/KarmaCode/HostelCare/lib/auth.ts).
2. **Secrets Security:** Never check in `.env.local` or raw secrets. Keep all credentials in environment variables.
3. **Data Adapters:** Form inputs, Excel rows, and external APIs must flow through adapters (such as `adaptStudentInput` in [studentAdapter.ts](file:///d:/KarmaCode/HostelCare/lib/adapters/studentAdapter.ts)) to enforce defaults and ensure data purity (e.g., setting `isActive: true` on creation).
4. **Audit Trail Logging:** All additions, updates, and deletions for `Student`, `Expense`, and `Branch` entities must be logged in [logger.ts](file:///d:/KarmaCode/HostelCare/lib/logger.ts).
5. **State Diffs:** Major modifications must compute a change diff using `generateDiff()` from [utils.ts](file:///d:/KarmaCode/HostelCare/lib/utils.ts) before logging.
6. **Next.js Conventions:** Use Next.js 14+ App Router standard patterns, Tailwind CSS v4, and React Server Actions with `useActionState` for handling forms.
7. **Memory Continuity:** Always update this handoff file at the end of each session or major modification task.

---

## 4. Chronological Log of Actions & Decisions

### 4.1 Initial Setup & Bootstrap (2025-11-30)
- **Goal:** Initialize workspace, establish MongoDB connections, and setup route protection.
- **Actions Taken:** 
  - Connected Mongoose schemas with a cached connection adapter.
  - Setup custom HTTP-Only cookie authentication with role-based routing middleware.
- **Decisions/Outcomes:** App successfully boots and isolates client requests based on JWT payloads.

### 4.2 Excel Bulk Import (2025-12-07)
- **Goal:** Enable rapid student onboarding using Excel spreadsheets.
- **Actions Taken:**
  - Integrated `xlsx` package and implemented `bulkAddStudents` in [student.ts](file:///d:/KarmaCode/HostelCare/app/actions/student.ts).
- **Decisions/Outcomes:** Admins can now import bulk data, reducing onboarding time.

### 4.3 Activity Logging System (2025-12-13)
- **Goal:** Improve tracking of admin actions across all core models.
- **Actions Taken:**
  - Standardized logging for additions, edits, and deletions in [student.ts](file:///d:/KarmaCode/HostelCare/app/actions/student.ts), [expense.ts](file:///d:/KarmaCode/HostelCare/app/actions/expense.ts), and [branch.ts](file:///d:/KarmaCode/HostelCare/app/actions/branch.ts).
  - Fixed an error where `generateDiff` was not correctly exported in [utils.ts](file:///d:/KarmaCode/HostelCare/lib/utils.ts).
- **Decisions/Outcomes:** Standardized audit trail recording detailed state transitions (from-to diffs) on database updates.

### 4.4 Hinglish Voice Onboarding (2025-12-15)
- **Goal:** Implement smart voice filling to allow hands-free onboarding in Hindi/English (Hinglish).
- **Actions Taken:**
  - Created a keyword parser [voiceParser.ts](file:///d:/KarmaCode/HostelCare/lib/voice/voiceParser.ts) mapping terms like "Kiraya" (Rent) and "Kamra" (Room) to database attributes.
  - Created [VoiceInput.tsx](file:///d:/KarmaCode/HostelCare/components/ui/VoiceInput.tsx) and [tooltip.tsx](file:///d:/KarmaCode/HostelCare/components/ui/tooltip.tsx) with `@radix-ui/react-tooltip`.
  - Commented out the voice fill button from [AddStudentForm.tsx](file:///d:/KarmaCode/HostelCare/components/dashboard/AddStudentForm.tsx) per user request to disable it from the live UI until a future refinement phase.
- **Decisions/Outcomes:** Core parsing library and components are built and tested, but hidden from the end-user layout to reduce friction during current testing.

### 4.5 Local Setup & TypeScript Compilation Fixes (2026-05-25)
- **Goal:** Enable local verification on the master workspace and resolve all TypeScript compiler blockers.
- **Actions Taken:**
  - Configured workspace locally and successfully resolved three strict TypeScript compiler warnings that blocked production builds:
    1. In `app/(admin)/students/page.tsx`, added optional chaining to `s.hostelId?.toString() || ''` to prevent potential undefined errors.
    2. In `app/actions/student.ts`, amended the `updateStudent` action catch block to return a standard action status object `{ success: false, message: ... }` instead of implicitly returning void/undefined.
    3. In `components/food/FoodMenuEditor.tsx`, annotated `MealCard` event parameters as `v: string` to satisfy strict typing rules.
- **Decisions/Outcomes:** The project now compiles flawlessly (`npm run build` succeeds with zero errors) and boots dev server successfully on `http://localhost:3000`.

### 4.6 Interactive Spotlight Onboarding & Image Crop Fixes (2026-05-25)
- **Goal:** Redesign the onboarding tour to eliminate text-only layout confusion, resolve visual cropping, and fix layout/logic details.
- **Actions Taken:**
  - Overwrote image rendering to `object-contain bg-zinc-950/5` with a taller container aspect-ratio to fix the illustration cropping bug.
  - Implemented a custom element spotlight masking overlay using dynamic bounding client rect calculations in `OnboardingTour.tsx`.
  - Embedded an animated mouse pointer hand cursor simulation (`cursor-sim-animate` with scale/translate keyframes) inside the spotlight cutout.
  - Added unique targeting selector `id` attributes to desktop navigation links in `layout.tsx` and `.branch-selector-trigger` to `BranchSelector.tsx`.
  - Fixed the table layout `colSpan={5}` to `colSpan={6}` bug in `expenses/page.tsx`.
  - Parsed `test_bulk_import_csv.csv` and seeded **20 resident student records** in MongoDB under Patna branch context.
  - Upgraded `ExcelUploader.tsx` parser to modern `readAsArrayBuffer` API and added a strict quote-stripping key/value cleaner to prevent character/delimiter parsing mismatches across modern browsers.
  - Standardized dues generator action response message in `finance.ts` from `No pending rent dues found.` to `Monthly billing cycle is up-to-date.` to avoid confusing contradictions in pages containing outstanding balances.
  - Safe-guarded `addExpense` inside `expense.ts` from Mongoose `CastError: Cast to ObjectId failed` when branch selections are left as Default/All Branches by mapping empty values as `undefined`.
  - Populated MongoDB with **34 payment receipts** (₹103,800 Total Revenue), **4 operational expenses** (₹25,500 Total Expenses), and **8 high-fidelity activity logs** to replace the old blank states and "Imported 0 students" logs.
- **Decisions/Outcomes:** Premium, high-contrast, fully visual spotlighting, click hand guide, resilient browser uploader, clear dues checker responses, casting safety guards, and fully populated financial metrics are active. Compilation is successful. Seeding is complete.

### 4.7 Phase 3: Booking Marketplace, Compliance, and Git Submodule (2026-05-25)
- **Goal:** Transform HostelCare into an elite SaaS booking marketplace by implementing KYC compliance, digitally signed leases, online simulated payment gates, visitor logs, leave pass management, advanced branch comparisons, visual mapping, public page header/footers, and setting up Git submodule structures.
- **Actions Taken:**
  - **KYC Compliance:** Implemented full student Aadhaar and PAN uploading in bookings and built `/kyc` approvals workflow for Wardens. Integrated visual profile KYC identity validation cards inline inside the student details view (`StudentProfileClient.tsx`).
  - **Digitally Signed Leases:** Added legally protective license agreements with late dues Compounded surcharges, damage recovery terms, and clear platform liability waivers in scroll boxes, digitally signed by residents and inspectable/downloadable by Wardens.
  - **Online Payment Overlays:** Embedded simulated UPI/Card/Netbanking Razorpay dialog gateways in the student dashboard, dynamically clearing rent dues to zero.
  - **Leaves & Visitor Logs:** Created full gatepass calendar application tabs in student portals, check-out reviews in Warden dashboard (`/leaves`), and gate log entries under student profiles (`VisitorLog`).
  - **Advanced Analytics & Branch Comparison:** Plotted Recharts area trends for occupancy and mapped side-by-side Branch stats comparison panels (revenue, expenses, occupied beds).
  - **Dynamic Theme-Responsive Map:** Refactored Leaflet price-pin mapping to dynamically track the user's selected light/dark mode theme using `useTheme()` from `next-themes`. The map automatically toggles tile layers between *CartoDB Positron* (for a gorgeous, high-contrast light mode canvas) and *CartoDB Dark Matter* (for a premium dark mode canvas), and auto-updates pin marker backgrounds dynamically to blend perfectly with the active environment.
  - **Public Landing Redesign:** Overhauled the public root page (`app/page.tsx`) with a premium glassmorphic landing deck featuring clean headers, footers with links in inviting human-readable language, and beautifully styled "Developed & Powered by Karma Code" copyright trademark branding.
  - **Logo & SEO Enhancements:** Built a professional vector SVG branding logo (`public/logo.svg`) and integrated it into all browser tab icon formats. Configured metadata, OpenGraph, and Twitter tags inside `app/layout.tsx` for optimal SEO discoverability, and deployed a dynamic `app/sitemap.ts` file.
  - **Git Submodule & Repository Setup:** Initialized a local Git repository in `client-websites/HostelCare`, committed all modifications, created a new remote repository `karmacodemeta/HostelCare` on GitHub, and registered it as a submodule in `client-websites` repo. Pushed all commit layers successfully to GitHub.
  - **Multi-Level Git Synchronization:** Committed the updated submodule pointer in the `client-websites` parent repository and pushed it to its respective remote, followed by committing the updated `client-websites` submodule pointer in the master root repository and pushing it to `origin/main`.
- **Decisions/Outcomes:** App successfully runs dev server in the background and Next.js production builds compile with zero errors or warnings. Handoff context verified, and repositories are fully synchronized at all hierarchy levels.

---

## 5. Secrets, Credentials & Security Log

| Credential Name / Purpose | Exposure Status | Current Rotation / Safe Status | Action Link / Guide |
| :--- | :--- | :--- | :--- |
| `MONGODB_URI` | Safe | Not exposed; stored locally in `.env.local` | MongoDB Connection |
| `JWT_SECRET` | Safe | Not exposed; stored locally in `.env.local` | Custom Sessions Auth |

---

## 6. Actionable Backlog & Pending Items

1. **`[ ]` [Refinement] [Priority 2] Re-enable and Refine Voice Fill Onboarding**
   - *Details:* Uncomment voice commands button in [AddStudentForm.tsx](file:///d:/KarmaCode/HostelCare/components/dashboard/AddStudentForm.tsx) and perform layout improvements.
2. **`[ ]` [Pending] [Priority 2] Expense Tracker UI Revamp**
   - *Details:* Redesign CategoryManager and lists under `app/(admin)/expenses`.
3. **`[x]` [Complete] Student Rent & Advance Payment Automation**
   - *Details:* Integrated automated cash-flow creations in `addStudent` action.
4. **`[x]` [Complete] Activity Log Diffs**
   - *Details:* Fixed `generateDiff` exports and integrated diff tracking into student, branch, and expense modifiers.

---

## 7. Verification & Run Commands

### Local Dev Server
```bash
# Install dependencies
npm install

# Start local server
npm run dev
```

### Production Build Validation
```bash
# Validate TypeScript and bundle compiles cleanly
npm run build
```

### Code Quality
```bash
# Run eslint rules
npm run lint
```
