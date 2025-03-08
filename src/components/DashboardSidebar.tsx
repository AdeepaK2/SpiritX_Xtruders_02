'use client';

import { useParams } from 'next/navigation';
import { FaUsers, FaClipboardList, FaUserFriends, FaMoneyBillWave, FaTrophy, FaRobot, FaHome } from 'react-icons/fa';

interface DashboardSidebarProps {
  activeFeature: string;
  onFeatureSelect: (feature: string) => void;
}

const DashboardSidebar = ({ activeFeature, onFeatureSelect }: DashboardSidebarProps) => {
  const params = useParams();
  const userId = params.userId;
  
  const navItems = [
    { path: '', label: 'Dashboard Home', icon: <FaHome className="text-xl mr-3" /> },
    { path: 'players', label: 'Players View', icon: <FaUsers className="text-xl mr-3" /> },
    { path: 'select-team', label: 'Select Your Team', icon: <FaClipboardList className="text-xl mr-3" /> },
    { path: 'team', label: 'Team View', icon: <FaUserFriends className="text-xl mr-3" /> },
    { path: 'budget', label: 'Budget View', icon: <FaMoneyBillWave className="text-xl mr-3" /> },
    { path: 'leaderboard', label: 'Leaderboard', icon: <FaTrophy className="text-xl mr-3" /> },
    { path: 'userdata', label: 'User Details', icon: <FaRobot className="text-xl mr-3" /> },
  ];
  
  // Check if a route is active
  const isActive = (path: string) => {
    return activeFeature === path;
  };
  
  return (
    <div className="h-full w-64 bg-gradient-to-b from-indigo-900 to-purple-900 text-white flex flex-col py-6 px-3 shadow-xl rounded-r-xl">
      <div className="mb-8 px-4">
        <h2 className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          SpiritX
        </h2>
      </div>
      <nav className="flex-1">
        <ul className="space-y-3">
          {navItems.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => onFeatureSelect(item.path)}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 font-medium
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

export default DashboardSidebar;