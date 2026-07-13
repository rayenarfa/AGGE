# AGGE Website Platform - Project & Codebase Analysis

This document provides a comprehensive analysis of the current state of the **AGGE Website Platform** codebase. It outlines the folder structure, component breakdowns, routes, database schemas, mock data, and verifies the clean removal of Docker-related dependencies.

---

## 1. Directory Structure

The project is structured as a monorepo containing a React + Vite frontend (`client/`) and a Node.js + Express backend (`server/`). Below is the complete layout of all key directories and files:

```text
agge/
├── client/                      # React + Vite Frontend (localhost:5173)
│   ├── .env                     # Local environment variables
│   ├── .env.example             # Example environment variables template
│   ├── index.html               # Main HTML entrypoint
│   ├── package.json             # Frontend dependencies & npm scripts
│   ├── vite.config.js           # Vite build & plugin configuration
│   └── src/
│       ├── main.jsx             # React entrypoint
│       ├── App.jsx              # Root component (renders RouterProvider)
│       ├── App.css              # Global styles
│       ├── index.css            # Tailwind CSS v4 import & custom styles
│       ├── assets/              # Static media assets (e.g., logo, hero image)
│       ├── components/          # Reusable React components
│       │   ├── layout/          # Layout-level components (Header, Footer)
│       │   └── ui/              # Reusable UI cards & banners
│       ├── data/                # Mock datasets & navigation schemas
│       ├── hooks/               # Custom React hooks (e.g., health check)
│       ├── layouts/             # Layout wrappers (MainLayout)
│       ├── pages/               # Page components grouped by sitemap category
│       ├── routes/              # Client-side router configuration (React Router)
│       ├── services/            # Axios API client setup
│       └── utils/               # Client utility helpers (currently placeholder)
│
├── server/                      # Express.js Backend (localhost:3000)
│   ├── .env                     # Local database & server configurations
│   ├── .env.example             # Backend configuration template
│   ├── package.json             # Backend dependencies & scripts
│   ├── prisma/
│   │   └── schema.prisma        # Prisma schema definition (PostgreSQL datasource)
│   └── src/
│       ├── index.js             # API entrypoint & database connection
│       ├── controllers/         # Request handling logic
│       ├── middleware/          # Express middlewares (placeholders)
│       ├── prisma/              # Prisma client instantiation
│       ├── routes/              # Express endpoint routing
│       ├── services/            # Business logic / DB wrappers (placeholders)
│       ├── utils/               # Server utility helpers (placeholders)
│       └── validators/          # Zod validation schemas (placeholders)
│
├── docs/                        # Project documentation
│   ├── reference-analysis.md    # EAGE reference sitemap analysis (already existing)
│   └── project-analysis.md      # This file
│
└── eage.org-crawled/            # Crawled markdown content of the EAGE reference site
```

---

## 2. Client Application (Frontend)

The frontend is a lightweight Single Page Application (SPA) built using **React 19**, styled with **Tailwind CSS v4**, and routed using **React Router v7**.

### 2.1 Configuration & Dependencies (`client/package.json`)
* **Vite (`^8.1.1`)**: Used as the bundler.
* **Tailwind CSS (`^4.3.2`)**: The styling engine utilizes Tailwind v4 via `@tailwindcss/vite` plugin.
* **React Router Dom (`^7.18.1`)**: Manages client-side routing.
* **Axios (`^1.18.1`)**: Handles API communications with the Express backend.
* **Oxlint (`^1.71.0`)**: Configured for high-speed JS/JSX linting.

