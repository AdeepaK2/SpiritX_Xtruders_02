'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FaUsers, FaClipboardList, FaRobot, FaChartBar } from 'react-icons/fa';

// Import your feature components
import PlayersView from '@/components/features/PlayersView';
import SelectTeamView from '@/components/features/SelectTeamView';
import UserDataView from '@/components/features/UserDataView';
import DashboardSidebar from '@/components/DashboardSidebar'; // We'll create this next

const Dashboard = () => {
  const params = useParams();
  const userId = Array.isArray(params.userId) ? params.userId[0] : params.userId ?? '';
  const [activeFeature, setActiveFeature] = useState(''); // Empty string for dashboard overview
  
  const renderFeature = () => {
    switch (activeFeature) {
      case 'players':
        return <PlayersView />;
      case 'select-team':
        return <SelectTeamView />;
      case 'team':
        return <div className="p-6 bg-white rounded-lg shadow">Team View Content</div>;
      case 'budget':
        return <div className="p-6 bg-white rounded-lg shadow">Budget View Content</div>;
      case 'leaderboard':
        return <div className="p-6 bg-white rounded-lg shadow">Leaderboard Content</div>;
      case 'userdata':
        return <UserDataView />;
      default:
        // Show dashboard overview when no specific feature is selected
        return <DashboardOverview userId={userId} onFeatureSelect={setActiveFeature} />;
    }
  };

  return (
    <div className="flex h-screen">
      <DashboardSidebar activeFeature={activeFeature} onFeatureSelect={setActiveFeature} />
      <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
        {renderFeature()}
      </div>
    </div>
  );
};

// Dashboard Overview component shown on initial dashboard load
const DashboardOverview = ({ userId, onFeatureSelect }: { userId: string, onFeatureSelect: (feature: string) => void }) => {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to SpiritX</h1>
        <p className="text-gray-600">Your fantasy cricket dashboard</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Feature Cards */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500 hover:shadow-lg transition-all cursor-pointer"
             onClick={() => onFeatureSelect('players')}>
          <div className="flex items-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <FaUsers className="text-blue-500 text-xl" />
            </div>
            <h3 className="text-xl font-semibold ml-4">Players</h3>
          </div>
          <p className="text-gray-600 mb-4">View all player stats and details</p>
          <button 
            onClick={() => onFeatureSelect('players')}
            className="text-blue-600 font-medium hover:text-blue-800"
          >
            View Players →
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500 hover:shadow-lg transition-all cursor-pointer"
             onClick={() => onFeatureSelect('select-team')}>
          <div className="flex items-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <FaClipboardList className="text-green-500 text-xl" />
            </div>
            <h3 className="text-xl font-semibold ml-4">Select Team</h3>
          </div>
          <p className="text-gray-600 mb-4">Create or modify your fantasy team</p>
          <button 
            onClick={() => onFeatureSelect('select-team')}
            className="text-green-600 font-medium hover:text-green-800"
          >
            Select Team →
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500 hover:shadow-lg transition-all cursor-pointer"
             onClick={() => onFeatureSelect('userdata')}>
          <div className="flex items-center mb-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <FaRobot className="text-purple-500 text-xl" />
            </div>
            <h3 className="text-xl font-semibold ml-4">User Profile</h3>
          </div>
          <p className="text-gray-600 mb-4">View your account details and stats</p>
          <button 
            onClick={() => onFeatureSelect('userdata')}
            className="text-purple-600 font-medium hover:text-purple-800"
          >
            View Profile →
          </button>
        </div>
      </div>
      
      {/* Info Panel */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">How to Play</h3>
            <ol className="list-decimal pl-5 space-y-2 text-gray-700">
              <li>Browse available players and check their stats</li>
              <li>Create your team by selecting players within budget</li>
              <li>Monitor your team's performance on the leaderboard</li>
            </ol>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Tips for Success</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Balance your team with batsmen, bowlers and all-rounders</li>
              <li>Consider player form and upcoming matches</li>
              <li>Check player statistics before making your selection</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
