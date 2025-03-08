'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { FaTrophy, FaMedal, FaUser, FaSpinner, FaExclamationTriangle, FaSearch, FaSync } from 'react-icons/fa';
import useSWR from 'swr';

interface Player {
  _id: string;
  name: string;
  playerPoints: number;
}

interface Team {
  _id: string;
  name: string;
  userId: string;
  players: Player[];
  totalValue: number;
}

interface User {
  _id: string;
  username: string;
  email: string;
}

interface LeaderboardEntry {
  _id: string;
  username: string;
  teamName: string;
  totalPoints: number;
  rank: number;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

const LeaderboardView = () => {
  const params = useParams();
  const currentUserId = params.userId as string;
  
  const [searchTerm, setSearchTerm] = useState('');

  // Use SWR to fetch and cache data with auto-revalidation
  const { data: usersData, error: usersError, isLoading: usersLoading, mutate: refreshUsers } = 
    useSWR('/api/user', fetcher, { refreshInterval: 30000 }); // Refresh every 30 seconds
  
  const { data: teamsData, error: teamsError, isLoading: teamsLoading, mutate: refreshTeams } = 
    useSWR('/api/team', fetcher, { refreshInterval: 30000 }); // Refresh every 30 seconds
  
  const loading = usersLoading || teamsLoading;
  const error = usersError || teamsError;
  
  // Handle manual refresh
  const handleRefresh = () => {
    refreshUsers();
    refreshTeams();
  };
  
  // Process data and create leaderboard
  let leaderboard: LeaderboardEntry[] = [];
  if (usersData?.users && teamsData?.teams) {
    // Create leaderboard entries
    leaderboard = usersData.users.map((user: User) => {
      // Find user's team
      const userTeam = teamsData.teams.find((team: Team) => team.userId === user._id);
      
      // Calculate total points from team players
      let totalPoints = 0;
      let teamName = "No Team";
      
      if (userTeam) {
        totalPoints = userTeam.players.reduce(
          (sum: number, player: Player) => sum + (player.playerPoints || 0), 
          0
        );
        teamName = userTeam.name;
      }
      
      return {
        _id: user._id,
        username: user.username,
        teamName,
        totalPoints,
        rank: 0 // Will be set after sorting
      };
    });
    
    // Sort by points (descending)
    leaderboard.sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.totalPoints - a.totalPoints);
    
    // Assign ranks
    leaderboard.forEach((entry: LeaderboardEntry, index: number) => {
      entry.rank = index + 1;
    });
  }
  
  // Filter leaderboard based on search term
  const filteredLeaderboard = searchTerm 
    ? leaderboard.filter(entry => 
        entry.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.teamName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : leaderboard;

  // Get rank styles based on position
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case 2:
        return "bg-gray-100 text-gray-800 border-gray-300";
      case 3:
        return "bg-amber-100 text-amber-800 border-amber-300";
      default:
        return "bg-white border-gray-200";
    }
  };

  // Get medal icon based on rank
  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <FaMedal className="text-yellow-500 text-xl" />;
      case 2:
        return <FaMedal className="text-gray-400 text-xl" />;
      case 3:
        return <FaMedal className="text-amber-600 text-xl" />;
      default:
        return <span className="text-gray-500 text-sm font-semibold w-6 inline-block text-center">{rank}</span>;
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <FaSpinner className="animate-spin text-3xl text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-6 bg-red-50 rounded-lg shadow">
          <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">Failed to load leaderboard data</p>
          <button 
            onClick={handleRefresh}
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <FaTrophy className="mr-3 text-yellow-500" /> Fantasy Cricket Leaderboard
        </h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleRefresh}
            className="p-2 bg-indigo-50 rounded-full hover:bg-indigo-100 transition-colors flex items-center gap-2"
            title="Refresh leaderboard"
          >
            <FaSync className="text-indigo-600" />
            <span className="text-sm text-indigo-600">Refresh</span>
          </button>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Search users or teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {leaderboard.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-lg shadow">
          <p className="text-gray-600">No leaderboard data available yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-indigo-50 text-indigo-900">
                <th className="py-3 px-6 text-left">Rank</th>
                <th className="py-3 px-6 text-left">User</th>
                <th className="py-3 px-6 text-left">Team</th>
                <th className="py-3 px-6 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLeaderboard.map((entry) => (
                <tr 
                  key={entry._id} 
                  className={`
                    ${getRankStyle(entry.rank)} 
                    ${entry._id === currentUserId ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : 'border-l-4 border-l-transparent'}
                    hover:bg-indigo-50/40 transition-colors
                  `}
                >
                  <td className="py-4 px-6 flex items-center">
                    {getMedalIcon(entry.rank)}
                  </td>
                  <td className="py-4 px-6 font-medium flex items-center gap-2">
                    {entry._id === currentUserId && (
                      <span className="inline-flex items-center bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded">
                        You
                      </span>
                    )}
                    {entry.username}
                  </td>
                  <td className="py-4 px-6">{entry.teamName}</td>
                  <td className="py-4 px-6 text-right font-semibold">
                    {entry.totalPoints.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredLeaderboard.length === 0 && (
            <div className="text-center p-6">
              <p className="text-gray-500">No results match your search.</p>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-6 bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-bold mb-2">How Points Work</h2>
        <p className="text-gray-600">
          Your total points are calculated based on the performance of the players in your team. 
          Player points are derived from their batting and bowling statistics, including runs scored, 
          wickets taken, economy rate, and batting average.
        </p>
      </div>
    </div>
  );
};

export default LeaderboardView;