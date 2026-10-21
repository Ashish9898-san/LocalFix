# LocalFix — Frontend Client (Phase 1)

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

## 4. Current Phase 1 Features (Sample & Local State)

- **Landing Page (`/`)**: Hero section, 3-step reporting workflow, category showcase, and live metric preview.
- **Browse Reports (`/reports`)**: Keyword search, category filter, status filter, sorting, and responsive report cards.
- **Report an Issue (`/report-issue`)**: Accessible form with client-side validation, error messages, and immediate local state updates with `localStorage` persistence.
- **Report Details (`/reports/:id`)**: Individual report view featuring ticket ID, detailed description, metadata, and an interactive 3-stage resolution progress tracker. Handles invalid IDs with a friendly 404 message.
- **Civic Dashboard (`/dashboard`)**: Dynamically computes counts (Total, Pending, In Progress, Resolved), percentage progress bars, and category breakdown. Includes a "Reset Demo Data" button.

---

## 5. What is Simulated vs. What Comes Next

- **Currently Simulated:** Reports are stored in browser memory and synchronized with `localStorage`. No network requests are made.
- **Future Phase 6 Integration:** In Phase 6, React will use Axios to make HTTP requests to the Spring Boot REST API (`http://localhost:8080/api/reports`), which will query and persist data in MySQL.
