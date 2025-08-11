// src/components/layout/Sidebar.jsx
import { Home, BarChart2, List, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const links = [
    { name: "Analytics", icon: BarChart2 },
    { name: "User Management", icon: Home },
    { name: "Logs & History", icon: List },
    { name: "Settings", icon: Settings },
  ];

  return (
    <div className="bg-white">
      <NavLink end={true} to="/dashboard" className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-64 cursor-pointer ${isActive && "bg-primary/10 border-r-4 border-primary "}`}> 
        <BarChart2 className="w-4 h-4" />
        Analytics
      </NavLink>
      <NavLink to="/dashboard/logs" className={({isActive})=> `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-64 cursor-pointer ${isActive && "bg-primary/10 border-r-4 border-primary "}`}>
        <List className="w-4 h-4" />
        Logs & History
      </NavLink>
    </div>
  );
}
