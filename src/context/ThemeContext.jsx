import { createContext, useContext, useEffect, useState } from "react";
const ThemeContext = createContext();
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "system";
  });
  const getActiveTheme = () => {
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return theme;
  };
  const [activeTheme, setActiveTheme] = useState(getActiveTheme());
  useEffect(() => {
    const active = getActiveTheme();
    setActiveTheme(active);
    localStorage.setItem("theme", theme);
    document.body.setAttribute("data-theme", active);
  }, [theme]);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme === "system") {
        const active = mediaQuery.matches ? "dark" : "light";
        setActiveTheme(active);
        document.body.setAttribute("data-theme", active);
      }
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [theme]);
  return (
    <ThemeContext.Provider value={{ theme, setTheme, activeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
export const useTheme = () => useContext(ThemeContext);
