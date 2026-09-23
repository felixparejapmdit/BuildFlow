# BuildFlow 🏗️

> **Construction, Renovation & Property Maintenance Management System**  
> A high-density, minimalist Progressive Web App built with a **"Download Manager"** metaphor for fluid progress tracking, dynamic manpower distribution, and foolproof client quality gates.

---

## 📖 Overview

**BuildFlow** is tailored for site supervisors and operations leads managing high-end estates, commercial offices, and luxury residential projects. Because field workers are restricted from carrying smartphones on-site for VIP privacy, BuildFlow equips supervisors with a lightning-fast, single-pane portal to log progress, reassign crew, run pre-submission compliance checklists, and deliver pristine daily executive reports.

---

## 🔑 Authentication & Login Credentials

On initial launch, BuildFlow displays the supervisor lock screen. Use any of the credentials below to sign in.

### 👤 Default Login (Quick Access)

| Field    | Value                      |
|----------|----------------------------|
| Username | *(any text)*               |
| Password | *(leave blank or any text)*|

> **Tip:** Just click **"1-Click Supervisor Demo Login"** on the login screen for instant access — no credentials required.

---

### 🔐 Pre-Seeded User Accounts

These accounts are pre-loaded into the **User Accounts** management page (URL: `?tab=users`):

| # | Full Name       | Username     | Password     | Role                  | Department              | Email                         |
|---|----------------|--------------|--------------|-----------------------|-------------------------|-------------------------------|
| 1 | Marcus Vance    | `admin`      | `admin123`   | 🔴 Admin              | Executive Directorate   | admin@buildflow.vip           |
| 2 | Juan Dela Cruz  | `jdelacruz`  | `super456`   | 🟠 Supervisor         | Site Operations         | j.delacruz@buildflow.vip      |
| 3 | Roberto Santos  | `rsantos`    | `lead789`    | 🟡 Lead               | MEP & Structures        | r.santos@buildflow.vip        |
| 4 | Clarissa Tan    | `ctan`       | `vip001`     | 🟣 VIP Representative | Client VIP Liaison      | c.tan@buildflow.vip           |
| 5 | Mateo Reyes     | `mreyes`     | `insp321`    | 🔵 Inspector          | Quality Assurance       | m.reyes@buildflow.vip         |

> **Note:** BuildFlow currently uses a single shared supervisor session. The User Accounts page is for managing and documenting who has access — full per-user authentication can be layered on top in a backend integration phase.

---

## ✨ Key Features

### 1. 📊 Projects Overview Dashboard *(Redesigned)*
- **KPI Stat Cards:** Live telemetry tiles for Total Projects, Active, Completed, and Stale counts.
- **Download Bar Metaphor:** Each project functions like an active file download with an interactive progress bar (0–100%), current stage note, and real-time status (Active, Paused, Completed, Stale).
- **Rapid Scrubbing:** Increment or decrement progress (+5%, +10%, slider) in under 15 seconds.
- **Dynamic Hierarchy:** Tagged by Estate, Building, and Specific Work Area.
- **Filter Pills + Search:** Instant full-text search across title, stage, zone, and property.

### 2. 📋 Projects Manager (Table Grid)
- Full CRUD table with inline status toggles, milestone editing, and 1-click access to crew, checklists, and inspector drawers.

### 3. 👥 Crew Allocator
- Fluid manpower redistribution with bench capacity telemetry showing deployed vs. available crew.

### 4. 👤 Team Roster & Workers (Pinoy Celebrity Seed & Pagination)
- Pre-seeded with 50 iconic Filipino celebrities.
- 25-per-page pagination with Prev/Next buttons and page pills.
- Bulk Import modal for multi-line paste (Full Name, Trade).

### 5. 🛡️ Pre-Flight Quality Gate Checklists
- Mandatory 7-point compliance gate before locking client proposals.

### 6. ⚠️ Stale Project & Proposal Radar
- Flags projects untouched for >24 hours or proposals awaiting feedback for >48 hours.
- 1-click follow-up draft messages ready to copy.

### 7. 📑 Executive Daily Operations Summary
- Clean, printable daily digest summarizing all project milestones and manpower distributions.

### 8. 👤 User Accounts Management
- Full CRUD for user accounts with roles, avatars, contact info, and department.
- Role Tiers: Admin, Supervisor, Lead, VIP Representative, Inspector.

### 9. 📸 System Snapshots
- Create named point-in-time backups of the entire database.
- One-click restore to any previous snapshot.
- Record summaries show counts of projects, workers, estates, and users.

### 10. 📱 Responsive Mobile Navigation
- Fixed Bottom Tab Bar with 4 primary tabs on mobile: Home, Manager, Reports, More.
- Tools Bottom Sheet: 2-column card grid with semantically colored squircle icons.

### 11. 🌓 Dual Theme Modes
- **Obsidian VIP Dark (Default):** Deep dark palette for low-light environments.
- **Warm Notion Light:** Clean, high-contrast monochrome aesthetic.

### 12. 🔐 End-to-End Encryption (E2EE) & Database Tools
- All records stored locally with encryption headers.
- Database Utilities: Encrypted Backup (.bfvault), Plain JSON Export, Restore, Merge Import, and Sample Data Reset.

