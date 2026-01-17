import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { preferencesApi } from "../services/api";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(true);

  // Theme beim Login/Start laden
  useEffect(() => {
    if (!user) {
      // Kein User = immer Light Mode
      const root = window.document.documentElement;
      root.classList.remove("dark");
      setTheme("light");
    } else if (user?.id) {
      loadTheme();
    }
  }, [user]);

  // Theme anwenden
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const loadTheme = async () => {
    try {
      const response = await preferencesApi.getUserPreferences(user.id);
      const userTheme = response.data.theme || "light";
      setTheme(userTheme);
    } catch (error) {
      console.error("Fehler beim Laden des Themes:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateTheme = async (newTheme) => {
    try {
      await preferencesApi.updateUserPreferences(user.id, { theme: newTheme });
      setTheme(newTheme);
    } catch (error) {
      console.error("Fehler beim Speichern des Themes:", error);
      throw error;
    }
  };

  const value = {
    theme,
    setTheme: updateTheme,
    loading,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
