
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
   </div>
        
    );
}

export default Sidebar;
