'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { FaUsers, FaChartBar, FaTrophy, FaHome, FaUserShield, FaClipboardCheck } from 'react-icons/fa';

interface AdminSidebarProps {
  activeFeature: string;
  onFeatureSelect: (feature: string) => void;
}

const AdminSidebar = ({ activeFeature, onFeatureSelect }: AdminSidebarProps) => {
  const params = useParams();
  
  const navItems = [
    { path: '', label: 'Admin Panel', icon: <FaUserShield className="text-lg mr-2" /> },
    { path: 'players', label: 'Players View', icon: <FaUsers className="text-lg mr-2" /> },
    { path: 'player-stats', label: 'Player Stats', icon: <FaChartBar className="text-lg mr-2" /> },
    { path: 'tournament-summary', label: 'Tournament Summary', icon: <FaTrophy className="text-lg mr-2" /> },
    { path: 'match-management', label: 'Match Management', icon: <FaClipboardCheck className="text-lg mr-2" /> },
  ];
  
  // Check if a route is active
  const isActive = (path: string) => {
    return activeFeature === path;
  };
  
  return (
    <div className="h-screen max-h-screen w-56 bg-gradient-to-b from-indigo-900 to-purple-900 text-white flex flex-col py-4 px-2 shadow-xl rounded-r-xl overflow-hidden">
      <div className="mb-4 px-2">
        <div className="flex justify-center items-center">
          <Image 
            src="/logo.png" 
            alt="SpiritX Logo" 
            width={120} 
            height={40}
            className="object-contain"
          />
        </div>
        <div className="text-center mt-2 text-sm font-semibold bg-indigo-700 rounded-md py-1">
          Admin Panel
        </div>
      </div>
      <nav className="flex-1 overflow-hidden">
        <ul className="space-y-1.5">
          {navItems.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => onFeatureSelect(item.path)}
                className={`w-full flex items-center px-3 py-2 rounded-lg transition-all duration-200 font-medium text-sm
                  ${isActive(item.path) 
                    ? 'bg-indigo-600 text-white shadow-md transform translate-x-1' 
                    : 'text-gray-200 hover:bg-indigo-700/50 hover:translate-x-1'}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;