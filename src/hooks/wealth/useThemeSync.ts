import { useEffect } from "react";
import type { ThemePreference } from "../../models/wealth/types";
import { useWealthStore } from "../../stores/wealthStore";

function resolveIsDark(theme: ThemePreference): boolean {
  if (theme === "system") return window.matchMedia("(prefers-color-scheme: dark)").matches;
  return theme === "dark";
}

export function useThemeSync() {
  const theme = useWealthStore((state) => state.settings.theme);

  useEffect(() => {
    const apply = () => {
      document.documentElement.classList.toggle("dark", resolveIsDark(theme));
    };
    apply();

    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);
}
