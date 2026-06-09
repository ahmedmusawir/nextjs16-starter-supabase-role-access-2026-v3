import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { AppRole } from "@/utils/app-role";

interface AuthState {
  user: SupabaseUser | null;
  role: AppRole | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperadmin: boolean;
  isMember: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<string>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      isAuthenticated: false,
      isAdmin: false,
      isSuperadmin: false,
      isMember: false,
      isLoading: true,
      login: async (email, password) => {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Login failed");
        }

        const user = result.data.user as SupabaseUser;
        const role = result.data.role as AppRole;

        set({
          user,
          role,
          isAuthenticated: true,
          isSuperadmin: role === AppRole.SUPERADMIN,
          isAdmin: role === AppRole.ADMIN,
          isMember: role === AppRole.MEMBER,
        });

        // Return the redirect path so the calling component can handle navigation
        if (role === AppRole.SUPERADMIN) return "/superadmin-portal";
        if (role === AppRole.ADMIN) return "/admin-portal";
        if (role === AppRole.MEMBER) return "/members-portal";
        return "/";
      },
      logout: async () => {
        const response = await fetch("/api/auth/logout", { method: "POST" });
        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || "Logout failed");
        }

        set({
          user: null,
          role: null,
          isAuthenticated: false,
          isAdmin: false,
          isSuperadmin: false,
          isMember: false,
        });
      },
    }),
    {
      name: "auth-store",
    }
  )
);
