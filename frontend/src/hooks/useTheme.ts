import { useEffect, useCallback } from "react";
import { useThemeStore, type ThemeMode } from "@/store";

const getSystemTheme = (): "light" | "dark" =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const applyTheme = (resolved: "light" | "dark") => {
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(resolved);
};

const useTheme = () => {
  const { theme, setTheme } = useThemeStore();

  const resolvedTheme: "light" | "dark" =
    theme === "system" ? getSystemTheme() : theme;

  const applyCurrentTheme = useCallback(() => {
    const resolved = theme === "system" ? getSystemTheme() : theme;
    applyTheme(resolved);
  }, [theme]);

  useEffect(() => {
    applyCurrentTheme();

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme(mq.matches ? "dark" : "light");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme, applyCurrentTheme]);

  const setThemeMode = (mode: ThemeMode) => {
    setTheme(mode);
    const resolved = mode === "system" ? getSystemTheme() : mode;
    applyTheme(resolved);
  };

  return { theme, resolvedTheme, setTheme: setThemeMode };
};

export default useTheme;
