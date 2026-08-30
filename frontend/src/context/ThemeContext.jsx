import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  darkMode: false,
  theme: "light",
  toggleTheme: () => {},
  setDarkMode: () => {},
});

const THEME_KEY = "neighbornet_theme";
const SETTINGS_KEY = "neighbornet_settings";

export function ThemeProvider({ children }) {
  const [darkMode, setDarkModeState] = useState(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme) {
        return savedTheme === "dark";
      }
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (typeof parsed.darkMode === "boolean") {
          return parsed.darkMode;
        }
      }
      if (
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        return true;
      }
    } catch {
      // ignore storage errors
    }
    return false;
  });

  const applyThemeToDOM = (isDark) => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute(
        "data-theme",
        isDark ? "dark" : "light"
      );
    }
  };

  useEffect(() => {
    applyThemeToDOM(darkMode);
    try {
      localStorage.setItem(THEME_KEY, darkMode ? "dark" : "light");
      const raw = localStorage.getItem(SETTINGS_KEY);
      const settings = raw ? JSON.parse(raw) : {};
      settings.darkMode = darkMode;
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkModeState((prev) => !prev);
  };

  const setDarkMode = (value) => {
    setDarkModeState(Boolean(value));
  };

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        theme: darkMode ? "dark" : "light",
        toggleTheme,
        setDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export default ThemeContext;
