import { create } from "zustand";
import { ThemeMode, ThemeStore } from "@/types/theme.types";

export const useThemeStore = create<ThemeStore>((set, get) => ({
  mode: "dark",

  setMode: (mode: ThemeMode) => set({ mode }),

  toggleTheme: () =>
    set((_state) => ({ mode: get().mode === "dark" ? "light" : "dark" })),
}));
