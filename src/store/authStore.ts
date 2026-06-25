import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/utils/toast";
import type { AuthState, Profile, User, Role } from "@/types/auth.types";
import { usePasswordRecoveryStore } from "./passwordRecoveryStore";

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  authLoading: true,
  signInLoading: false,

  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("role, full_name, email, gender")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.log("Profile fetch error:", error);
      return null;
    }
    return data;
  },

  getSession: async () => {
    set({ authLoading: true });

    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.log("Session error:", error);
      set({ user: null, authLoading: false });
      return;
    }

    const session = data.session;

    if (!session?.user?.id) {
      set({
        user: null,
        authLoading: false,
      });
      return;
    }

    const recoveryMode =
      usePasswordRecoveryStore.getState().mode === "recovery";

    if (recoveryMode) {
      set({
        user: null,
        authLoading: false,
      });
      return;
    }

    const profile = await get().getProfile(session.user.id);
    console.log("PROFILE:", profile);
    console.log("ROLE:", profile?.role);

    set({
      user: {
        id: session.user.id,
        email: session.user.email ?? null,
        role: profile?.role ?? null,
        userName: profile?.full_name ?? null,
        gender: profile?.gender ?? null
      },
      authLoading: false,
    });
  },

  signIn: async (email, password, rememberMe) => {
    set({ signInLoading: true });
    console.log("remeberMe",rememberMe);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      console.log("Login error:", error);
      set({ signInLoading: false });
      showToast.error("Login failed", "Invalid email or password");
      return;
    }

    if (!rememberMe) {
      await supabase.auth.signOut({ scope: "local" });
    }

    const profile = await get().getProfile(data.user.id);

    set({
      user: {
        id: data.user.id,
        email: data.user.email ?? null,
        role: profile?.role ?? null,
        userName: profile?.full_name ?? null,
        gender: profile?.gender ?? null,
      },
      signInLoading: false,
    });
    showToast.success("Login successful", `Welcome back`);
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, authLoading: false });
    showToast.success("Logout, successful");
  },

  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      showToast.error("Reset failed");
      return;
    }

    showToast.success("Password reset email sent", "Check your inbox");
  },
}));
