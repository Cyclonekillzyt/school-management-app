import { useThemeStore } from "@/store/themeStore";
import { lightTheme, darkTheme } from "@/lib/theme";
import { useColorScheme } from "react-native";
import { useEffect } from "react";

export function useTheme() {
  const scheme = useColorScheme();
  const mode = useThemeStore((s) => s.mode);
  const isSystemMode = useThemeStore((s) => s.isSystemMode);
  const setMode = useThemeStore((s) => s.setMode);

  useEffect(() => {
    if (isSystemMode && (scheme === "dark" || scheme === "light")) {
      setMode(scheme);
    }
  }, [scheme, isSystemMode, setMode]);

  return mode === "dark" ? darkTheme : lightTheme;
}
