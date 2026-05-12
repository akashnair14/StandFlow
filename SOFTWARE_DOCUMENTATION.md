# StandFlow: Strategic Operations Interface

StandFlow is a premium, high-velocity team synchronization platform designed for modern engineering and strategy squads. It transforms standard "daily standups" into a cinematic, high-precision command center experience.

---

## 🚀 Core Technology Stack

- **Frontend**: Next.js (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4, Framer Motion (Animations), Lucide (Icons)
- **Backend/Infrastructure**: Supabase (Auth, PostgreSQL, Storage, Real-time)
- **UI Components**: custom `shadcn/ui` wrappers, Radix UI primitives, Base UI
- **Design Language**: Minimalist Blueprint / Futuristic Command Center

---

## 🏗️ Operational Architecture

### 1. Global Dashboard Layout
The application uses a persistent, high-density layout designed for maximum focus.
- **Side Navigation**: Quick-access protocol links to core hubs (Home, Team, Reports, History).
- **Top Navigation Intelligence**: 
  - **Tactical Search**: Global search for reports and squad members.
  - **Notification Node**: Real-time alerts for blockers and sync updates.
  - **Profile Identity Protocol**: Access to personalized settings and session management.

---

## 📂 Core Hubs & Functionality

### 🛰️ Team Hub (`/team`)
The central nerve center for squad management.
- **View Switcher**:
    - **Directory View**: A high-density, 4-column grid of member "capsules." Each capsule provides immediate role recognition, contact info, and tactical communication shortcuts (Chat/Sync).
    - **Strategic Flow**: A surgical, SVG-based hierarchy map visualizing the team's structure across three tiers: **Executive**, **Strategy**, and **Execution**.
- **Team Analytics**: Real-time monitoring of Squad Health, Participation Frequency, and Leadership Density.
- **Member Management**: Integrated invite system for bringing new tactical units into the hub.

### 📊 Team Overview (`/dashboard`)
The daily command center for operational monitoring.
- **Participation Metrics**: Real-time tracking of team check-ins with percentage-based progress bars.
- **Blocker Management**: High-visibility "Critical Path" section for identifying and resolving team blockers instantly.
- **Missing Reports Node**: Identifies squad members who haven't synchronized for the current daily cycle.
- **Activity Timeline**: A live stream of today's incoming reports.

### 📻 Daily Stream (`/reports`)
The real-time feed of team-wide intelligence.
- **Live Feed**: A chronological stream of all report updates across the organization.
- **Search & Filter**: Precision tools to isolate specific updates, blockers, or team threads.

### 📁 Personal Archive (`/my-reports`)
A dedicated space for individual contribution tracking.
- **Contribution History**: A complete log of every report submitted by the user.
- **Data Export**: Support for exporting tactical history to CSV for external reporting.

---

## ⚡ Premium Functional Systems

### 🌓 Adaptive Dual-Mode System
The entire interface is built with **Theme-Aware Tokens**. 
- **Dark Mode**: A sleek, high-contrast luxury aesthetic for deep-work focus.
- **Light Mode**: A crisp, white-glass blueprint aesthetic for maximum daytime clarity.

### 👤 Profile Identity Protocol
A self-service identity management system accessible from the Top Nav.
- **Visual Identity**: Integrated Supabase Storage upload for profile avatars.
- **Tactical Designation**: Edit your display name and role.
- **Secure Communication**: Management of verified phone numbers with real-time RegEx validation protocols.

### 🛡️ Security & RLS
StandFlow utilizes **Supabase Row Level Security (RLS)** to ensure that team data is only accessible to authorized members, providing enterprise-grade data isolation.

---

## 🛠️ Setup & Development

```bash
# Install dependencies
npm install

# Start the tactical environment
npm run dev

# Build for production
npm run build
```

---
*StandFlow v1.0.0 | High-Velocity Team Synchronization*
