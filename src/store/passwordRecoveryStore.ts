import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/utils/toast";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "zustand/middleware";

type RecoveryStep = "email" | "otp" | "newPassword" 
type RecoveryMode = "normal" | "recovery";

type PasswordRecoveryState = {
  email: string;
  loading: boolean;
  isVerified: boolean;
  step: RecoveryStep;
  mode: RecoveryMode;

  setEmail: (email: string) => void;
  clearEmail: () => void;
  setStep: (step: RecoveryStep) => void;
  setVerified: (value: boolean) => void;

  sendResetCode: (email: string) => Promise<boolean>;
  verifyResetCode: (otp: string) => Promise<boolean>;
  updatePassword: (password: string) => Promise<boolean>;
  setMode: (mode: RecoveryMode) => void;
};

export const usePasswordRecoveryStore = create<PasswordRecoveryState>()(
  persist(
    (set, get) => ({
      email: "",
      isVerified: false,
      loading: false,
      step: "email",
      mode: "normal",

      setEmail: (email) => set({ email }),

      setStep: (step) => set({ step }),

      setVerified: (value) => set({ isVerified: value }),

      clearEmail: () =>
        set({
          email: "",
          isVerified: false,
          step: "email",
        }),

      sendResetCode: async (email) => {
        set({ loading: true });

        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email);

          if (error) throw error;

          set({
            email,
            step: "otp",
            mode: "recovery"
          });

          showToast.success(
            "Verification code sent",
            "Check your email for the code",
          );

          return true;
        } catch (err: any) {
          showToast.error("Failed", err.message);
          console.log("error", err);
          return false;
        } finally {
          set({ loading: false });
        }
      },

      verifyResetCode: async (otp) => {
        const email = get().email;

        set({ loading: true });

        try {
          const { error } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: "recovery",
          });

          if (error) throw error;

          set({
            isVerified: true,
            step: "newPassword",
          });

          showToast.success(
            "Code verified",
            "You can now create a new password",
          );

          return true;
        } catch (err: any) {
          showToast.error("Verification failed", err.message);
          return false;
        } finally {
          set({ loading: false });
        }
      },

      updatePassword: async (password) => {
        set({ loading: true });

        try {
          const { error } = await supabase.auth.updateUser({
            password,
          });

          if (error) throw error;

          set({
            email: "",
            isVerified: false,
            step: "email",
            mode: "normal",
          });

          showToast.success(
            "Password updated",
            "You can now log in with your new password",
          );

          return true;
        } catch (err: any) {
          showToast.error("Update failed", err.message);
          return false;
        } finally {
          set({ loading: false });
        }
      },
      setMode: (mode) =>
        set({
          mode,
        }),
    }),
    {
      name: "password-recovery-storage",
      storage: createJSONStorage(() => AsyncStorage),

      partialize: (state) => ({
        email: state.email,
        step: state.step,
        isVerified: state.isVerified,
      }),
    },
  ),
);
