import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import WeightTracking from "./pages/WeightTracking";
import WorkoutTracking from "./pages/WorkoutTracking";
import WorkoutHistory from "./pages/WorkoutHistory";
import WeightStatistics from "./pages/WeightStatistics";
import WorkoutTemplates from "./pages/WorkoutTemplates";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/weight"
              element={
                <ProtectedRoute>
                  <WeightTracking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/weight/statistics"
              element={
                <ProtectedRoute>
                  <WeightStatistics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workout"
              element={
                <ProtectedRoute>
                  <WorkoutTracking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workout/history"
              element={
                <ProtectedRoute>
                  <WorkoutHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/templates"
              element={
                <ProtectedRoute>
                  <WorkoutTemplates />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
