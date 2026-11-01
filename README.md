# LocalFix — A Local Problem Reporting & Tracking Platform

LocalFix is a full-stack civic web platform where citizens can report local infrastructure and maintenance problems (such as potholes, broken streetlights, overflowing garbage, and water leaks) and track their resolution progress transparently.

---

## Technology Stack

- **Frontend:** React 18, Vite, React Router, Tailwind CSS, Lucide React
- **Backend:** Java 21, Spring Boot 3.3.4, Maven
- **Security & Auth (Phase 9.5):** Spring Security 6.3, JJWT (HMAC-SHA256), BCrypt Password Hashing
- **Database (Phase 4+):** MySQL 8
- **ORM & Data Access (Phase 4+):** Spring Data JPA with Hibernate
- **HTTP Client (Phase 6+):** Axios (with Bearer Token Request Interceptors)

---

## Project Structure

```text
LocalFix/
├── frontend/                     # React + Vite application
│   ├── public/                   # Static public assets
│   ├── src/
│   │   ├── components/           # Reusable UI components (Navbar, ReportCard, SearchFilters, etc.)
│   │   ├── pages/                # Pages (Home, Reports, ReportIssue, ReportDetails, Dashboard, AdminDashboard)
│   │   ├── context/              # ReportsContext state manager & localStorage sync
│   │   ├── data/                 # Sample mock reports
│   │   ├── utils/                # Date formatters, image validators, filter/sort logic
│   │   ├── App.jsx               # Application routes
│   │   ├── main.jsx              # React DOM entry
│   │   └── index.css             # Tailwind base & utilities
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # Spring Boot + Maven application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/localfix/
│   │   │   │   ├── LocalFixApplication.java # Spring Boot application entry point
│   │   │   │   ├── controller/              # REST Controllers (HealthController, ReportController)
│   │   │   │   ├── dto/                     # Data Transfer Objects (Create, Update, Response, Health)
│   │   │   │   ├── entity/                  # JPA Entities & Enums (Report, DatabaseCheck, Enums)
│   │   │   │   ├── exception/               # GlobalExceptionHandler, ErrorResponse, Custom Exceptions
│   │   │   │   ├── repository/              # Spring Data JPA Repositories (ReportRepository, DatabaseCheckRepository)
│   │   │   │   └── service/                 # Transactional Business Services (ReportService)
│   │   │   └── resources/
│   │   │       ├── application.properties   # Backend application configuration
│   │   │       └── application-local.properties.example # Template for local credentials
│   │   └── test/
│   │       └── java/com/localfix/
│   │           ├── LocalFixApplicationTests.java # Context load and JPA integration tests
│   │           ├── controller/              # WebMvcTest slice tests (HealthControllerTest, ReportControllerTest)
│   │           └── service/                 # Mockito unit tests (ReportServiceTest)
│   ├── LocalFix_Phase5_Postman_Collection.json # Importable Postman API test collection
│   ├── pom.xml                   # Maven dependencies and build definition
│   └── .gitignore
│
├── .gitignore                    # Root ignore for node_modules, target, .env, secrets
└── README.md
```

---

## How to Run the Applications Locally

### 1. Frontend (React + Vite)
```bash
cd frontend
npm install   # If not already installed
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 2. Backend (Spring Boot + Java 21)
```bash
cd backend
mvn spring-boot:run
```
Alternatively, run the packaged JAR directly:
```bash
java -jar target/localfix-backend-0.0.1-SNAPSHOT.jar
```
The server starts on port **`8080`**. Test the endpoints:
```bash
# Health checks
curl -i http://localhost:8080/api/health
curl -i http://localhost:8080/api/health/db

# Create a report (Phase 5)
curl -i -X POST http://localhost:8080/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Large pothole on 5th Avenue",
    "description": "Hazardous road pothole damaging vehicles in right lane.",
    "category": "ROADS",
    "severity": "HIGH",
    "location": "5th Ave & Market St"
  }'

# List all public reports
curl -s http://localhost:8080/api/reports

# Register a new citizen account
curl -i -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Citizen","email":"jane@example.com","password":"Password123!"}'

# Log in as administrator or citizen
curl -i -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@localfix.org","password":"Admin@LocalFix2026"}'
```

### 3. Run Backend Automated Tests
```bash
cd backend
mvn test -Dtest=FileStorageServiceTest,ReportControllerTest,ReportServiceTest,HealthControllerTest,JwtServiceTest,AuthServiceTest,AuthControllerTest
```

---

## Progress Checklist

- [x] **Phase 0:** Environment inspection, architecture, and planning.
- [x] **Phase 1:** Initial frontend scaffolding, layout, and mock structure.
- [x] **Phase 2:** Complete frontend reporting interface (Search, Filters, Photo Upload preview, Report Details, Dynamic Dashboard, Admin Panel).
- [x] **Phase 3:** Spring Boot Foundation (Java 21, Maven, Spring Boot 3.3.4, Health REST controller, MockMvc tests).
- [x] **Phase 4:** MySQL Database Integration (JPA Entities & Repository).
- [x] **Phase 5:** REST API Development (Report CRUD, Search & Filtering endpoints, validation, error handling, 22 passing tests).
- [x] **Phase 6:** Frontend and Backend Integration (Axios client, live API integration).
- [x] **Phase 7:** Admin Report Management & Status Workflow.
- [x] **Phase 8:** Report Image Uploads & Management (Multipart file upload, local filesystem storage, MIME validation).
- [x] **Phase 9.5:** Authentication, User Accounts, and Role-Based Access Control (Spring Security, JWT HMAC-SHA256, BCrypt, Citizen Accounts, Seed Administrator, Protected Routes).
