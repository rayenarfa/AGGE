# AGGE Project — Complete Setup Guide

> Follow this guide top-to-bottom on a **fresh machine**. Sections are split
> by operating system where the commands differ. Shared steps are labelled
> **All platforms**.

---

## Table of Contents

1. [Prerequisites — what to install](#1-prerequisites)
2. [Get the source code](#2-get-the-source-code)
3. [PostgreSQL — create database and user](#3-postgresql-setup)
4. [Server setup](#4-server-setup)
5. [Client setup](#5-client-setup)
6. [Run the project](#6-run-the-project)
7. [Verify everything works](#7-verify-everything-works)
8. [Reference — ports, URLs, credentials](#8-reference)

---

## 1. Prerequisites

You need **Node.js**, **npm**, **Git**, and **PostgreSQL** installed before anything else.

### 1a. Arch Linux

```bash
# Update system packages
sudo pacman -Syu

# Install Node.js (includes npm), Git, and PostgreSQL
sudo pacman -S nodejs npm git postgresql
```

Start and enable PostgreSQL service:

```bash
# Initialise the database cluster (first time only)
sudo -u postgres initdb -D /var/lib/postgres/data

# Enable + start the service
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Verify it is running
sudo systemctl status postgresql
```

### 1b. Windows

1. **Node.js** — Download the LTS installer from https://nodejs.org and run it.
   - Tick "Add to PATH" during installation.
   - Open a new terminal and run `node -v` and `npm -v` to confirm.

2. **Git** — Download from https://git-scm.com/download/win and install with default options.

3. **PostgreSQL** — Download the installer from https://www.postgresql.org/download/windows/
   - Choose version **16** or later.
   - During setup: remember the **password** you set for the `postgres` superuser.
   - The PostgreSQL bin folder (`C:\Program Files\PostgreSQL\16\bin`) is automatically added to PATH by the installer. If not, add it manually via System Environment Variables.
   - After installation, **pgAdmin** is included — you can use it as a visual alternative to psql.

Verify installs in a new terminal:

```
node -v
npm -v
git -v
psql --version
```

---

## 2. Get the Source Code

### All platforms

Clone the repository (replace the URL with your actual repo URL or copy the folder):

```bash
git clone https://github.com/YOUR_USERNAME/AGGE.git
cd AGGE
```

If you are **copying the folder** instead (USB drive, zip file, etc.):

```bash
# Just navigate into the project root
cd /path/to/AGGE
```

Project structure you should see:

```
AGGE/
├── client/          ← React + Vite frontend
├── server/          ← Express + Prisma backend
├── tasks/           ← Project roadmap docs
├── SETUP.md         ← This file
└── README.md
```

---

## 3. PostgreSQL Setup

You need to create a **database user** and **database** that match the credentials used in `.env`.

### 3a. Arch Linux

```bash
# Open the PostgreSQL interactive shell as the postgres system user
sudo -u postgres psql
```

Inside the `psql` shell, run these SQL commands exactly:

```sql
-- Create the application user
CREATE USER agge WITH PASSWORD 'agge';

-- Create the application database owned by that user
CREATE DATABASE agge OWNER agge;

-- Grant all privileges (belt and suspenders)
GRANT ALL PRIVILEGES ON DATABASE agge TO agge;

-- Exit
\q
```

### 3b. Windows

Open the **Start Menu**, search for **SQL Shell (psql)** and launch it.

Press Enter to accept the defaults for Host, Database, Port, and Username (all default to localhost / postgres / 5432 / postgres). Enter the **postgres superuser password** you set during installation.

Then run the same SQL commands:

```sql
CREATE USER agge WITH PASSWORD 'agge';
CREATE DATABASE agge OWNER agge;
GRANT ALL PRIVILEGES ON DATABASE agge TO agge;
\q
```

Alternatively, open **pgAdmin**, connect to the local server, and use the GUI to create the user and database with the same names.

---

## 4. Server Setup

### All platforms

```bash
# Navigate into the server directory
cd server

# Install all dependencies
npm install
```

#### 4a. Create the server environment file

Copy the example file and edit it:

**Linux:**
```bash
cp .env.example .env
```

**Windows (Command Prompt):**
```cmd
copy .env.example .env
```

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

Now open `server/.env` in any text editor. The file should look like this:

```env
# Server
PORT=3000
NODE_ENV=development

# Database (local PostgreSQL)
DATABASE_URL=postgresql://agge:agge@localhost:5432/agge

# Auth
JWT_SECRET=change-me-to-a-long-random-secret
JWT_EXPIRES_IN=7d

# Frontend origin for CORS
CLIENT_URL=http://localhost:5173

# File uploads
UPLOAD_DIR=./uploads
```

> **Important**: Change `JWT_SECRET` to any long random string before using in production.  
> The `DATABASE_URL` format is: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`  
> If you used different credentials in step 3, update them here.

#### 4b. Run database migrations

This creates all tables in PostgreSQL from the Prisma schema:

```bash
# Still inside /server
npx prisma migrate dev --name init
```

If you get a "database already migrated" message on a re-setup, run instead:

```bash
npx prisma migrate deploy
```

#### 4c. Generate Prisma client

```bash
npx prisma generate
```

#### 4d. Seed the database

This populates the database with initial data (article categories, courses, events, membership plans, legal page blocks, and a default admin user):

```bash
npx prisma db seed
```

After seeding, you should see output confirming that users, events, articles, etc. were created.

#### 4e. Create the uploads folder

The server saves uploaded media files here:

**Linux:**
```bash
mkdir -p uploads
```

**Windows (Command Prompt or PowerShell):**
```cmd
mkdir uploads
```

---

## 5. Client Setup

Open a **new terminal** and navigate to the client folder:

```bash
# From the project root
cd client

# Install all dependencies
npm install
```

#### 5a. Create the client environment file

**Linux:**
```bash
cp .env.example .env
```

**Windows (Command Prompt):**
```cmd
copy .env.example .env
```

Open `client/.env`. It should contain:

```env
VITE_API_URL=http://localhost:3000/api
```

This tells the frontend where the backend API is. If you change the server port, update this too.

---

## 6. Run the Project

You need **two terminals open at the same time** — one for the server, one for the client.

### Terminal 1 — Start the backend server

```bash
cd server
npm run dev
```

You should see:
```
Database connected successfully
AGGE API listening on http://localhost:3000
```

### Terminal 2 — Start the frontend dev server

```bash
cd client
npm run dev
```

You should see:
```
  VITE v8.x.x  ready in Xms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://0.0.0.0:5173/
```

Open your browser and go to **http://localhost:5173**

---

## 7. Verify Everything Works

Work through this checklist to confirm the full stack is running:

| Check | URL | Expected |
|-------|-----|----------|
| Frontend loads | http://localhost:5173 | AGGE homepage renders |
| API health | http://localhost:3000/api/health | `{"status":"ok"}` JSON |
| Register an account | http://localhost:5173/register | Form submits, redirect to login |
| Login | http://localhost:5173/login | Redirects to dashboard |
| Admin panel | http://localhost:5173/admin | Dashboard loads (log in with admin account first) |
| News page | http://localhost:5173/news | Articles from DB show up |
| Events calendar | http://localhost:5173/events/calendar | Events and courses listed |

#### Default seed accounts

After running `npx prisma db seed`, the following accounts are created:

| Email | Password | Role |
|-------|----------|------|
| `admin@agge.org` | `Admin@1234` | `SUPER_ADMIN` |
| `editor@agge.org` | `Editor@1234` | `EDITOR` |
| `member@agge.org` | `Member@1234` | `MEMBER` |

> **Change these passwords** immediately in any non-local environment.

#### Useful dev tools

```bash
# Open Prisma Studio (visual database browser) — run from /server
npx prisma studio
# Opens at http://localhost:5555
```

---

## 8. Reference

### Ports

| Service | Port | URL |
|---------|------|-----|
| Express API server | 3000 | http://localhost:3000 |
| Vite dev server | 5173 | http://localhost:5173 |
| Prisma Studio | 5555 | http://localhost:5555 |
| PostgreSQL | 5432 | — |

### Database connection string format

```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
```

Default for this project:
```
postgresql://agge:agge@localhost:5432/agge
```

### Environment files

| File | Purpose |
|------|---------|
| `server/.env` | API port, DB URL, JWT secret, CORS origin |
| `client/.env` | Vite API base URL (`VITE_API_URL`) |

Both `.env` files are **gitignored** and must be created manually from their `.env.example` counterparts on every new machine.

### npm scripts reference

**Server (`cd server`):**

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start server with hot-reload (`node --watch`) |
| `npm start` | Start server without watch mode |
| `npx prisma migrate dev` | Create + apply new DB migrations |
| `npx prisma migrate deploy` | Apply existing migrations (no new ones) |
| `npx prisma generate` | Regenerate the Prisma client after schema changes |
| `npx prisma db seed` | Seed the database with initial data |
| `npx prisma studio` | Open visual DB browser at port 5555 |

**Client (`cd client`):**

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Build production bundle to `dist/` |
| `npm run lint` | Run oxlint code linter |
| `npm run preview` | Preview the production build locally |

### Project tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, Tailwind CSS 4, React Router 7 |
| Backend | Node.js, Express 5 |
| ORM | Prisma 6 |
| Database | PostgreSQL 16+ |
| Auth | JWT (HTTP-only cookies), bcryptjs |
| File uploads | Multer (local disk, `server/uploads/`) |
| Linter | oxlint |

---

## Troubleshooting

### `ECONNREFUSED` on startup
PostgreSQL is not running.
- **Arch:** `sudo systemctl start postgresql`
- **Windows:** Open Services (`services.msc`) → find **postgresql-x64-16** → Start

### `password authentication failed for user "agge"`
The DB user credentials don't match. Either:
1. Re-run the `CREATE USER agge WITH PASSWORD 'agge'` SQL command, or
2. Update `DATABASE_URL` in `server/.env` to match the credentials you used.

### `Port 3000 is already in use`
Another process is using the port.
- **Linux:** `kill $(lsof -ti :3000)`
- **Windows:** `netstat -ano | findstr :3000` then `taskkill /PID <pid> /F`

### `Cannot find module` errors after `npm install`
Delete `node_modules` and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Prisma migration errors on fresh DB
Run `npx prisma migrate reset` (this drops and recreates all tables, then re-seeds):
```bash
cd server
npx prisma migrate reset
```

### `CORS` errors in browser console
Confirm `CLIENT_URL` in `server/.env` exactly matches the address your browser shows (including port). Default: `http://localhost:5173`.

### Uploaded files not loading
Make sure the `server/uploads/` directory exists. Create it manually if needed:
```bash
# Linux
mkdir -p server/uploads

# Windows
mkdir server\uploads
```
