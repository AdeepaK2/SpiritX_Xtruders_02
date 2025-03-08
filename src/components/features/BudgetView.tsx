'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  FaMoneyBillWave, 
  FaUserPlus, 
  FaMinusCircle, 
  FaPlusCircle,
  FaCoins,
  FaChartPie,
  FaUser
} from 'react-icons/fa';

interface Player {
  _id: string;
  name: string;
  university: string;
  category: string;
  playerValue: number;
  playerPoints: number;
}

interface Team {
  _id: string;
  name: string;
  userId: string;
  players: Player[];
  totalValue: number;
  createdAt: string;
  updatedAt: string;
}

interface User {
  _id: string;
  username: string;
  email: string;
  budget: number;
  accountCreationDate: string;
  lastLoginDate: string;
}

// Add onNavigate prop to allow changing dashboard views
interface BudgetViewProps {
  onNavigate?: (feature: string) => void;
}

const BudgetView = ({ onNavigate }: BudgetViewProps = {}) => {
  const params = useParams();
  const userId = params.userId as string;
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Function to handle navigation to team selection
  const handleNavigateToTeamSelection = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('select-team');
    } else {
      // Fallback to direct navigation if onNavigate isn't provided
      window.location.href = `/${userId}/dashboard/select-team`;
    }
  };

  useEffect(() => {
    const fetchUserAndTeam = async () => {
      try {
        setLoading(true);
        
        // Fetch user data to get budget
        const userResponse = await fetch(`/api/user?id=${userId}`);
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const userData = await userResponse.json();
        setUser(userData.users[0] || null);
        
        // Fetch team data
        const teamResponse = await fetch(`/api/team?userId=${userId}`);
        if (!teamResponse.ok) {
          throw new Error('Failed to fetch team data');
        }
        
        const teamData = await teamResponse.json();
        setTeam(teamData.teams && teamData.teams.length > 0 ? teamData.teams[0] : null);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchUserAndTeam();
    }
  }, [userId]);

  // Budget calculations
  const initialBudget = 9000000; // Starting budget value
  const spentBudget = team?.totalValue || 0;
  const availableBudget = user?.budget || 0; // Get directly from user object
  const percentageUsed = ((initialBudget - availableBudget) / initialBudget) * 100;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-6 bg-red-50 rounded-lg shadow">
          <p className="text-red-600 font-medium">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2 flex items-center">
        <FaMoneyBillWave className="mr-3 text-green-600" /> Budget Management
      </h1>
      {user && (
        <p className="text-gray-600 mb-6 flex items-center">
          <FaUser className="mr-2" /> {user.username}'s Fantasy Budget Dashboard
        </p>
      )}
      
      {/* Budget Overview Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-2 flex items-center">
              <FaCoins className="mr-2" /> Available Budget
            </h3>
            <p className="text-3xl font-bold text-green-700">₹{availableBudget.toLocaleString()}</p>
            <p className="text-sm text-green-600 mt-1">Initial Budget: ₹9,000,000</p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
              <FaChartPie className="mr-2" /> Team Investment
            </h3>
            <p className="text-3xl font-bold text-blue-700">₹{spentBudget.toLocaleString()}</p>
            <p className="text-sm text-blue-600 mt-1">
              {team ? `Team: ${team.name}` : 'No team created yet'}
            </p>
          </div>
          
          <div className="p-6 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-800 mb-2">Budget Usage</h3>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full"
                style={{ width: `${Math.min(percentageUsed, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-purple-700">
              {percentageUsed.toFixed(1)}% of budget allocated
            </p>
          </div>
        </div>
      </div>
      
      {/* Team Players and Values */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <FaUserPlus className="mr-3 text-indigo-600" /> Team Investments
        </h2>
        
        {!team || team.players.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-gray-500 mb-4">You haven't added any players to your team yet.</p>
            <button 
              onClick={handleNavigateToTeamSelection}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors inline-flex items-center"
            >
              <FaPlusCircle className="mr-2" /> Select Players
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-indigo-50 text-indigo-900">
                    <th className="py-3 px-4 text-left">Player</th>
                    <th className="py-3 px-4 text-left">Category</th>
                    <th className="py-3 px-4 text-left">University</th>
                    <th className="py-3 px-4 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {team.players.map(player => (
                    <tr key={player._id} className="hover:bg-indigo-50/30">
                      <td className="py-3 px-4 font-medium">{player.name}</td>
                      <td className="py-3 px-4">{player.category}</td>
                      <td className="py-3 px-4">{player.university}</td>
                      <td className="py-3 px-4 text-right font-medium text-indigo-700">
                        ₹{player.playerValue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-indigo-100 font-bold">
                    <td className="py-3 px-4" colSpan={3}>Total Team Value</td>
                    <td className="py-3 px-4 text-right text-indigo-800">
                      ₹{team.totalValue.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleNavigateToTeamSelection}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors inline-flex items-center"
              >
                <FaMinusCircle className="mr-2" /> Manage Team
              </button>
            </div>
          </>
        )}
      </div>
      
      {/* Budget Information */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Budget Rules</h2>
        <div className="bg-blue-50 p-4 rounded-lg">
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Each user starts with an initial budget of ₹9,000,000</li>
            <li>Players can only be added to your team if you have sufficient budget</li>
            <li>When you remove a player from your team, their value is added back to your budget</li>
            <li>Budget is automatically updated when you modify your team</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BudgetView;