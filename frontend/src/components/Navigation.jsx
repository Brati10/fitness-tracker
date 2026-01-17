import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Navigation({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [expandedSection, setExpandedSection] = useState(null);

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/login");
  };

  const handleNavClick = (path) => {
    navigate(path);
    onClose();
    setExpandedSection(null);
  };

  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  const isActive = (path) => location.pathname === path;

  if (!user) return null;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-blue-500 text-white p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold">Fitness Tracker</h2>
              <button
                onClick={onClose}
                className="text-white text-2xl hover:bg-white/20 w-8 h-8 rounded flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <p className="text-sm opacity-90">{user.username}</p>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto p-4">
            {/* Home */}
            <button
              onClick={() => handleNavClick("/")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                isActive("/")
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <span className="text-2xl">🏠</span>
              <span>Home</span>
            </button>

            {/* Gewicht (collapsible) */}
            <div className="mb-2">
              <button
                onClick={() => toggleSection("weight")}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚖️</span>
                  <span>Gewicht</span>
                </div>
                <span className="text-sm">
                  {expandedSection === "weight" ? "▼" : "▶"}
                </span>
              </button>

              {expandedSection === "weight" && (
                <div className="ml-11 mt-1 space-y-1">
                  <button
                    onClick={() => handleNavClick("/weight")}
                    className={`w-full text-left px-4 py-2 rounded text-sm ${
                      isActive("/weight")
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    Tracken
                  </button>
                  <button
                    onClick={() => handleNavClick("/weight/statistics")}
                    className={`w-full text-left px-4 py-2 rounded text-sm ${
                      isActive("/weight/statistics")
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    Statistik
                  </button>
                </div>
              )}
            </div>

            {/* Training (collapsible) */}
            <div className="mb-2">
              <button
                onClick={() => toggleSection("training")}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💪</span>
                  <span>Training</span>
                </div>
                <span className="text-sm">
                  {expandedSection === "training" ? "▼" : "▶"}
                </span>
              </button>

              {expandedSection === "training" && (
                <div className="ml-11 mt-1 space-y-1">
                  <button
                    onClick={() => handleNavClick("/workout")}
                    className={`w-full text-left px-4 py-2 rounded text-sm ${
                      isActive("/workout")
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    Tracken
                  </button>
                  <button
                    onClick={() => handleNavClick("/templates")}
                    className={`w-full text-left px-4 py-2 rounded text-sm ${
                      isActive("/templates")
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    Vorlagen
                  </button>
                  <button
                    onClick={() => handleNavClick("/workout/history")}
                    className={`w-full text-left px-4 py-2 rounded text-sm ${
                      isActive("/workout/history")
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    Historie
                  </button>
                </div>
              )}
            </div>

            {/* Übungen - nur für TRUSTED_USER & ADMIN */}
            {(user?.role === "TRUSTED_USER" || user?.role === "ADMIN") && (
              <button
                onClick={() => handleNavClick("/exercises")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  isActive("/exercises")
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <span className="text-2xl">🏋️</span>
                <span>Übungen</span>
              </button>
            )}

            {/* Einstellungen */}
            <button
              onClick={() => handleNavClick("/settings")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                isActive("/settings")
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <span className="text-2xl">⚙️</span>
              <span>Einstellungen</span>
            </button>
          </nav>

          {/* Footer - Logout */}
          <div className="p-4 border-t dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Navigation;
