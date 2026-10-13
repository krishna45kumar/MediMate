
import { NavLink } from "react-router-dom";

import {
    Pill,
    LayoutDashboard,
    CalendarDays,
    History,
    Bot,
    Settings,
    LogOut
} from "lucide-react";

function Sidebar() {
    const menuItems = [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: LayoutDashboard
        },
        {
            name: "Medicines",
            path: "/medicines",
            icon: Pill
        },
        {
            name: "Schedule",
            path: "/schedule",
            icon: CalendarDays
        },
        {
            name: "History",
            path: "/history",
            icon: History
        },
        {
            name: "AI Assistant",
            path: "/ai-assistant",
            icon: Bot
        }
    ];

    return (
        <div>

            {/* Logo */}
            <div className="flex items-center gap-3 mb-10">
                <div className="bg-blue-600 p-3 rounded-xl">
                    <Pill size={24} className="text-white" />
                </div>

                <div>
                    <h1 className="text-lg font-bold text-slate-800">
                        MediMate <span className="text-blue-600">AI</span>
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

         
         

        </div>
    );
}

export default Sidebar;
