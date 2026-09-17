# AGGE Platform: Supabase Migration & Vercel Deployment Guide

This guide details how to initialize your Supabase project, execute the database migrations, and deploy the frontend to Vercel.

---

## Architecture Overview

- **Frontend**: React + Vite (hosted on **Vercel**)
- **Backend & Database**: **Supabase** (PostgreSQL, Supabase Auth, Row Level Security, Storage, and RPC functions)
- **Data Access**: PostgREST via `@supabase/supabase-js`
- **File Storage**: Supabase Storage (`media` bucket)

---

## Step 1: Create Supabase Project

1. Go to [database.new](https://database.new) or sign in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **"New Project"**.
3. Fill in:
   - **Name**: `AGGE Platform` (or your preferred name)
   - **Database Password**: Choose a strong password and save it securely.
   - **Region**: Select the region closest to your users (e.g. Frankfurt, London, or US East).
4. Wait 1–2 minutes for the database to provision.

---

## Step 2: Run Database Migrations

You can run the entire migration in **one step** via the Supabase SQL Editor:

1. In your Supabase project dashboard, navigate to **SQL Editor** (the terminal/code icon in the left sidebar).
2. Click **"New Query"**.
3. Open [`supabase/complete_setup.sql`](file:///data/projects/AGGE/supabase/complete_setup.sql) in this repository, copy all contents, and paste them into the SQL editor.
4. Click **"Run"** (or press `Ctrl + Enter` / `Cmd + Enter`).

*(Alternatively, you can run the files in sequence from [`supabase/migrations/`](file:///data/projects/AGGE/supabase/migrations/):)*
- `01_schema.sql` (Creates custom ENUMs, core tables, triggers, and `auth.users` -> `profiles` sync)
- `02_row_level_security.sql` (Enables RLS policies and security definer role helpers)
- `03_storage.sql` (Initializes `media` storage bucket and access policies)
- `04_rpc_functions.sql` (Creates checkout session, payment webhook, admin stats, calendar feed, and dashboard functions)
- `05_seed.sql` (Seeds membership plans, categories, events, courses, articles, static pages, and dynamic forms)

---

## Step 3: Configure Authentication Settings

1. In your Supabase Dashboard, go to **Authentication** → **URL Configuration**.
2. Under **Site URL**, enter your production Vercel URL (e.g., `https://agge-platform.vercel.app` or custom domain). For local development, you can use `http://localhost:5173`.
3. Under **Redirect URLs**, add:
   - `http://localhost:5173/**`
   - `https://your-vercel-domain.vercel.app/**`
4. Under **Authentication** → **Providers** → **Email**:
   - For rapid testing and development, you can optionally disable **"Confirm email"** to allow instant logins upon registration.

---

## Step 4: Retrieve Project API Credentials

1. In your Supabase Dashboard, navigate to **Project Settings** (gear icon) → **API**.
2. Copy the following values:
   - **Project URL** (e.g., `https://xyzprojectid.supabase.co`)
   - **Project API Keys** → `anon` `public` key (e.g., `eyJhbGciOi...`)

---

## Step 5: Test Locally

Create `client/.env` (or update existing):

```env
VITE_SUPABASE_URL=https://xyzprojectid.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Start the Vite development server:
```bash
cd client
npm run dev
```

Visit `http://localhost:5173` to test:
- Event listings and detail pages
- Educational courses catalog
- Unified calendar search
- User registration and login
- CMS News & Announcements
- Contact & membership application forms

---

## Step 6: Deploy to Vercel

### Option A: Via Vercel Web Dashboard (Recommended)

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Sign in to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Select your AGGE repository.
4. In the **Configure Project** screen:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click "Edit" and choose `client`.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables** and add:
   - `VITE_SUPABASE_URL` = your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase Anon Key
6. Click **"Deploy"**.

### Option B: Via Vercel CLI

```bash
cd client
npx vercel
```
Follow the prompts to link your project, and set the environment variables via:
```bash
npx vercel env add VITE_SUPABASE_URL
npx vercel env add VITE_SUPABASE_ANON_KEY
```

---

## Step 7: Post-Deployment Verification

1. **SPA Routing**: Navigate to `/events`, `/courses`, `/calendar`, `/admin`, and reload the browser (`F5`). [`client/vercel.json`](file:///data/projects/AGGE/client/vercel.json) ensures all subpaths rewrite cleanly to `index.html`.
2. **First Admin User**:
   - Register an account on your live app.
   - Go to the Supabase Dashboard → **Table Editor** → `profiles`.
   - Change the user's `role` from `MEMBER` to `SUPER_ADMIN` or `ADMIN`.
   - Refresh the app to immediately access the Admin Dashboard!
