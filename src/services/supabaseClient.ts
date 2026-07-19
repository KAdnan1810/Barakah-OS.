import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// /**
//  * In demo mode (no env vars set) the app runs entirely off the local
//  * Zustand store (see src/store/app-store.ts) with seeded data — this lets
//  * `npm run dev` work immediately with zero setup. Once VITE_SUPABASE_URL
//  * and VITE_SUPABASE_ANON_KEY are set, swap the feature hooks in
//  * src/features/*/api to call `supabase` instead of the store directly.
//  */
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient<Database>(url, anonKey)
  : (null as unknown as ReturnType<typeof createClient<Database>>);
