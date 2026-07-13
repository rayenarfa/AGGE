# AGGE Website Platform

Modern rebuild of the AGGE professional association website. The reference EAGE site informs information architecture and functional requirements; the final product will have a fresh, modern design.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, React Router, Tailwind CSS, Axios |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth (later) | JWT + HTTP-only cookies |
| Validation (later) | Zod |
| File uploads (later) | Multer (local filesystem) |

## Project Structure

```
agge/
├── client/          # React + Vite frontend (localhost:5173)
├── server/          # Express API (localhost:3000)
├── docs/            # Architecture and reference analysis
└── eage.org-crawled/  # Reference markdown (IA only)
```

## Required Software

- [Node.js](https://nodejs.org/) 20+
- [PostgreSQL](https://www.postgresql.org/) 16+ (running locally on port 5432)

## Installation

### 1. Database

Create a local PostgreSQL database and user:

```sql
CREATE USER agge WITH PASSWORD 'agge';
CREATE DATABASE agge OWNER agge;
```

Adjust credentials in `server/.env` if you use different values.

### 2. Backend

```bash
cd server
cp .env.example .env
npm install
npx prisma generate
npm run dev
```

API runs at `http://localhost:3000`.

Health check: `GET http://localhost:3000/api/health` → `{ "status": "ok" }`

### 3. Frontend

In a separate terminal:

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Environment Variables

### `server/.env`

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default `3000`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for JWT signing (auth phase) |
| `CLIENT_URL` | Frontend origin for CORS |
| `UPLOAD_DIR` | Local upload directory (CMS phase) |

### `client/.env`

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |

## Development Scripts

### Server

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API with file watching |
| `npm run start` | Start API (production) |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run migrations (future) |
| `npm run prisma:studio` | Open Prisma Studio |

### Client

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## Documentation

See [`docs/reference-analysis.md`](docs/reference-analysis.md) for:

- Reference website analysis (EAGE.org)
- Proposed page hierarchy and navigation
- Required modules and user roles
- Suggested database entities and API structure

## Implementation Roadmap

Initialization is complete. Upcoming phases (one module at a time):

1. Database design
2. Authentication
3. User system
4. Admin dashboard
5. Events
6. Registration forms
7. Payments
8. Calendar
9. CMS
10. Deployment
