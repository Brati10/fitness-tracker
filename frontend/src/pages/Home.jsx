import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";


function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Fitness Tracker
        </h1>
        <p className="text-gray-600">
          Willkommen, <span className="font-semibold">{user?.username}</span>!
          👋
        </p>
      </div>

      <div className="text-center text-sm text-gray-500 mb-4">
        Nutze die Navigation unten, um zu starten 👇
      </div>

      <Link
        to="/templates"
        className="bg-orange-500 hover:bg-orange-600 text-white p-8 rounded-lg text-center text-xl font-semibold transition"
      >
        📋 Trainingsvorlagen
      </Link>

      <button
        onClick={handleLogout}
        className="mt-6 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}

export default Home;
