# Deploying Barakah OS

## 1. Supabase (backend)

1. Create a project at https://supabase.com.
2. In the SQL Editor, run migrations in order:
   - `database/migrations/0001_init.sql`
   - `database/policies/rls.sql`
3. Enable **Email** and **Google** providers under Authentication → Providers.
   For Google, set the redirect URL to `https://<your-project>.supabase.co/auth/v1/callback`
   and add your production domain to the allowed redirect URLs.
4. Under Project Settings → API, copy the **Project URL** and **anon public key**.
5. (Optional) Create a Storage bucket named `attachments` for expense receipts,
   with an RLS policy scoping access to `auth.uid()` matching the folder prefix.

## 2. Environment variables

Copy `.env.example` to `.env.local` for local dev, and set the same two keys
in Vercel's Environment Variables UI for production:

```
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

Without these set, the app runs in **demo mode** against local seeded data —
useful for previews, but not for real user data.

## 3. AI Assistant in production

The current AI Assistant (`src/services/ai.service.ts`) is rule-based and
runs entirely client-side — no API key needed. To upgrade to a generative
model:

1. Create a Supabase Edge Function (`supabase functions new ai-assistant`)
   that accepts `{ question, context }` and calls the Anthropic API with
   your `ANTHROPIC_API_KEY` stored as a Supabase secret
   (`supabase secrets set ANTHROPIC_API_KEY=...`) — never call a model API
   with the user's financial data directly from the browser.
2. Point `askAssistant()` at that function instead of the local rules.

## 4. Frontend (Vercel)

1. Import the repo into Vercel.
2. Framework preset: **Vite** (auto-detected via `vercel.json`).
3. Add the environment variables from step 2.
4. Deploy — `vercel.json` already configures the SPA rewrite so client-side
   routing works on refresh, plus baseline security headers.

## 5. CI

`.github/workflows/ci.yml` runs on every push/PR to `main`: type check, lint,
test, and build. Treat a red build as a merge blocker.

## 6. Regenerating database types

After changing the schema, regenerate `src/types/database.types.ts`:

```bash
npm i -g supabase
supabase login
SUPABASE_PROJECT_ID=<your-project-id> npm run db:types
```
