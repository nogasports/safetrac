import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  MapPin, 
  Package, 
  ScrollText,
  Settings,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem = ({ to, icon, label }: NavItemProps) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      flex flex-col items-center gap-1 p-3 rounded-1deg
      transition-all duration-200 relative
      ${isActive 
        ? 'text-secondary' 
        : 'text-gray-400 hover:text-gray-600'}
    `}
  >
    {({ isActive }) => (
      <>
        <div className={`
          absolute inset-0 rounded-1deg transition-all duration-200
          ${isActive ? 'bg-secondary/10' : 'hover:bg-gray-100'}
        `} />
        <div className="relative">
          {icon}
          <span className="text-xs font-alexandria mt-1 block">{label}</span>
        </div>
      </>
    )}
  </NavLink>
);

export const Navigation = () => {
  const handleLogout = () => {
    window.location.href = '/auth';
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white rounded-1deg shadow-lg border border-gray-200">
      <nav className="grid grid-cols-8 p-1 gap-1">
        <NavItem to="dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
        <NavItem to="seals" icon={<Package size={20} />} label="Seals" />
        <NavItem to="stations" icon={<MapPin size={20} />} label="Stations" />
        <NavItem to="users" icon={<Users size={20} />} label="Users" />
        <NavItem to="logs" icon={<ScrollText size={20} />} label="Logs" />
        <NavItem to="settings" icon={<Settings size={20} />} label="Settings" />
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 p-3 rounded-1deg text-red-500 hover:text-red-600 transition-all duration-200 relative"
        >
          <div className="absolute inset-0 rounded-1deg transition-all duration-200 hover:bg-red-50" />
          <div className="relative">
            <LogOut size={20} />
            <span className="text-xs font-alexandria mt-1 block">Logout</span>
          </div>
        </button>
      </nav>
    </div>
  );
}