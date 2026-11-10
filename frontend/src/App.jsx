
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Medicines from "./pages/Medicines";
import WeeklyReport from "./pages/WeeklyReport";
import Schedule from "./pages/Schedule";
import History from "./pages/History";
import Settings from "./pages/Settings";

import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Protected Medicines */}
        <Route
          path="/medicines"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Medicines />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Protected Weekly Report */}
        <Route
          path="/weekly-report"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <WeeklyReport />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Protected Schedule */}
        <Route
          path="/schedule"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Schedule />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Protected History */}
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <History />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Protected Settings */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
