import { useThemeStore } from "@/store/themeStore";
import { lightTheme, darkTheme } from "@/lib/theme";
import { useColorScheme } from "react-native";
import { useEffect } from "react";

export function useTheme() {
  const scheme = useColorScheme();
  const setMode = useThemeStore((s) => s.setMode);
  const mode = useThemeStore((s) => s.mode);

  useEffect(() => {
    if (scheme === "dark" || scheme === "light") {
      setMode(scheme);
    }
  }, [scheme, setMode]);

  return mode === "light" ? darkTheme : lightTheme;
}
