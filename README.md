# BuildFlow 🏗️

> **Construction, Renovation & Property Maintenance Management System**  
> A high-density, minimalist Progressive Web App built with a **"Download Manager"** metaphor for fluid progress tracking, dynamic manpower distribution, and foolproof client quality gates.

---

## 📖 Overview

**BuildFlow** is tailored for site supervisors and operations leads managing high-end estates, commercial offices, and luxury residential projects. Because field workers are restricted from carrying smartphones on-site for VIP privacy, BuildFlow equips supervisors with a lightning-fast, single-pane portal to log progress, reassign crew, run pre-submission compliance checklists, and deliver pristine daily executive reports.

---

## 🔑 Authentication & Login Credentials

On initial launch, BuildFlow displays the supervisor lock screen. BuildFlow provides two distinct sign-in paths designed for operational flexibility:

### 👤 Standard Login (Clean Workspace)
Entering any username and password signs into a **fresh, clean workspace** where all previous records are cleared (`storage.clearAllData()`), ready for production data entry.

| Field    | Value                      |
|----------|----------------------------|
| Username | *(any username)*           |
| Password | *(leave blank or any text)*|

### ⚡ 1-Click Supervisor Demo Login (Pre-Loaded Dataset)
Clicking **"1-Click Supervisor Demo Login"** instantly unlocks BuildFlow pre-hydrated with the complete demonstration dataset: 4 realistic estate projects, 50 Pinoy celebrity workers, quality gates, and properties.

---

### 🔐 Pre-Seeded User Accounts

These accounts are pre-loaded in the **User Accounts** management page (URL: `?tab=users`):

| # | Full Name       | Username     | Password     | Role                  | Department              | Email                         |
|---|----------------|--------------|--------------|-----------------------|-------------------------|-------------------------------|
| 1 | Marcus Vance    | `admin`      | `admin123`   | 🔴 Admin              | Executive Directorate   | admin@buildflow.vip           |
| 2 | Juan Dela Cruz  | `jdelacruz`  | `super456`   | 🟠 Supervisor         | Site Operations         | j.delacruz@buildflow.vip      |
| 3 | Roberto Santos  | `rsantos`    | `lead789`    | 🟡 Lead               | MEP & Structures        | r.santos@buildflow.vip        |
| 4 | Clarissa Tan    | `ctan`       | `vip001`     | 🟣 VIP Representative | Client VIP Liaison      | c.tan@buildflow.vip           |
| 5 | Mateo Reyes     | `mreyes`     | `insp321`    | 🔵 Inspector          | Quality Assurance       | m.reyes@buildflow.vip         |

---

## ✨ Key Features

### 1. 📱 Progressive Web App (PWA) with Custom Install Banner
- **Native App Feel:** Configured with `standalone` display mode, `viewport-fit=cover`, theme colors, and vector maskable icons.
- **Smart Install Prompt:** Non-intrusive bottom banner listening to native `beforeinstallprompt` on Android/Chromium, plus iOS Safari "Add to Home Screen" visual walkthrough.
- **Offline-Ready:** Instant local storage access even when connection drops on-site.

### 2. 📊 Projects Overview Dashboard
- **Download Bar Metaphor:** Each project functions like an active file download with an interactive progress bar (0–100%), current stage note, and real-time status (Active, Paused, Completed, Stale).
- **Position-Locked Scrubbing:** Incremental `-5%` and `+5%` progress adjustments retain exact card row positions without unwanted jumping or list reordering.
- **Multi-Line Stage Text:** Stage notes wrap naturally without horizontal truncation, ensuring lengthy field updates remain 100% legible on small mobile screens.
- **Mobile Responsive KPI Grid:** Telemetry stat cards collapse into a clean 2-column mobile grid.
- **Instant Search & Filter Pills:** Full-text filter across title, stage, zone, and estate.

### 3. 🛡️ Universal Custom Modal Dialogs (Zero Native Browser Alerts)
- **100% Custom Alerts & Confirms:** Replaced every browser `window.alert()` and `window.confirm()` popup with themed, glassmorphic modal dialogs (`showConfirm` / `showAlert`).
- **Semantic Variants:** Tailored color styling and Lucide icons for `danger`, `warning`, `info`, and `success`.
- **Keyboard Accessible:** Supports `Enter` to confirm, `Esc` to dismiss, and autofocus.

### 4. 📋 Projects Manager (Data Table Hub)
- Full-featured data table view (`?tab=projects_table`) with sortable columns, inline status toggles, milestone editing, and 1-click links to quality checklists and inspector drawers.
- **Direct Row Deletion:** Dedicated trash icon in the Actions column for rapid project removal, guarded by a custom confirmation dialog.

### 5. 👥 Crew Allocator & Manpower Board
- Fluid manpower redistribution with bench capacity telemetry showing deployed vs. available crew.
- Quick reassignment drawer for instant staff shifts without heavy drag-and-drop complexity.

### 6. 👤 Team Roster & Workers (50 Celebrity Seeds + Pagination)
- Pre-seeded with 50 iconic Filipino celebrities with portrait avatars.
- 25-per-page pagination with Prev/Next buttons and page pills.
- Bulk Import modal for multi-line paste (`Full Name, Trade`).

### 7. 🛡️ Pre-Flight Quality Gate Checklists
- Mandatory 7-point compliance gate before locking client proposals (materials in stock, manpower, timeline, multiple options, design pegs, physical samples, pros/cons matrix).

### 8. ⚠️ Stale Project & Proposal Radar
- Flags projects untouched for >24 hours or proposals awaiting feedback for >48 hours.
- 1-click follow-up draft messages ready to copy and send to VIP clients.

### 9. 📑 Executive Daily Operations Summary
- Clean, printable daily digest summarizing all project milestones and manpower distributions.

