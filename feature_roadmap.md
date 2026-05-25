# Feature Roadmap & Ideas Tracker

> **Full analysis in:** [PRODUCT_ANALYSIS_AND_ROADMAP.md](./PRODUCT_ANALYSIS_AND_ROADMAP.md)  
> **Last Updated:** 2026-05-25 by Antigravity AI

---

## ✅ Phase 0 — Completed

| Feature | Status |
|---|---|
| Multi-tenancy (hostelId isolation) | ✅ Done |
| JWT Authentication + RBAC | ✅ Done |
| Student Management (CRUD + Excel import) | ✅ Done |
| Branch Management + context switching | ✅ Done |
| Rent dues generator + payment recording | ✅ Done |
| Expense Tracker (add, list, categories) | ✅ Done |
| Food Menu / Mess (weekly plan, global/branch) | ✅ Done |
| Activity Logs with diffs | ✅ Done |
| Spotlight Onboarding Tour | ✅ Done |
| Glassmorphism UI + Dark Mode | ✅ Done |
| TypeScript strict compilation | ✅ Done |
| MongoDB seed data (20 students, 34 payments, 4 expenses) | ✅ Done |

---

## 🚀 Phase 1 — Professional Baseline (Priority: IMMEDIATE)

### 1.1 Dashboard Overhaul
- [ ] Install Recharts: `npm install recharts`
- [ ] Occupancy Rate KPI card (occupied / total rooms)
- [ ] Revenue vs. Expenses bar chart (last 6 months)
- [ ] Payment Status donut chart (collected vs. pending)
- [ ] Quick Action shortcuts row
- [ ] Pending Dues widget (students with dues > 0)
- [ ] Upcoming Rent Due alert widget

### 1.2 Student Profile Page `/students/[id]`
- [ ] Full student detail page
- [ ] Payment history timeline
- [ ] Dues status badge
- [ ] Emergency contact display
- [ ] Collect rent shortcut from profile

### 1.3 Finance Enhancements
- [ ] Add `paymentMethod` to Payment model (cash/upi/bank/cheque)
- [ ] PDF invoice/receipt generation (react-pdf or jsPDF)
- [ ] Date range filter on expenses page
- [ ] Expense category pie chart

### 1.4 Data Model & Security Fixes
- [ ] Add `totalRooms` to Branch model (enables occupancy rate)
- [ ] Add bcryptjs — fix plaintext password storage (SECURITY)
- [ ] Add Zod validation to all server actions
- [ ] Add `loading.tsx` and `error.tsx` to all route segments

### 1.5 Settings Page
- [ ] Hostel profile edit (name, address, logo, contact)
- [ ] Notification preferences

---

## 📅 Phase 2 — Operational Power (Priority: HIGH)

### 2.1 Document Management
- [ ] Aadhaar, photo, agreement uploads per student
- [ ] Cloudinary / UploadThing integration
- [ ] Document viewer in student profile
- [ ] KYC verification status

### 2.2 Maintenance Ticketing
- [ ] Complaint model (title, room, status, priority, SLA timer)
- [ ] Student raises ticket → Admin resolves
- [ ] Status workflow with activity logging
- [ ] Admin complaint dashboard

### 2.3 Notifications & Communication
- [ ] Notice Board (hostel-wide or branch-specific announcements)
- [ ] WhatsApp Business API (Twilio) for rent reminders
- [ ] Auto-send payment confirmations
- [ ] Email reports via Resend

### 2.4 Student Portal (MVP)
- [ ] Separate student login
- [ ] View profile, dues, payment history
- [ ] View food menu
- [ ] Raise maintenance complaint
- [ ] View announcements

---

## 💡 Phase 3 — Market Leader Features (Priority: MEDIUM)

### 3.1 Visual Room Management
- [ ] Room model (number, type, floor, capacity, amenities)
- [ ] Interactive color-coded room grid (vacant/occupied/maintenance)
- [ ] Bed-level assignment
- [ ] Drag-and-drop room transfers

### 3.2 Advanced Analytics & Exports
- [ ] Monthly occupancy trend line chart
- [ ] Branch comparison analytics
- [ ] Revenue forecasting
- [ ] CSV/Excel export for all reports
- [ ] Monthly PDF report auto-email

### 3.3 Payment Gateway
- [ ] Razorpay integration for online rent collection
- [ ] Generate & share payment link via WhatsApp
- [ ] Auto-reconcile online payments

### 3.4 Attendance & Leave
- [ ] Student leave application form
- [ ] Admin approval workflow
- [ ] Gate pass QR code generation
- [ ] Visitor log with in/out tracking

---

## 🔮 Future Backlog (Low Priority)

- [ ] **WhatsApp Automations** — Auto-send rent reminders and payment receipts
- [ ] **Smart Room Visualizer** — Interactive hostel floor map
- [ ] **Staff Management** — Warden, guard, cook scheduling
- [ ] **Inventory Tracking** — Furniture, appliances per room
- [ ] **Mess Feedback System** — Per-meal ratings
- [ ] **Multi-language** — Hindi interface
- [ ] **PWA / Mobile App** — Install-to-homescreen
- [ ] **AI Assistant** — Chat to add expenses or query data
- [ ] **SaaS Billing** — Stripe for charging hostel owners
- [ ] **Hinglish Voice Input** (built, disabled) — Re-enable and refine
