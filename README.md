# LocalFix — A Local Problem Reporting & Tracking Platform

LocalFix is a full-stack civic web platform where citizens can report local infrastructure and maintenance problems (such as potholes, broken streetlights, overflowing garbage, and water leaks) and track their resolution progress transparently.

---

## Technology Stack

- **Frontend:** React 18, Vite, React Router, Tailwind CSS, Lucide React
- **Backend (Phase 3+):** Java 21, Spring Boot 3, Maven
- **Database (Phase 4+):** MySQL 8
- **ORM & Data Access:** Spring Data JPA with Hibernate
- **API Client:** Axios (Integrated in Phase 6)

---

## Project Structure

```text
LocalFix/
├── frontend/                     # React + Vite application
│   ├── public/                   # Static public assets
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── Navbar.jsx        # Navigation bar with responsive drawer
│   │   │   ├── Footer.jsx        # App footer with links and civic tips
│   │   │   ├── ReportCard.jsx    # Card displaying summary of an issue
│   │   │   ├── StatusBadge.jsx   # Accessible, color-coded status badge
│   │   │   ├── Loading.jsx       # Animated accessible loading indicator
│   │   │   ├── ErrorMessage.jsx  # Alert banner with retry support
│   │   │   └── EmptyState.jsx    # Friendly empty/no-results indicator
│   │   ├── pages/                # Main application views
│   │   │   ├── Home.jsx          # Public landing page with hero & workflow
│   │   │   ├── Reports.jsx       # Browse, search, filter, and sort reports
│   │   │   ├── ReportIssue.jsx   # Form to submit new issue with validation
│   │   │   ├── ReportDetails.jsx # Detailed report view with status timeline
│   │   │   └── Dashboard.jsx     # Dynamic statistics and category breakdown
│   │   ├── context/
│   │   │   └── ReportsContext.jsx# Shared state and localStorage persistence
│   │   ├── data/
│   │   │   └── sampleReports.js  # Sample reports and category/status definitions
│   │   ├── App.jsx               # Route definitions and layout wrapper
│   │   ├── main.jsx              # React DOM entry point
│   │   └── index.css             # Tailwind base & utilities
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── README.md
│
├── backend/                      # Spring Boot backend (Phase 3+)
├── .gitignore                    # Excludes node_modules, target, .env, secrets
└── README.md
```

---

## How to Run the Frontend

1. Ensure **Node.js** (v18+) and **npm** (v9+) are installed.
2. Change into the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser at:
   ```text
   http://localhost:5173
   ```

---

## Current Status: Phase 1 Completed

- [x] Initialized Git repository and root `.gitignore`.
- [x] Scaffolded React + Vite + Tailwind CSS frontend.
- [x] Implemented responsive Navigation and Footer.
- [x] Implemented Homepage with Hero section and 3-step process.
- [x] Implemented Browse Reports with live search, category/status filters, and sorting.
- [x] Implemented accessible Report Submission form with field validation and immediate local updates.
- [x] Implemented Report Details page with 3-stage visual resolution progress tracker.
- [x] Implemented Dashboard dynamically calculating statistics from report state.
- [x] Verified zero-error production build (`npm run build`) and HTTP preview serving.