### 13. 🔗 URL-Parameter Routing
- Every tab syncs to a `?tab=xxx` URL parameter so F5 / page refresh retains your active view.
- Browser back/forward navigation works seamlessly.

---

## 🛠️ Technology Stack

| Layer        | Technology                                    |
|--------------|-----------------------------------------------|
| Framework    | React 19 + TypeScript                         |
| Build Tool   | Vite 6                                        |
| Styling      | Vanilla CSS Design System (Zero Tailwind)     |
| Icons        | Lucide React                                  |
| Storage      | LocalStorage with E2EE encryption headers     |
| Color Engine | getIconColorForText() semantic color utility  |

---

## 🚀 Getting Started & How to Run

### Prerequisites
- Node.js **18.0.0 or higher**
- npm **9.0.0 or higher**

### Installation

```bash
cd d:/PROJECTS/BuildFlow
npm install
```

### Running Locally (Development Mode)

```bash
npm run dev
```

Open your browser at: `http://localhost:5173/`

### Building for Production

```bash
npm run build
```

### Previewing the Production Build

```bash
npm run preview
```

---

## 🗂️ URL Navigation Reference

| Page                  | URL                                                   |
|-----------------------|-------------------------------------------------------|
| Projects Overview     | `http://localhost:5173/`                              |
| Projects Table        | `http://localhost:5173/?tab=projects_table`           |
| Crew Allocator        | `http://localhost:5173/?tab=manpower`                 |
| Team Roster           | `http://localhost:5173/?tab=roster`                   |
| Properties & Sites    | `http://localhost:5173/?tab=properties`               |
| Specific Zones        | `http://localhost:5173/?tab=zones`                    |
| Project Categories    | `http://localhost:5173/?tab=categories`               |
| Priority Levels       | `http://localhost:5173/?tab=priorities`               |
| Trade Specialties     | `http://localhost:5173/?tab=trades`                   |
| Approval Rules        | `http://localhost:5173/?tab=quality_gates`            |
| User Accounts         | `http://localhost:5173/?tab=users`                    |
| System Snapshots      | `http://localhost:5173/?tab=snapshots`                |

---

## 📂 Project Architecture

```
BuildFlow/
├── index.html                              # Entry HTML & PWA metadata
├── package.json                            # Project dependencies & scripts
├── vite.config.ts                          # Vite build configuration
├── tsconfig.json                           # TypeScript compiler options
├── PROJECT_BLUEPRINT.md                    # Complete system specification
├── README.md                               # Project overview & running instructions
│
└── src/
    ├── main.tsx                            # React entry point
    ├── App.tsx                             # Root container, URL routing & global state
    ├── index.css                           # Complete Design System & responsive styles
    ├── types/
    │   └── index.ts                        # TypeScript domain models & interfaces
    ├── services/
    │   └── storage.ts                      # E2EE storage service & 50 celebrity seeds
    ├── utils/
    │   ├── time.ts                         # Relative timestamps & stale radar algorithms
    │   └── colors.ts                       # getIconColorForText() semantic color engine
    └── components/
        ├── Navbar.tsx                      # Top header, mobile bottom nav & tools sheet
        ├── Auth/
        │   ├── AdminLoginView.tsx          # Supervisor login portal
        │   └── LogoutConfirmModal.tsx      # Custom lock & sign out confirmation modal
        ├── DownloadQueue/
        │   ├── ProjectList.tsx             # Projects Overview dashboard (KPI + queue)
        │   └── ProjectRow.tsx              # Individual progress bar project card
        ├── Management/
        │   ├── ProjectsManagementView.tsx  # Table manager for projects
        │   ├── RosterView.tsx              # 50 Pinoy celebrity roster with pagination
        │   ├── PropertiesView.tsx          # Estates and buildings hub
        │   ├── ZonesManagementView.tsx     # Work areas and specific zones
        │   ├── CategoriesManagementView.tsx# Project categories
        │   ├── PrioritiesManagementView.tsx# Priority tiers
        │   ├── TradesManagementView.tsx    # Trade specialties
        │   ├── QualityGateManagementView.tsx # Pre-flight checklist rules
        │   ├── UsersManagementView.tsx     # User CRUD with roles & avatars
        │   └── SnapshotsView.tsx           # System snapshots & point-in-time restore
        ├── Manpower/
        │   ├── ManpowerBoardView.tsx       # Crew allocation grid
        │   └── ReassignmentDrawer.tsx      # Quick worker shifting drawer
        ├── Checklists/
        │   └── PreFlightChecklistModal.tsx # Mandatory 7-point quality gate
        ├── Proposals/
        │   └── ProposalOptionsModal.tsx    # Comparative options builder
        ├── Alerts/
        │   ├── StaleRadarModal.tsx         # Stalled project detector & draft sender
        │   └── VaultSecurityModal.tsx      # E2EE protocol status viewer
        ├── Reports/
        │   └── ExecutiveDailyDigestModal.tsx # Printable daily executive summary
        └── ProjectDetails/
            └── ProjectInspectorDrawer.tsx  # Detailed project inspector drawer
```

---

## 📄 License
Internal proprietary software for VIP construction and estate operations. All rights reserved.
