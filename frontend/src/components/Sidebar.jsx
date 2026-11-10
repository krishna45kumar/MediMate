
import { NavLink, useNavigate } from "react-router-dom";

import {
  Pill,
  LayoutDashboard,
  CalendarDays,
  History,
  FileBarChart,
  Bot,
  Settings,
  LogOut,
} from "lucide-react";

function Sidebar() {
  const navigate = useNavigate();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Medicines",
      path: "/medicines",
      icon: Pill,
    },
    {
      name: "Schedule",
      path: "/schedule",
      icon: CalendarDays,
    },
    {
      name: "Weekly Report",
      path: "/weekly-report",
      icon: FileBarChart,
    },
    {
      name: "History",
      path: "/history",
      icon: History,
    },
    {
      name: "AI Assistant",
      path: "/ai-assistant",
      icon: Bot,
    },
  ];

  function handleLogout() {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmLogout) {
      return;
    }

    // Clear login session
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("rememberMe");

    // Redirect to Login page
    navigate("/", { replace: true });
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-30 h-screen w-64 overflow-y-auto bg-white border-r border-slate-200 p-5 flex flex-col">

      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className="bg-blue-600 p-3 rounded-xl">
          <Pill size={24} className="text-white" />
        </div>

        <div>
          <h1 className="text-lg font-bold text-slate-800">
            Medi<span className="text-blue-600">Mate</span>
          </h1>

          <p className="text-xs text-slate-500">
            Your Health, Our Priority
          </p>
        </div>
      </div>

      {/* Menu heading */}
      <p className="text-xs font-semibold text-slate-400 mb-4">
        MAIN MENU
      </p>

      {/* Navigation links */}
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`
              }
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom menu */}
      <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col gap-2">

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              isActive
                ? "bg-blue-50 text-blue-600 font-semibold"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`
          }
        >
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>

      </div>
    </aside>
  );
}

export default Sidebar;