### 10. 👤 User Accounts & Identity
- Navbar identity chip displaying active user avatar and full name.
- Lock & Sign Out action positioned conveniently alongside Settings.
- Full CRUD for user accounts with roles, avatars, contact info, and department tiers.

### 11. 📸 System Snapshots & Vault Tools
- Create named point-in-time backups of the entire database.
- One-click restore to any previous snapshot.
- End-to-End Encryption (E2EE) headers with `.bfvault` encrypted exports and plain JSON export/import.

### 12. 📱 Fully Responsive Mobile Navigation
- **Single-Row Top Header:** Mobile navbar strictly prevents multi-line wrapping and eliminates overlap with telemetry labels.
- **Bottom Navigation Bar:** 4 core mobile tabs: Home, Manager, Reports, and More.
- **Tools Bottom Sheet:** 2-column card grid with squircle icons for all administrative views.

### 13. 🌓 Dual Theme Modes
- **Obsidian VIP Dark (Default):** Deep slate `#0e1217` surfaces optimized for high-contrast field viewing.
- **Warm Notion Light:** Clean, high-contrast monochrome paper aesthetic.

---

## 🛠️ Technology Stack

| Layer        | Technology                                    |
|--------------|-----------------------------------------------|
| Framework    | React 19 + TypeScript (Strict Mode)           |
| Build Tool   | Vite 6 (Zero-error `tsc -b && vite build`)    |
| PWA Engine   | Web App Manifest, Standalone Meta, Custom PWA Banner |
| Styling      | Vanilla CSS Design System (Zero Tailwind)     |
| Dialogs      | Custom Global Modal System (`ConfirmDialog`)  |
| Icons        | Lucide React                                  |
| Storage      | LocalStorage with E2EE encryption headers     |
| Color Engine | Semantic `getIconColorForText()` utility      |

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
├── public/
│   ├── icon.svg                                # Vector PWA app icon (maskable & standard)
│   └── manifest.json                           # Web App Manifest (PWA standalone config)
├── index.html                                  # Entry HTML & PWA viewport-fit metadata
├── package.json                                # Project dependencies & scripts
├── vite.config.ts                              # Vite build configuration
├── tsconfig.json                               # TypeScript compiler options (Strict Mode)
├── PROJECT_BLUEPRINT.md                        # Complete system specification
├── README.md                                   # Project overview & running instructions
│
└── src/
    ├── main.tsx                                # React entry point
    ├── App.tsx                                 # Root container, URL routing & global dialogs
    ├── index.css                               # Complete Design System & responsive styles
    ├── types/
    │   └── index.ts                            # TypeScript domain models & interfaces
    ├── services/
    │   └── storage.ts                          # E2EE storage service & 50 celebrity seeds
    ├── utils/
    │   ├── time.ts                             # Relative timestamps & stale radar algorithms
    │   └── colors.ts                           # getIconColorForText() semantic color engine
    └── components/
        ├── Navbar.tsx                          # Top header, mobile bottom nav & tools sheet
        ├── Auth/
        │   ├── AdminLoginView.tsx              # Supervisor login portal
        │   └── LogoutConfirmModal.tsx          # Custom lock & sign out confirmation modal
        ├── Common/
        │   ├── ConfirmDialog.tsx               # Global custom modal dialog (showAlert/showConfirm)
        │   └── PwaInstallPrompt.tsx            # Custom PWA installation banner & iOS guide
        ├── DownloadQueue/
        │   ├── ProjectList.tsx                 # Projects Overview dashboard (KPI + queue)
        │   └── ProjectRow.tsx                  # Individual progress bar project card (multi-line wrap)
        ├── Management/
        │   ├── ProjectsManagementView.tsx      # Table manager with row deletion & filters
        │   ├── RosterView.tsx                  # 50 Pinoy celebrity roster with pagination
        │   ├── PropertiesView.tsx              # Estates and buildings hub
        │   ├── ZonesManagementView.tsx         # Work areas and specific zones
        │   ├── CategoriesManagementView.tsx    # Project categories
        │   ├── PrioritiesManagementView.tsx    # Priority tiers
        │   ├── TradesManagementView.tsx        # Trade specialties
        │   ├── QualityGateManagementView.tsx   # Pre-flight checklist rules
        │   ├── UsersManagementView.tsx         # User CRUD with roles & avatars
        │   └── SnapshotsView.tsx               # System snapshots & point-in-time restore
        ├── Manpower/
        │   ├── ManpowerBoardView.tsx           # Crew allocation grid
        │   └── ReassignmentDrawer.tsx          # Quick worker shifting drawer
        ├── Checklists/
        │   └── PreFlightChecklistModal.tsx     # Mandatory 7-point quality gate
        ├── Proposals/
        │   └── ProposalOptionsModal.tsx        # Comparative options builder
        ├── Alerts/
        │   ├── StaleRadarModal.tsx             # Stalled project detector & draft sender
        │   └── VaultSecurityModal.tsx          # E2EE protocol status viewer
        ├── Reports/
        │   └── ExecutiveDailyDigestModal.tsx   # Printable daily executive summary
        └── ProjectDetails/
            └── ProjectInspectorDrawer.tsx      # Detailed project inspector drawer
```

---

## 🌐 GitHub & Deployment

- **Repository:** [https://github.com/felixparejapmdit/BuildFlow.git](https://github.com/felixparejapmdit/BuildFlow.git)
- **Deployment Platform:** Vercel CI/CD (automatic builds triggered on push to `main`).
- **Production Build Check:** Strict `npm run build` (`tsc -b && vite build`) with zero lint or compiler errors.

---

## 📄 License
Internal proprietary software for VIP construction and estate operations. All rights reserved.
