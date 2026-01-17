import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/PageHeader";

function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader title="Fitness Tracker" showBack={false} />

      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-64px)]">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center mb-8">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Willkommen,{" "}
              <span className="font-semibold">{user?.username}</span>! 👋
            </p>
          </div>

          <Link
            to="/weight"
            className="block bg-green-500 hover:bg-green-600 text-white p-6 rounded-lg text-center text-xl font-semibold transition shadow-lg"
          >
            ⚖️ Gewicht erfassen
          </Link>

          <Link
            to="/workout"
            className="block bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-lg text-center text-xl font-semibold transition shadow-lg"
          >
            💪 Training starten
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
