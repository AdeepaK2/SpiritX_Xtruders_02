'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { FaUsers, FaClipboardList, FaUserFriends, FaMoneyBillWave, FaTrophy, FaRobot, FaHome, FaUser } from 'react-icons/fa';

interface DashboardSidebarProps {
  activeFeature: string;
  onFeatureSelect: (feature: string) => void;
}

const DashboardSidebar = ({ activeFeature, onFeatureSelect }: DashboardSidebarProps) => {
  const params = useParams();
  const userId = params.userId;
  
  const navItems = [
    { path: '', label: 'Dashboard Home', icon: <FaHome className="text-lg mr-2" /> },
    { path: 'players', label: 'Players View', icon: <FaUsers className="text-lg mr-2" /> },
    { path: 'select-team', label: 'Select Your Team', icon: <FaClipboardList className="text-lg mr-2" /> },
    { path: 'team', label: 'Team', icon: <FaUserFriends className="text-lg mr-2" /> },
    { path: 'budget', label: 'Budget View', icon: <FaMoneyBillWave className="text-lg mr-2" /> },
    { path: 'leaderboard', label: 'Leaderboard', icon: <FaTrophy className="text-lg mr-2" /> },
    { path: 'chatbot', label: 'Spiriter AI', icon: <FaRobot className="text-lg mr-2" /> },
    { path: 'userdata', label: 'User Details', icon: <FaUser className="text-lg mr-2" /> },
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

export default DashboardSidebar;