### 2.2 Navigation & Mock Data (`client/src/data/`)
* [navigation.js](file:///home/rayen/Projects/AGGE/client/src/data/navigation.js): Defines the navigation schemas for the header, footer, and category sub-nav menus (About, Membership, Events, Education, Communities, News, Media, Services, Contact).
* [mockContent.js](file:///home/rayen/Projects/AGGE/client/src/data/mockContent.js): Contains extensive placeholder data extracted from the EAGE crawl files. This includes:
  * Featured events (e.g. Near Surface Geoscience Conference 2026, Hannover Energy Transition)
  * News articles (e.g. "Shaking on the Moon", "Power Up with 360° Benefits")
  * Professional communities & SIGs (Geophysics, CCS, Young Professionals, etc.)
  * Education courses (e.g. Seismic interpretation, Geothermal exploration)
  * Academic journals (Petroleum Geoscience, Basin Research, etc.)

### 2.3 Key UI Components (`client/src/components/` & `client/src/layouts/`)
* **MainLayout (`layouts/MainLayout.jsx`)**: Implements the base layout shell, rendering the `Header`, `Footer`, and an `Outlet` for child page components.
* **Header & Footer (`components/layout/Header.jsx`)**: Displays the main top-bar, mobile-responsive sub-navigation scroll, and site-wide footer linking back to categories and legal pages.
* **Reusable UI Components (`components/ui/`)**:
  * `PageHero`: Standardized headers containing page titles and short descriptions.
  * `Breadcrumbs`: Provides navigation paths to nested sub-pages.
  * `SubNav`: Dynamically renders category-specific sub-menus.
  * `SectionPage`: Wrapper component that handles breadcrumbs, sidebar sub-navigation, page hero, and children grid layouts.
  * `EventCard`, `NewsCard`, `CourseCard`, `CommunityCard`: Specialized card designs with clean Tailwind layouts.
  * `CtaBanner`: Encourages membership registrations and renewals.

### 2.4 Page Routes Mapping (`client/src/routes/index.jsx`)
The client app handles over 40 distinct route definitions, mapped to content templates as follows:

| Section | Route Pattern | Target Component File |
| :--- | :--- | :--- |
| **Home** | `/` | `pages/HomePage.jsx` |
| **About** | `/about` | `pages/about/AboutPage.jsx` |
| | `/about/team` | `pages/about/TeamPage.jsx` |
| | `/about/history` | `pages/about/HistoryPage.jsx` |
| | `/about/governance` | `pages/about/GovernancePage.jsx` |
| **Membership** | `/membership` | `pages/membership/MembershipPage.jsx` |
| | `/membership/join` | `pages/membership/MembershipSubPages.jsx` (JoinPage) |
| | `/membership/renew` | `pages/membership/MembershipSubPages.jsx` (RenewPage) |
| | `/membership/benefits` | `pages/membership/MembershipSubPages.jsx` (BenefitsPage) |
| | `/membership/types` | `pages/membership/MembershipSubPages.jsx` (TypesPage) |
| **Events** | `/events` | `pages/events/EventsPage.jsx` |
| | `/events/calendar` | `pages/events/EventsCalendarPage.jsx` |
| | `/events/conferences` | `pages/events/EventListPages.jsx` (ConferencesPage) |
| | `/events/workshops` | `pages/events/EventListPages.jsx` (WorkshopsPage) |
| | `/events/webinars` | `pages/events/EventListPages.jsx` (WebinarsPage) |
| | `/events/environmental-policy` | `pages/events/EnvironmentalPolicyPage.jsx` |
| | `/events/:type/:slug` | `pages/events/EventDetailPage.jsx` |
| **Education** | `/education` | `pages/education/EducationPages.jsx` (EducationPage) |
| | `/education/courses` | `pages/education/EducationPages.jsx` (CoursesPage) |
| | `/education/calendar` | `pages/education/EducationPages.jsx` (EducationCalendarPage) |
| **Communities**| `/communities` | `pages/communities/CommunitiesPages.jsx` (CommunitiesPage) |
| | `/communities/local-chapters` | `pages/communities/CommunitiesPages.jsx` (LocalChaptersPage) |
| | `/communities/:slug` | `pages/communities/CommunitiesPages.jsx` (CommunityDetailPage) |
| **Students** | `/students` | `pages/students/StudentsPage.jsx` |
| **News** | `/news` | `pages/news/NewsPages.jsx` (NewsPage) |
| | `/news/archive` | `pages/news/NewsPages.jsx` (NewsArchivePage) |
| | `/news/press-releases` | `pages/news/NewsPages.jsx` (PressReleasesPage) |
| | `/news/:slug` | `pages/news/NewsPages.jsx` (NewsDetailPage) |
| **Media** | `/media` | `pages/media/MediaPages.jsx` (MediaPage) |
| | `/media/journals` | `pages/media/MediaPages.jsx` (JournalsPage) |
| | `/media/newsletters` | `pages/media/MediaPages.jsx` (NewslettersPage) |
| | `/media/publications` | `pages/media/MediaPages.jsx` (PublicationsPage) |
| **Services** | `/services` | `pages/services/ServicesPages.jsx` (ServicesPage) |
| | `/services/training` | `pages/services/ServicesPages.jsx` (TrainingPage) |
| | `/services/consulting` | `pages/services/ServicesPages.jsx` (ConsultingPage) |
| **Contact** | `/contact` | `pages/contact/ContactPages.jsx` (ContactPage) |
| | `/contact/media` | `pages/contact/ContactPages.jsx` (MediaInquiriesPage) |
| | `/contact/support` | `pages/contact/ContactPages.jsx` (SupportPage) |
| **Legal** | `/legal/disclaimer` | `pages/legal/LegalPages.jsx` (DisclaimerPage) |
| | `/legal/cookies` | `pages/legal/LegalPages.jsx` (CookiesPage) |
| **Fallback** | `*` | `pages/NotFoundPage.jsx` |

---

## 3. Server Application (Backend)

The backend is built as a REST API using **Node.js** with **Express** and connects to a **PostgreSQL** database using **Prisma ORM**.

### 3.1 Dependencies & Execution Scripts (`server/package.json`)
* **Express (`^5.1.0`)**: Coordinates API routing.
* **Prisma (`^6.9.0`)**: Serves as the ORM to interact with the database.
* **cookie-parser (`^1.4.7`)**: Parses cookie headers (critical for JWT validation in future auth phases).
* **cors (`^2.8.5`)**: Configured to whitelist `http://localhost:5173` with credentials.
* **dotenv (`^16.5.0`)**: Loads variables from `.env`.
* **zod (`^3.25.67`)**: Ready for request payload validation.
* **multer (`^2.0.1`)**: Set up for local file uploads (CMS media library).

### 3.2 Main Server (`server/src/index.js`)
Handles the server setup:
1. Loads `.env` configurations.
2. Initializes middleware (`cors`, `express.json()`, `cookieParser()`).
3. Registers the base route `app.use('/api/health', healthRoutes)`.
4. Executes `prisma.$connect()` to verify database connectivity.
5. Launches the Express server on port `3000` (or `PORT`).

### 3.3 Database Interface (`server/prisma/` & `server/src/prisma/`)
* [schema.prisma](file:///home/rayen/Projects/AGGE/server/prisma/schema.prisma): Sets up a PostgreSQL database datasource reading the URL from `DATABASE_URL` environment variable.
* [client.js](file:///home/rayen/Projects/AGGE/server/src/prisma/client.js): Exports a single, memoized `PrismaClient` instance used globally across the API to manage database queries.

### 3.4 API Routes
Currently, the backend implements the core health status check endpoint:

* **Endpoint**: `GET /api/health`
* **Route file**: `routes/healthRoutes.js`
* **Controller file**: `controllers/healthController.js`
* **Response**:
  ```json
  {
    "status": "ok"
  }
  ```

---

## 4. Docker Removal Audit

The project has been reviewed to ensure there are no remnants of Docker configuration, which would violate the local dev-environment-only requirement.

* **Audit Status**: **100% Cleaned**.
* **Files Checked & Confirmed Absent**:
  * Root `docker-compose.yml` (Deleted)
  * `client/Dockerfile` (Deleted)
  * `server/Dockerfile` (Deleted)
  * Local `.dockerignore` files (Deleted)
* **Configuration Verification**:
  * No references to Docker containers or host aliases in environment files (`server/.env`, `client/.env`).
  * Database paths are mapped directly to `localhost:5432`.

---

## 5. Integration Status

The client and server are connected via Axios. 
* **Axios Helper**: The helper in `client/src/services/api.js` points to `import.meta.env.VITE_API_URL` (defaulting to `http://localhost:3000/api`).
* **Connection Test**: A custom hook `useHealthCheck` is integrated on the frontend (imported or ready to be integrated) to poll `/api/health` and display api status.

---

## 6. How to Run Locally

### 6.1 Requirements
* Node.js v20+
* PostgreSQL v16+ running on local port `5432`

### 6.2 Step 1: Database Initialization
Open your local PostgreSQL shell and run:
```sql
CREATE USER agge WITH PASSWORD 'agge';
CREATE DATABASE agge OWNER agge;
```

### 6.3 Step 2: Run Express Backend
```bash
cd server
cp .env.example .env
npm install
npx prisma generate
npm run dev
```
The server will connect to PostgreSQL and listen on `http://localhost:3000`.

### 6.4 Step 3: Run React Frontend
In a separate terminal window:
```bash
cd client
cp .env.example .env
npm install
npm run dev
```
The client dev server will spin up on `http://localhost:5173`.

---

## 7. Next Development Phases

The project has completed the scaffolding and analysis stage. The next sequential phases to implement are:

1. **Phase 1: Database Design** - Write models in `schema.prisma` for Users, Roles, Memberships, Events, Courses, News, and Forms, and execute migrations.
2. **Phase 2: Authentication** - Wire up user login/registration endpoints with HTTP-only cookies, JWT verification, and cookie-parsing middleware.
3. **Phase 3: User System** - Implement profile pages and member dashboard access.
4. **Phase 4: Admin Dashboard** - Introduce protected dashboard layouts for site managers and system administrators.
