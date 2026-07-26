import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeStore } from "@/types/theme.types";

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      mode: "dark",
      isSystemMode: true,

      setMode: (mode) => set({ mode }),

      toggleTheme: () =>
        set({
          mode: get().mode === "dark" ? "light" : "dark",
          isSystemMode: false,
        }),

      setSystemMode: (value) => set({ isSystemMode: value }),
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
