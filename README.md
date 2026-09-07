# 🌐 Avyukt Utthan Sanstha — Public Website & Beneficiary Portals

[![React](https://img.shields.io/badge/React-v19-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v6-purple.svg)](https://vitejs.dev/)
[![React Router](https://img.shields.io/badge/React_Router-v7-red.svg)](https://reactrouter.com/)
[![License](https://img.shields.io/badge/License-Proprietary-gold.svg)]()

Modern, high-performance, and 100% mobile-responsive web portal for **Avyukt Utthan Sanstha (अव्युक्त उत्थान संस्था)**, providing public outreach, digital classroom portals, student assignments, event registration, and royal certificate downloads.

---

## 🎨 Visual Identity & Brand Design
The portal is styled using the official Avyukt Utthan Sanstha color palette:
- **Primary:** Royal Deep Forest Emerald (`#173d35`, `#0d2822`)
- **Accent:** Warm Amber Gold (`#e8b35a`)
- **Background:** Warm Ivory Parchment (`#fbfaf5`)
- **Typography:** Classical Georgia Serif for headings & clean sans-serif for body.

---

## ✨ Features & Portals

### 1. 🏠 Public Outreach & Landing Page
- **Hero & Mission:** Impactful introduction with grassroots mission statement.
- **Dynamic Impact Counters CMS:** Live counts for Batches, Students, Mentors, and Ground Campaigns updated dynamically from the backend.
- **Programs & Initiatives:** Detailed showcase of educational and environmental initiatives.
- **News, Events & Testimonials:** Real-time updates, event registrations, and direct WhatsApp sharing.

### 2. 🔐 Multi-Role Beneficiary Dashboards
- **Student Dashboard:** Batch class timetable, homework submissions, attendance record, and separated tabs for Syllabus Classes vs. Public NGO Events.
- **Guest Dashboard:** High-profile guest pass system, batch-centric folder groupings (e.g., `BATCH 3`) with drill-down views, institutional webinars, and VIP session links.
- **Mentor Dashboard:** Scheduled teaching sessions, attendance marking, student feedback, and Jitsi Meet host controls.
- **Volunteer Dashboard:** Ground campaign coordination, attendance, and certificates.

### 3. 🎬 Universal In-App Video Player (`VideoPlayerModal.jsx`)
- Plays both **YouTube (Unlisted HD)** and **Google Drive (7-Day Active Buffer)** recordings directly inside the application without external redirection.
- Dynamic source badges and clean full-screen controls.

### 4. 📜 24K Gold Jharkhand Heritage Certificate System
- High-resolution digital certificates featuring authentic Jharkhand cultural motifs (Palash, Koel, Sal Tree, Sohrai Elephant, Royal Tiger, Nagada/Mandar, Karam & Jhumar Dancers).
- 1-click **300 DPI A4 PDF Download** via `html2canvas` and `jsPDF`.
- Official circular NGO rubber stamp with `"पढ़ेगा गाँव बढ़ेगा देश"`.

---

## 🛠️ Tech Stack

- **Framework:** React 19 (SPA)
- **Bundler / Build Tool:** Vite
- **Routing:** React Router v7
- **HTTP Client:** Axios with centralized dynamic API configuration
- **Document Rendering:** `html2canvas` & `jspdf`
- **Video & Meetings:** Embedded Jitsi Meet Web API

---

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher)
- Backend API running locally or hosted on cloud (e.g. Render)

---

## ⚙️ Installation & Development Setup

1. **Navigate to website directory:**
   ```bash
   cd ngo-website-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the example environment configuration:
   ```bash
   cp .env.example .env
   ```
   Configure `.env` as required:
   ```env
   VITE_API_URL=http://localhost:5001/api
   VITE_BACKEND_URL=http://localhost:5001
   VITE_ADMIN_URL=http://localhost:5174
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

5. **Build for Production:**
   ```bash
   npm run build
   ```
   Production-ready bundle will be generated in `dist/`.

6. **Preview Production Build:**
   ```bash
   npm run preview
   ```

---

## 🚢 Production Deployment (Vercel / Netlify)

### Deploying on Vercel:
1. Push this repository to your GitHub account.
2. In Vercel, click **"Add New Project"** and import `ngo-website-frontend`.
3. Set **Framework Preset:** `Vite`
4. Set **Build Command:** `npm run build`
5. Set **Output Directory:** `dist`
6. Add Environment Variables:
   - `VITE_API_URL` = `https://your-backend-domain.com/api`
   - `VITE_BACKEND_URL` = `https://your-backend-domain.com`
   - `VITE_ADMIN_URL` = `https://admin.your-domain.com`
7. Click **Deploy**.

---

## 📱 Mobile Responsiveness Checklist
- Global `html, body { overflow-x: hidden; max-width: 100%; }` prevents layout shift on mobile screens (360px - 414px).
- All interactive controls have minimum 44px+ touch targets.
- Client-side navigation via `<Link>` prevents full-page reloads and white screen flicker.
