
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Medicines from "./pages/Medicines";
import WeeklyReport from "./pages/WeeklyReport";
import DashboardLayout from "./components/DashboardLayout";
import Schedule from "./pages/Schedule";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          }
        />

        <Route
          path="/medicines"
          element={
            <DashboardLayout>
              <Medicines />
            </DashboardLayout>
          }
        />

        <Route
          path="/weekly-report"
          element={
            <DashboardLayout>
              <WeeklyReport />
            </DashboardLayout>
          }
        />
        <Route
  path="/schedule"
  element={
    <DashboardLayout>
      <Schedule />
    </DashboardLayout>
  }
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
