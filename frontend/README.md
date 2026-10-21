# LocalFix — Frontend Client (Phase 2)

This is the React frontend application for **LocalFix — A Local Problem Reporting & Tracking Platform**.

---

## 1. Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: v18.0.0 or higher (Tested with `v18.19.1`)
- **npm**: v9.0.0 or higher (Tested with `9.2.0`)

---

## 2. Getting Started

### Step 1: Navigate to the Frontend Directory
```bash
cd frontend
```

### Step 2: Install Dependencies (if not already installed)
```bash
npm install
```

### Step 3: Start the Vite Development Server
```bash
npm run dev
```

### Step 4: Open in Your Browser
Once the dev server starts, open your browser and navigate to:
```text
http://localhost:5173
```

---

## 3. Available Scripts

In the `frontend/` directory, you can run:

- `npm run dev`: Starts the local Vite development server with Hot Module Replacement (HMR).
- `npm run build`: Compiles and bundles production-ready HTML, CSS, and JavaScript into the `dist/` folder.
- `npm run preview`: Runs a local web server serving the built `dist/` output for verification.

---

## 4. Phase 2 Implemented Features

- **Landing Page (`/`)**: Hero section, 3-step reporting workflow, category showcase, and live metric preview.
- **Browse Reports (`/reports`)**: Keyword search, category filter, status filter, location filter, date sorting, and responsive report cards with optional photo thumbnails.
- **Report an Issue (`/report-issue`)**: Accessible form with client-side validation, error messages, optional photo attachment with validation (JPEG/PNG/WebP, max 2MB) and preview, reset option, and immediate mock state update.
- **Report Details (`/reports/:id`)**: Individual report view featuring ticket ID, photo evidence preview, detailed description, metadata, and an interactive 3-stage resolution progress tracker. Handles invalid IDs with a friendly 404 message.
- **Civic Dashboard (`/dashboard`)**: Dynamically computes statistics (Total, Pending, In Progress, Resolved), percentage progress bars, and category breakdown. Includes a "Reset Demo Data" button.
- **Administrator Dashboard (`/admin`)**: Dedicated interface to inspect community reports, search, filter, and change report status (`Pending`, `In Progress`, `Resolved`). Changing status automatically updates the browse page, report details page, and dashboard statistics!

---

## 5. What is Simulated vs. What Comes Next

- **Currently Simulated:** Reports and status changes are stored in client-side memory and synchronized with `localStorage`. No network requests are made.
- **Future Backend Integration (Phases 3 to 7):**
  - **Phase 3 & 4:** Spring Boot backend with Java 21 and MySQL database.
  - **Phase 5 & 6:** REST API endpoints (`GET /api/reports`, `POST /api/reports`, `PATCH /api/reports/:id/status`) connected via Axios.
  - **Phase 7:** Real authentication and role-based access control (Admin vs Citizen) using Spring Security.
