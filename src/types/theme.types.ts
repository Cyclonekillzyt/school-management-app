export type ThemeMode = "light" | "dark";

export type ThemeStore = {
  mode: ThemeMode;
  isSystemMode: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  setSystemMode: (value: boolean) => void;
};
