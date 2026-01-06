import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function NavigationBar() {
  const location = useLocation();
  const { user } = useAuth();

  // Navigation nur zeigen wenn eingeloggt
  if (!user) {
    return null;
  }

  const navItems = [
    { path: "/", icon: "🏠", label: "Home" },
    { path: "/weight", icon: "⚖️", label: "Gewicht" },
    { path: "/workout", icon: "💪", label: "Training" },
    { path: "/workout/history", icon: "📊", label: "Historie" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? "text-blue-600" : "text-gray-600 hover:text-blue-500"
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default NavigationBar;
