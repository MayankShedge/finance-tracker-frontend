import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import {
  AuthProvider,
  useAuth,
} from "./context/AuthContext";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Goals from "./pages/Goals";
import Transactions from "./pages/Transactions";
import ImportTransactions from "./pages/ImportTransactions";
import Devices from "./pages/Devices";
import Tasks from "./pages/Tasks";
import ReminderSettings from "./pages/ReminderSettings";
import Chat from "./pages/Chat";
import LandingPage from "./pages/LandingPage";

// Protect pages that require authentication
function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();

  // Wait until the authentication state is loaded
  if (isLoading) {
    return (
      <div className="loading-state app-loading">
        Loading...
      </div>
    );
  }

  // Allow authenticated users; redirect others to login
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public landing page */}
      <Route
        path="/"
        element={<LandingPage />}
      />

      {/* Authentication pages */}
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/signup"
        element={<Signup />}
      />

      {/* Protected dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected goals page */}
      <Route
        path="/goals"
        element={
          <ProtectedRoute>
            <Goals />
          </ProtectedRoute>
        }
      />

      {/* Protected transactions page */}
      <Route
        path="/transactions"
        element={
          <ProtectedRoute>
            <Transactions />
          </ProtectedRoute>
        }
      />

      {/* Protected CSV import page */}
      <Route
        path="/import"
        element={
          <ProtectedRoute>
            <ImportTransactions />
          </ProtectedRoute>
        }
      />

      {/* Protected connected devices page */}
      <Route
        path="/devices"
        element={
          <ProtectedRoute>
            <Devices />
          </ProtectedRoute>
        }
      />

      {/* Protected tasks page */}
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        }
      />

      {/* Protected reminders page */}
      <Route
        path="/reminders"
        element={
          <ProtectedRoute>
            <ReminderSettings />
          </ProtectedRoute>
        }
      />

      {/* Protected AI assistant */}
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />

      {/* Redirect unknown URLs to the landing page */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
