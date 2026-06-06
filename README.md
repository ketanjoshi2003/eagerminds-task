# Bookmarks Manager 🔖

A premium, modern bookmarks manager and public profile platform built with **Next.js**, **Supabase**, and **Resend**.

Save your favorite links, organize them, and toggle their visibility to share selected bookmarks on your own unique public profile page (e.g., `https://yourdomain.com/username`).

---

## 🌟 Key Features

1. **Custom Handles (`@handle`)**
   * New users claim a unique, validated alphanumeric handle (e.g., `@alex`) upon sign-up.
   * This handle serves as the username and defines the public profile path: `/@handle`.

2. **Bookmark Management**
   * Create, edit, and delete bookmarks with custom titles and URLs.
   * Toggle between **Public** and **Private** visibility on each bookmark.

3. **Public Profiles (`/@handle`)**
   * Anyone can visit your public page (e.g., `/@handle`) to browse your public bookmarks.
   * Private bookmarks are strictly filtered and hidden from public view.

4. **Robust Security**
   * Powered by PostgreSQL **Row Level Security (RLS)** policies combined with server-action validation.
   * Strict user isolation ensures users can only read, write, or delete their own data.

5. **Smooth Onboarding & Email Verification**
   * Verification link dispatched during sign-up using the **Resend API**.
   * Auto-provisioning of profiles via database triggers.

---

## 🛠️ Technology Stack

* **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
* **Database & Auth**: [Supabase](https://supabase.com/) (Postgres + Supabase Auth)
* **Email Service**: [Resend](https://resend.com/)
* **Styling**: Tailwind CSS

---

## 📋 Prerequisites

Before starting, make sure you have:
* **Node.js** (v18.x or higher)
* A **Supabase** account and project
* A **Resend** account and API key

---

## ⚙️ Local Setup & Configuration

### 1. Clone & Install Dependencies

Clone the repository and install the required packages:

```bash
git clone <repository-url>
cd eagerminds-task
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory and add the following four environment variables:

```env
# 1. Supabase Project URL (Supabase Dashboard -> Settings -> API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# 2. Supabase Anon/Public Key (Supabase Dashboard -> Settings -> API)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key

# 3. Supabase Service Role Key (Supabase Dashboard -> Settings -> API -> service_role)
# CRITICAL: This is a secret key and must NOT be shared publicly.
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-secret-key

# 4. Resend API Key (Resend Dashboard -> API Keys)
RESEND_API_KEY=re_your_resend_api_key
```

### 3. Initialize the Supabase Database Schema

Run the migration script against your Supabase SQL Editor to prepare the database tables, triggers, and permissions. You can copy the code directly from [supabase/migrations/schema.sql](file:///home/ketan/eagerminds-task/supabase/migrations/schema.sql):

```sql
-- 1. Create Profiles Table (references auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  handle text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Bookmarks Table (references auth.users)
create table if not exists public.bookmarks (
  id uuid default gen_random_uuid() not null primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  url text not null,
  is_public boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable Row Level Security (RLS) on both tables
alter table public.profiles enable row level security;
alter table public.bookmarks enable row level security;

-- 4. Set RLS Policies for Profiles
create policy "Allow public read access to profiles" on public.profiles
  for select using (true);

create policy "Allow individual insert access to profiles" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Allow individual update access to profiles" on public.profiles
  for update using (auth.uid() = id);

create policy "Allow individual delete access to profiles" on public.profiles
  for delete using (auth.uid() = id);

-- 5. Set RLS Policies for Bookmarks
create policy "Allow individual control on bookmarks" on public.bookmarks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Allow public read access to public bookmarks" on public.bookmarks
  for select using (is_public = true);

-- 6. Trigger to automatically create a Profile when a new auth user is created
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, handle)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'handle',
      split_part(new.email, '@', 1) || '_' || substring(md5(random()::text) from 1 for 4)
    )
  );
  return new;
end;
$$ language plpgsql security definer;

-- Recreate trigger if exists
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. Grant Table Permissions for Supabase API Roles (anon, authenticated, service_role)
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on table public.profiles to authenticated, anon, service_role;
grant select, insert, update, delete on table public.bookmarks to authenticated, anon, service_role;
grant usage, select on all sequences in schema public to authenticated, anon, service_role;
```

### 4. Run the Development Server

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to experience the application.

---

## 🚀 Vercel Deployment Guide

To deploy this project successfully to Vercel, make sure you configure all 4 environment variables:

1. **Deploy to Vercel**: Import your repository.
2. **Add Environment Variables**: Go to **Vercel Project Settings → Environment Variables** and add the following:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * `SUPABASE_SERVICE_ROLE_KEY` *(the secret `service_role` key from Supabase Dashboard)*
   * `RESEND_API_KEY`
3. **Check Target Environments**: Check the boxes for **Production**, **Preview**, and **Development** for these keys.
4. **Trigger a Redeployment**: In Vercel, go to the **Deployments** tab, click the three dots on the latest deployment, and select **Redeploy** to ensure the new environment variables are loaded.

---

## 🔧 Recent Improvements & Hardening

* **Hydration Error Fix**: Handled server/client mismatch on window location initialization by loading the host only after client mounting.
* **Database Permissions Hardening (`42501`)**: Explicitly granted schema usage and table permissions to `authenticated`, `anon`, and `service_role` roles to prevent API errors.
* **Resend Dynamic Base URL**: Corrected routing redirection issues inside emails by computing and forwarding the dynamic request origin context during signup action.
* **Optimized Bookmark Mutations**: Replaced the whole-page window refresh in UI mutations with localized optimistic and reactive state adjustments for a smooth user experience.
* **Offline Fonts**: Replaced remote font fetches with pre-cached local font assets to prevent build sandbox environment network timeouts.
