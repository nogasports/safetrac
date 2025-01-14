import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  MapPin, 
  Package, 
  AlertTriangle, 
  ScrollText,
  Settings,
  Warehouse,
  Send
} from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem = ({ to, icon, label }: NavItemProps) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      flex items-center gap-3 px-4 py-3 rounded-1deg
      transition-colors duration-200
      ${isActive 
        ? 'bg-secondary text-white' 
        : 'text-gray-600 hover:bg-gray-100'}
    `}
  >
    {icon}
    <span className="font-alexandria">{label}</span>
  </NavLink>
);

export const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 fixed left-0 top-0">
      <div className="flex items-center gap-3 p-4 border-b border-gray-200">
        <Package className="text-secondary" size={24} />
        <h1 className="font-alexandria font-bold text-secondary">Safetrac</h1>
      </div>
      
      <nav className="p-4 space-y-2">
        <NavItem to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
        <NavItem to="/seals" icon={<Package size={20} />} label="Seals" />
        <NavItem to="/stations" icon={<MapPin size={20} />} label="Stations" />
        <NavItem to="/inventory" icon={<Warehouse size={20} />} label="Inventory" />
        <NavItem to="/dispatch" icon={<Send size={20} />} label="Dispatch" />
        <NavItem to="/damaged" icon={<AlertTriangle size={20} />} label="Damaged" />
        <NavItem to="/logs" icon={<ScrollText size={20} />} label="Logs" />
        <NavItem to="/users" icon={<Users size={20} />} label="Users" />
        <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" />
      </nav>
    </div>
  );
}