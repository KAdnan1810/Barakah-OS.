import { create } from "zustand";
import { persist } from "zustand/middleware";
import { isSupabaseConfigured, supabase } from "@/services/supabaseClient";

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * Demo-mode auth: if Supabase isn't configured, this simulates a session
 * locally so the whole app is explorable without any backend setup. When
 * VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are set, each method below
 * calls the real supabase.auth.* equivalent instead — the calls are already
 * structured 1:1 with the Supabase Auth API for a mechanical swap.
 */
export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email, password) => {
        if (isSupabaseConfigured) {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
          set({ user: toAuthUser(data.user), isAuthenticated: true });
          return;
        }
        set({ user: { id: "demo", email, fullName: "Demo User" }, isAuthenticated: true });
      },

      loginWithGoogle: async () => {
        if (isSupabaseConfigured) {
          await supabase.auth.signInWithOAuth({ provider: "google" });
          return;
        }
        set({ user: { id: "demo", email: "demo@barakah.app", fullName: "Demo User" }, isAuthenticated: true });
      },

      signup: async (email, password, fullName) => {
        if (isSupabaseConfigured) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } },
          });
          if (error) throw error;
          set({ user: toAuthUser(data.user), isAuthenticated: true });
          return;
        }
        set({ user: { id: "demo", email, fullName }, isAuthenticated: true });
      },

      logout: async () => {
        if (isSupabaseConfigured) {
          await supabase.auth.signOut();
        }
        set({ user: null, isAuthenticated: false });
      },
    }),
    { name: "barakah-os-auth" }
  )
);

function toAuthUser(
  user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> } | null
): AuthUser | null {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email ?? "",
    fullName: (user.user_metadata?.full_name as string) ?? undefined,
  };
}
