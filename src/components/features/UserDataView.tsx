'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FaUser, FaCoins, FaTrophy, FaUserFriends } from 'react-icons/fa';

interface User {
  _id: string;
  username: string;
  email: string;
  budget: number;
  points: number;
  rank?: number;
  createdAt: string;
}

interface Team {
  _id: string;
  name: string;
  players: string[];
}

const UserDataView = () => {
  const params = useParams();
  const userId = params.userId as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Fetch user data
        const userRes = await fetch(`/api/user?id=${userId}`);
        const userData = await userRes.json();
        
        // Fetch team data
        const teamRes = await fetch(`/api/team?userId=${userId}`);
        const teamData = await teamRes.json();
        
        if (userData.users && userData.users.length > 0) {
          setUser(userData.users[0]);
        }
        
        if (teamData.teams && teamData.teams.length > 0) {
          setTeam(teamData.teams[0]);
        }
        
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [userId]);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-medium text-red-800">Error</h3>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-medium text-yellow-800">User not found</h3>
        <p className="text-yellow-700">Could not find user data</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">User Profile</h1>
        <p className="text-gray-600">Your personal information and team details</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="h-20 w-20 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center mb-4">
                <FaUser className="text-white text-3xl" />
              </div>
              <h2 className="text-2xl font-bold">{user.username}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                <FaCoins className="text-yellow-500 text-xl mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Budget</p>
                  <p className="font-semibold">₹{user.budget.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                <FaTrophy className="text-indigo-500 text-xl mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Points</p>
                  <p className="font-semibold">{user.points || 0}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                <FaTrophy className="text-purple-500 text-xl mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Rank</p>
                  <p className="font-semibold">#{user.rank || 'N/A'}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-semibold">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Team Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold">Your Team</h3>
                <p className="text-gray-600">
                  {team ? `${team.name} - ${team.players.length} players` : 'No team created yet'}
                </p>
              </div>
              <FaUserFriends className="text-indigo-500 text-2xl" />
            </div>
            
            {team ? (
              <div>
                <p>Team information will be displayed here</p>
                {/* Add team details here when your API supports it */}
              </div>
            ) : (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-700">
                  You haven't created a team yet. Go to the "Select Your Team" page to build your team.
                </p>
              </div>
            )}
          </div>
          
          {/* Recent Activity or Stats */}
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h3 className="text-xl font-bold mb-4">Game Statistics</h3>
            <div className="space-y-4">
              <p className="text-gray-600">
                Your game statistics and performance metrics will appear here as you play.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDataView;