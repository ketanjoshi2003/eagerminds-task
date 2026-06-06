This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Features

1. **Bookmarks Management** — Create, edit, and delete bookmarks with custom titles, URLs, and a public/private toggle.
2. **Handle Onboarding Flow** — New users are prompted to choose a unique, validated alphanumeric `@handle` upon first landing on the dashboard.
3. **Public Profile Pages** — Anyone can view public bookmarks at `/@handle` without authentication. Private bookmarks are securely hidden.
4. **Bulletproof Privacy** — Dual-layer enforcement (Postgres RLS Policies + Server Action scopes) guarantees strict user data isolation.

## Getting Started

First, configure your environment variables:
1. Create a `.env.local` file in the root directory.
2. Define the following variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   RESEND_API_KEY=your-resend-api-key
   ```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## Recent Fixes & Hardening

### 1. Hydration Error Resolution
* **Problem**: The onboarding page displayed a React hydration error because the public URL preview performed a direct `typeof window` check to render `window.location.origin`, causing a server/client HTML mismatch.
* **Fix**: Added a mounted state and populated the origin within a `useEffect` hook, guaranteeing the initial client pass matches the server's empty string shell before dynamically loading the host.

### 2. Database Permissions Hardening (`42501`)
* **Problem**: Performing profile upserts threw `permission denied for table profiles` because tables created under a superuser did not automatically grant API roles access.
* **Fix**: Added table-level `GRANT` statements for `authenticated`, `anon`, and `service_role` in [schema.sql](file:///home/ketan/eagerminds-task/supabase/migrations/schema.sql) and documented them in [security_audit.md](file:///home/ketan/.gemini/antigravity-cli/brain/6198cc54-4779-4d28-8a95-e9660b825df7/security_audit.md).

### 3. Resend Welcome Email Redirect Link
* **Problem**: Clicking the dashboard button in the welcome email sent by Resend resulted in a `requested path is invalid` error page because the link was set to the Supabase API base URL.
* **Fix**: Passed the calculated frontend `baseUrl` through the signup server action payload and updated the welcome email template to correctly point to the frontend dashboard.

### 4. Bookmark Stream Error Resolution
* **Problem**: Adding a new bookmark caused the browser to flash a Next.js stream error overlay for a second because `window.location.reload()` was triggered concurrently with Next.js router revalidation transitions.
* **Fix**: Refactored the API action to return the inserted record from Postgres and updated the client state dynamically, removing the browser reload entirely for an instantaneous update.

### 5. Offline Fonts Optimization
* **Problem**: Remote font downloads failed during build compilation due to network sandbox limits.
* **Fix**: Switched from `next/font/google` to `next/font/local` using cached woff2 font files.
