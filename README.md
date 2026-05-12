# StandFlow: Professional Team Command Center

StandFlow is a high-performance web application designed to orchestrate team synchronization, monitor progress, and resolve blockers efficiently in a corporate environment. Built with Next.js and Supabase, StandFlow ensures teams stay aligned through daily updates and real-time dashboards without the noise of traditional project management tools.

## Key Features

- **Workspace Dashboard**: A live feed of team updates, providing a real-time pulse of participation rates, missing updates, and critical blockers. Managers and Team Leads get an instant overview of their team's health.
- **Team Management**: Robust hierarchical structure allowing for Workspace Admins, Team Leads, and Team Members. Real-time status tracking for every team member.
- **Daily Standups (My Reports)**: Simplified daily check-ins where members submit their current focus and blockers. Includes a historical archive of personal updates.
- **Modern & Responsive UI**: Built with a custom "Blueprint" design system focusing on focus and productivity. Fully responsive across desktop, tablet, and mobile devices.

## Application Structure

- `/dashboard`: The main operational hub. Displays live participation rates, active blockers, and a feed of recent updates from team members.
- `/team`: The directory and visual organization chart of your team. Admins can manage members, view individual profiles, and send messages. Features a responsive Grid and Flow view.
- `/reports`: The centralized daily standup stream, showing what every team member is working on. Filterable and searchable.
- `/my-reports`: The personal archive for an individual's past updates. Allows exporting data and submitting new daily standup reports.
- `/login`: Secure authentication powered by Supabase.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS & Shadcn UI (Custom blueprint theme)
- **Database & Auth**: Supabase
- **Icons**: Lucide React
- **Notifications**: Sonner

## Getting Started

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables for Supabase in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the application.

## Design Philosophy

StandFlow utilizes a "Blueprint" aesthetic designed to foster concentration and high alignment. The interface focuses on:
- High contrast and minimal noise
- Emerald Green accents for success and progress
- Clear error signaling using muted Destructive/Red tones
- Fixed spacing and ambient depths for an uncluttered reading experience

---
*Built for high-velocity team synchronization.*
