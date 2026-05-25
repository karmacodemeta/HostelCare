# Engineered Context: Hostel Management System

## 1. Project Status
**Current Phase:** Feature Refinement & Future Planning
**Last Updated:** 2025-12-13

## 2. Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4, Framer Motion
- **UI Library:** Custom Glassmorphism Components, Bento Grid, Shadcn UI (Dialogs)
- **Database:** MongoDB (Mongoose)
- **State Management:** Server Actions + React Server Components + `useActionState`
- **Authentication:** Custom JWT (HTTP-Only Cookies) + RBAC (`jose` library)
- **Multi-Tenancy:** Schema-Level Isolation (`hostelId` driven)

## 3. Folder Structure
```
/
├── app/
│   ├── (admin)/        # Protected Hostel Admin Routes
│   │   ├── dashboard/  # Financial Dashboard
│   │   ├── students/   # Student Management
│   │   ├── expenses/   # Expense Tracker
│   │   ├── activity/   # Activity Logs
│   │   └── layout.tsx  # Admin Layout (Sidebar, SignOut)
│   ├── (student)/      # Protected Student Routes (Future)
│   ├── (auth)/         # Authentication Routes
│   │   ├── login/      # Login Page 
│   │   └── layout.tsx  # Auth Layout (Branding Footer)
│   ├── super-admin/    # Super Admin Routes (Onboarding)
│   │   ├── hostels/    # Hostel Management
│   │   └── layout.tsx  # Super Admin Layout
│   ├── api/            # API Routes
│   ├── actions/        # Server Actions (Business Logic)
│   │   ├── auth.ts     # Login/Logout
│   │   ├── student.ts  # Student Data Operations
│   │   ├── expense.ts  # Expense & Category Operations
│   │   ├── branch.ts   # Branch Operations
│   │   ├── dashboard.ts# Dashboard Stats
│   │   └── super-admin.ts # Hostel Onboarding
│   ├── layout.tsx      # Root Layout
│   └── page.tsx        # Landing Page
├── lib/
│   ├── db.ts           # Database Connection (Cached)
│   ├── auth.ts         # JWT Encryption/Decryption, Session Management
│   ├── logger.ts       # Centralized Activity Logger
│   └── utils.ts        # Helper Functions
├── models/
│   ├── Hostel.ts       # Tenant/Hostel Schema
│   ├── User.ts         # User Schema (Super Admin, Hostel Admin, Staff, Student)
│   ├── Student.ts      # Student Schema (Tenant Isolated)
│   ├── Expense.ts      # Expense Schema (Tenant Isolated)
│   ├── Branch.ts       # Branch Schema (Tenant Isolated)
│   ├── ActivityLog.ts  # Audit Log Schema (Tenant Isolated)
│   └── ExpenseCategory.ts # Category Schema (Tenant Isolated)
├── components/
│   ├── ui/             # Reusable UI (Buttons, Inputs, Cards)
│   ├── dashboard/      # Dashboard Specific (Stats, Charts)
│   ├── expenses/       # Expense Specific (CategoryManager)
│   ├── branch/         # Branch Specific (BranchSelector)
│   ├── super-admin/    # Super Admin Specific (AddHostelDialog)
│   └── theme-toggle.tsx # Dark Mode Toggle
└── middleware.ts       # Route Protection & Role-Based Redirects
```

## 4. Features & Status

| Feature | Status | Notes |
| :--- | :--- | :--- |
|Feature | Status | Notes |
| :--- | :--- | :--- |
| **Multi-Tenancy** | 🟢 Implemented | `hostelId` in all models, Isolated Actions |
| **Authentication** | 🟢 Implemented | JWT, Cookies, Role-Based Access |
| **Super Admin Dashboard** | 🟢 Implemented | Hostel Onboarding, Admin Creation |
| **Student Management** | 🟢 Implemented | Add, List, Excel Upload, Search, Edit |
| **Rent Collection** | 🟢 Implemented | Bulk Collection, **Student Profile & Payment History** |
| **Expense Tracker** | 🟡 Refinement | Add, List, Categories. **UI Revamp Pending.** |
| **Food Menu (Mess)** | 🟢 Implemented | Weekly Plan, **Global/Branch Menu**, Student View (Toggle) |
| **Branch Management** | 🟢 Implemented | Create, Edit, Context Switching |
| **Activity Logs** | 🟢 Implemented | Centralized Logging, Feed UI, **Detailed Diffs** |
| **Feature Flagging** | 🟡 Partial | Schema & Helper ready, UI integration pending |
| **UI/UX** | 🟢 Implemented | Glassmorphism, Dark Mode, Animations |
| **Excel Upload** | 🟢 Implemented | Bulk Student Import |

## 5. Schema Definitions

### Hostel (Tenant)
- `name`: String
- `address`: String
- `ownerName`: String
- `contactNumber`: String
- `subscriptionStatus`: Enum ['active', 'inactive']

### User
- `email`: String
- `password`: String (Plaintext MVP -> Hashed)
- `name`: String
- `role`: Enum ['super_admin', 'hostel_admin', 'staff', 'student']
- `hostelId`: ObjectId (Ref: Hostel)

### Branch
- `name`: String (Unique per Hostel)
- `address`: String
- `managerName`: String
- `hostelId`: ObjectId (Ref: Hostel)

### Student
- `name`: String
- `guardian`: String
- `roomNo`: String
- `rent`: Number
- `dues`: Number
- `branchId`: ObjectId (Ref: Branch)
- `hostelId`: ObjectId (Ref: Hostel)

### Expense
- `category`: String
- `amount`: Number
- `date`: Date
- `branchId`: ObjectId (Ref: Branch)
- `hostelId`: ObjectId (Ref: Hostel)

### ExpenseCategory
- `name`: String
- `isDefault`: Boolean
- `hostelId`: ObjectId (Ref: Hostel)

### ActivityLog
- `action`: String
- `entityType`: Enum
- `entityId`: ObjectId
- `performedBy`: String
- `details`: JSON
- `hostelId`: ObjectId (Ref: Hostel)

## 6. Architecture & Guidelines
- **Data Isolation:** All database queries MUST filter by `hostelId` (except Super Admin).
- **Session Management:** `getSession()` must be called in every server action to verify identity and retrieve `hostelId`.
- **Atomic Components:** UI components should receive data as props or fetch via server actions, avoiding direct DB calls in components.
- **Error Handling:** Server actions return `{ success: boolean, message: string }` for consistent UI feedback.
- **Data Seeding:** Default data (e.g., Expense Categories) should be seeded at **creation time** (e.g., inside `createHostel`), not lazily at runtime, to prevent user-deleted data from reappearing.

## 7. Future Roadmap (Premium Features)
- **Feature Flagging System:** Architecture to gate features (Student Profile, Advanced Stats) based on Subscription Tier/Admin Toggle.
- **Student Profile & Payment History:** Detailed view with month-wise rent tracking based on onboarding date.
- **Visual Room Management:** Interactive map of rooms, bed assignments, and asset tracking (Inventory).
- **Advanced Activity Logging:** Detailed analytics and monitoring for hostel admins.
- **Audio/AI Search:** Fuzzy search and voice-command capabilities for finding students/expenses.
- **AI Assistant:** Chatbot for querying data and performing actions ("Add expense 500 for food").
