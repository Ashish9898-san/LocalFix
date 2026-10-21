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
│   │   │   ├── Navbar.jsx        # Navigation bar with responsive drawer and Admin link
│   │   │   ├── Footer.jsx        # App footer with links and civic tips
│   │   │   ├── ReportCard.jsx    # Card displaying summary of an issue with image support
│   │   │   ├── SearchFilters.jsx # Reusable search, filter, and sorting toolbar
│   │   │   ├── StatusBadge.jsx   # Accessible, color-coded status badge
│   │   │   ├── Loading.jsx       # Animated accessible loading indicator
│   │   │   ├── ErrorMessage.jsx  # Alert banner with retry support
│   │   │   └── EmptyState.jsx    # Friendly empty/no-results indicator
│   │   ├── pages/                # Main application views
│   │   │   ├── Home.jsx          # Public landing page with hero & workflow
│   │   │   ├── Reports.jsx       # Browse, search, filter, and sort reports
│   │   │   ├── ReportIssue.jsx   # Form to submit issue with validation & photo attachment
│   │   │   ├── ReportDetails.jsx # Detailed report view with photo and status timeline
│   │   │   ├── Dashboard.jsx     # Dynamic statistics, category & status breakdown
│   │   │   └── AdminDashboard.jsx# Admin report management & status update simulation
│   │   ├── context/
│   │   │   └── ReportsContext.jsx# Shared state, status updater, and localStorage persistence
│   │   ├── data/
│   │   │   └── sampleReports.js  # Sample reports with categories, statuses, and photo links
│   │   ├── utils/
│   │   │   └── reportUtils.js    # Date formatting, image validation, and filter/sort logic
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

## How to Run the Frontend Locally

1. Ensure **Node.js** (v18+) and **npm** (v9+) are installed.
2. Change into the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies (if not already done):
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

## Progress Checklist

- [x] **Phase 0:** Environment inspection, architecture, and planning.
- [x] **Phase 1:** Initial frontend scaffolding, layout, and mock structure.
- [x] **Phase 2:** Complete frontend reporting interface (Search, Filters, Photo Upload preview, Report Details, Dynamic Dashboard, Admin Panel).
- [ ] **Phase 3:** Spring Boot Foundation (Java 21, Maven, health endpoint).
- [ ] **Phase 4:** MySQL Database Integration (JPA Entities & Repository).
- [ ] **Phase 5:** REST API Development (Report CRUD, Search & Filtering endpoints).
- [ ] **Phase 6:** Frontend and Backend Integration (Axios client, live API integration).
- [ ] **Phase 7:** Spring Security & Role-Based Authorization.
- [ ] **Phase 8:** Final Testing, Error Handling, and Deployment Documentation.
