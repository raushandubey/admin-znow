import React from 'react';
import { LayoutDashboard, Coffee, MapPin, Layers } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'menu', label: 'Menu', icon: <Coffee size={20} /> },
    { id: 'cafes', label: 'Cloud Cafes', icon: <MapPin size={20} /> },
    { id: 'sections', label: 'App Sections', icon: <Layers size={20} /> },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo">znow admin</div>
      <nav>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
};
