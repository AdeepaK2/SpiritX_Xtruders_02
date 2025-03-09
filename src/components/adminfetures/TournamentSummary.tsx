'use client';

import { useState, useEffect } from 'react';
import { FaUsers, FaShieldAlt, FaTrophy, FaBaseballBall, FaSpinner } from 'react-icons/fa';
import { GiCricketBat } from 'react-icons/gi';

interface PlayerData {
  _id: string;
  name: string;
  university: string;
  totalRuns: number;
  wickets: number;
  playerPoints: number;
} 

interface TournamentStats {
  totalTeams: number;
  totalUsers: number;
  totalRuns: number;
  totalWickets: number;
  highestRunScorer: {
    name: string;
    runs: number;
    university: string;
  } | null;
  highestWicketTaker: {
    name: string;
    wickets: number;
    university: string;
  } | null;
}

const TournamentSummary = () => {
  const [stats, setStats] = useState<TournamentStats>({
    totalTeams: 0,
    totalUsers: 0,
    totalRuns: 0,
    totalWickets: 0,
    highestRunScorer: null,
    highestWicketTaker: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTournamentStats = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch teams
        const teamsResponse = await fetch('/api/team');
        const teamsData = await teamsResponse.json();
        
        // Fetch users
        const usersResponse = await fetch('/api/user');
        const usersData = await usersResponse.json();
        
        // Fetch players
        const playersResponse = await fetch('/api/player');
        const playersData = await playersResponse.json();
        
        // Calculate tournament statistics
        const players = playersData.players || [];
        
        // Calculate total runs and wickets
        let totalRuns = 0;
        let totalWickets = 0;
        let highestRunScorer = { name: '', runs: 0, university: '' };
        let highestWicketTaker = { name: '', wickets: 0, university: '' };
        
        players.forEach((player: PlayerData) => {
          // Add to total runs and wickets
          totalRuns += player.totalRuns || 0;
          totalWickets += player.wickets || 0;
          
          // Check if this player has the highest runs
          if ((player.totalRuns || 0) > highestRunScorer.runs) {
            highestRunScorer = {
              name: player.name,
              runs: player.totalRuns || 0,
              university: player.university
            };
          }
          
          // Check if this player has the highest wickets
          if ((player.wickets || 0) > highestWicketTaker.wickets) {
            highestWicketTaker = {
              name: player.name,
              wickets: player.wickets || 0,
              university: player.university
            };
          }
        });
        
        setStats({
          totalTeams: teamsData.teams?.length || 0,
          totalUsers: usersData.users?.length || 0,
          totalRuns,
          totalWickets,
          highestRunScorer: highestRunScorer.name ? highestRunScorer : null,
          highestWicketTaker: highestWicketTaker.name ? highestWicketTaker : null
        });
        
      } catch (error) {
        console.error('Error fetching tournament statistics:', error);
        setError('Failed to load tournament statistics. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTournamentStats();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <FaSpinner className="animate-spin text-4xl text-indigo-600 mb-4" />
        <p className="text-lg text-gray-600">Loading tournament statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2 text-indigo-900">Tournament Summary</h1>
      <p className="mb-6 text-gray-600">Comprehensive overview of the current tournament statistics.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Teams Stats */}
        <div className="bg-white p-4 rounded-xl shadow-md border border-indigo-100 hover:border-indigo-300 transition-all">
          <div className="flex items-center mb-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <FaShieldAlt className="text-xl text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 ml-3">Teams</h2>
          </div>
          <p className="text-3xl font-bold text-indigo-800">{stats.totalTeams}</p>
          <p className="text-sm text-gray-500 mt-1">Total registered teams</p>
        </div>
        
        {/* Users Stats */}
        <div className="bg-white p-4 rounded-xl shadow-md border border-indigo-100 hover:border-indigo-300 transition-all">
          <div className="flex items-center mb-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <FaUsers className="text-xl text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 ml-3">Users</h2>
          </div>
          <p className="text-3xl font-bold text-purple-800">{stats.totalUsers}</p>
          <p className="text-sm text-gray-500 mt-1">Total registered users</p>
        </div>
        
        {/* Runs Stats */}
        <div className="bg-white p-4 rounded-xl shadow-md border border-indigo-100 hover:border-indigo-300 transition-all">
          <div className="flex items-center mb-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <GiCricketBat className="text-xl text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 ml-3">Total Runs</h2>
          </div>
          <p className="text-3xl font-bold text-blue-800">{stats.totalRuns.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">Runs scored in tournament</p>
        </div>
        
        {/* Wickets Stats */}
        <div className="bg-white p-4 rounded-xl shadow-md border border-indigo-100 hover:border-indigo-300 transition-all">
          <div className="flex items-center mb-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <FaBaseballBall className="text-xl text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 ml-3">Total Wickets</h2>
          </div>
          <p className="text-3xl font-bold text-red-800">{stats.totalWickets}</p>
          <p className="text-sm text-gray-500 mt-1">Wickets taken in tournament</p>
        </div>
      </div>
      
      <h2 className="text-xl font-semibold mb-4 text-indigo-900 mt-8">Top Performers</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Highest Run Scorer */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-xl shadow-md">
          <div className="flex items-center mb-4">
            <div className="bg-amber-200 p-3 rounded-lg">
              <FaTrophy className="text-2xl text-amber-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-bold text-gray-800">Highest Run Scorer</h3>
              <p className="text-sm text-gray-500">Tournament leader</p>
            </div>
          </div>
          
          {stats.highestRunScorer ? (
            <div className="mt-2">
              <p className="text-2xl font-bold text-amber-800">{stats.highestRunScorer.name}</p>
              <p className="text-gray-600">{stats.highestRunScorer.university}</p>
              <div className="flex items-center mt-2">
                <GiCricketBat className="text-amber-700 mr-2" />
                <p className="text-lg font-semibold">{stats.highestRunScorer.runs} runs</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 italic">No data available</p>
          )}
        </div>
        
        {/* Highest Wicket Taker */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 rounded-xl shadow-md">
          <div className="flex items-center mb-4">
            <div className="bg-emerald-200 p-3 rounded-lg">
              <FaTrophy className="text-2xl text-emerald-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-bold text-gray-800">Highest Wicket Taker</h3>
              <p className="text-sm text-gray-500">Tournament leader</p>
            </div>
          </div>
          
          {stats.highestWicketTaker ? (
            <div className="mt-2">
              <p className="text-2xl font-bold text-emerald-800">{stats.highestWicketTaker.name}</p>
              <p className="text-gray-600">{stats.highestWicketTaker.university}</p>
              <div className="flex items-center mt-2">
                <FaBaseballBall className="text-emerald-700 mr-2" />
                <p className="text-lg font-semibold">{stats.highestWicketTaker.wickets} wickets</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 italic">No data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentSummary;