import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { TrainingProvider } from "./context/TrainingContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import WeightTracking from "./pages/WeightTracking";
import WeightStatistics from "./pages/WeightStatistics";
import WorkoutTracking from "./pages/WorkoutTracking";
import WorkoutTemplates from "./pages/WorkoutTemplates";
import TemplateEditor from "./pages/TemplateEditor";
import WorkoutHistory from "./pages/WorkoutHistory";
import ExerciseManagement from "./pages/ExerciseManagement";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminPanel from "./pages/AdminPanel";

function AppContent() {
  return (
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
          <Route
            path="/templates/:templateId/edit"
            element={
              <ProtectedRoute>
                <TemplateEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exercises"
            element={
              <ProtectedRoute>
                <ExerciseManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <TrainingProvider>
          <AppContent />
        </TrainingProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
