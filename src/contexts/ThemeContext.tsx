import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type Theme = "light" | "dark" | "system";
type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined
);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");

  // This effect runs when the theme is set, it applies the theme to document class and persists it.
  useEffect(() => {
    const applyTheme = (theme: Theme) => {
      let newTheme = theme;
      if (theme === "system") {
        newTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }
      // Apply the theme to the document element class
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(newTheme);
    };

    applyTheme(theme);
    // Persist theme in localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  // On initial load, try to get the theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme | null;
    if (saved) {
      setThemeState(saved); // Set the theme from localStorage
    } else {
      // If no theme is saved, apply the system preference
      setThemeState("system");
    }
  }, []);

  // Function to set the theme explicitly
  const setTheme = (t: Theme) => setThemeState(t);

  // Toggle between light, dark, and system themes
  const toggleTheme = () =>
    setThemeState((curr) =>
      curr === "light" ? "dark" : curr === "dark" ? "system" : "light"
    );

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
