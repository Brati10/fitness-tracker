import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { preferencesApi } from "../services/api";
import PageHeader from "../components/PageHeader";

function Settings() {
  const { user } = useAuth();
  const userId = user?.id;

  const { theme, setTheme } = useTheme();
  const [preferences, setPreferences] = useState(null);
  const [tempRestTime, setTempRestTime] = useState(60);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Preferences laden
      const prefsResponse = await preferencesApi.getUserPreferences(userId);
      setPreferences(prefsResponse.data);
      setTempRestTime(prefsResponse.data.defaultRestTime || 60);

      // Dark Mode anwenden
      const root = window.document.documentElement;
      if (prefsResponse.data.theme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    } catch (error) {
      console.error("Fehler beim Laden:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateRestTime = async () => {
    try {
      const response = await preferencesApi.updateUserPreferences(userId, {
        defaultRestTime: tempRestTime,
      });
      setPreferences(response.data);
      alert("Pausenzeit gespeichert!");
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      alert("Fehler beim Speichern!");
    }
  };

  const updateWeightUnit = async (unit) => {
    try {
      const response = await preferencesApi.updateUserPreferences(userId, {
        weightUnit: unit,
      });
      setPreferences(response.data);
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      alert("Fehler beim Speichern!");
    }
  };

  const updateTheme = async (newTheme) => {
    try {
      await setTheme(newTheme);
    } catch (error) {
      alert("Fehler beim Speichern!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Lädt...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader title="Einstellungen" showBack backTo="/" />

      <div className="p-4 space-y-4">
        {/* Standard-Pausenzeit */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3 dark:text-white">
            Standard-Pausenzeit
          </h2>
          <div className="flex items-center gap-3 mb-3">
            <input
              type="range"
              min="30"
              max="300"
              step="10"
              value={tempRestTime}
              onChange={(e) => setTempRestTime(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="font-bold text-lg w-16 text-center text-gray-800 dark:text-white">
              {tempRestTime}s
            </span>
          </div>
          <button
            onClick={updateRestTime}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded font-semibold"
          >
            Speichern
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Timer-Dauer nach abgeschlossenem Satz
          </p>
        </div>

        {/* Gewichtseinheit */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3 dark:text-white">
            Gewichtseinheit
          </h2>
          <div className="flex gap-3">
            <button
              onClick={() => updateWeightUnit("kg")}
              className={`flex-1 py-2 px-4 rounded font-semibold transition ${
                preferences?.weightUnit === "kg"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Kilogramm (kg)
            </button>
            <button
              onClick={() => updateWeightUnit("lbs")}
              className={`flex-1 py-2 px-4 rounded font-semibold transition ${
                preferences?.weightUnit === "lbs"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Pounds (lbs)
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Daten werden in kg gespeichert und automatisch umgerechnet
          </p>
        </div>

        {/* Dark Mode */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3 dark:text-white">Design</h2>
          <div className="flex gap-3">
            <button
              onClick={() => updateTheme("light")}
              className={`flex-1 py-2 px-4 rounded font-semibold transition ${
                theme === "light"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              ☀️ Light
            </button>
            <button
              onClick={() => updateTheme("dark")}
              className={`flex-1 py-2 px-4 rounded font-semibold transition ${
                theme === "dark"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              🌙 Dark
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            Angemeldet als: <strong>{user?.username}</strong>
          </p>
        </div>

        {/* Admin Panel Link - nur für Admins */}
        {user?.role === "ADMIN" && (
          <Link
            to="/admin"
            className="block bg-red-500 hover:bg-red-600 text-white p-4 rounded-lg text-center font-semibold"
          >
            🔧 Admin-Panel
          </Link>
        )}
      </div>
    </div>
  );
}

export default Settings;
