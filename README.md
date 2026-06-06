# Bookmarks Manager 🔖

A premium, modern bookmarks manager and public profile platform built with **Next.js**, **Supabase**, and **Resend**.

Save your favorite links, organize them, and toggle their visibility to share selected bookmarks on your own unique public profile page (e.g., `https://yourdomain.com/username`).

---

# Where the AI agent got things wrong:

The agent repeatedly attempted to configure Supabase's built-in email provider and SMTP setup despite the initial prompt explicitly specifying Resend API. I corrected it by reinforcing that only the Resend API should be used for transactional emails, with no SMTP involvement.
The initial dashboard UI was cramped with no spacing or visual structure. I guided the agent with explicit layout and padding requirements until it produced a clean, usable interface.
The agent was unaware of the difference between Gemini CLI and Antigravity CLI, causing it to run incorrect commands using the gemini binary instead of the agy alias. I explained the correct setup and commands for Antigravity on Arch Linux.
The agent did not implement Supabase Row Level Security policies on the initial pass, leaving all endpoints open. I identified this, instructed it to enable RLS on both tables, and verified the policies were correctly applied.

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

### 3. Run the Development Server

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
