'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FaUserPlus, FaTrophy, FaUserFriends } from 'react-icons/fa';

interface Player {
  _id: string;
  name: string;
  university: string;
  category: string;
  playerValue: number;
  playerPoints: number;
  totalRuns?: number;
  wickets?: number;
  battingAverage?: number;
  economyRate?: number;
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

const TeamView = () => {
  const params = useParams();
  const userId = params.userId as string;
  
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<Team | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/team?userId=${userId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch team');
        }
        
        if (data.teams && data.teams.length > 0) {
          setTeam(data.teams[0]); // Taking the first team for simplicity
        } else {
          setTeam(null);
        }
      } catch (err) {
        console.error('Error fetching team:', err);
        setError(err instanceof Error ? err.message : 'Failed to load team');
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchTeam();
    }
  }, [userId]);

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

  if (!team) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <FaUserPlus className="mx-auto text-5xl text-indigo-600 mb-4" />
          <h2 className="text-2xl font-bold mb-4">No Team Found</h2>
          <p className="text-gray-600 mb-6">
            You haven't created a team yet. Start by creating your dream team to participate in the fantasy league.
          </p>
          <Link href={`/${userId}/dashboard/select-team`}>
            <span className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors inline-block">
              Create Your Team
            </span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <FaTrophy className="mr-3 text-indigo-600" /> {team.name}
          </h1>
          <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-lg font-medium">
            Team Value: ${(team.totalValue).toLocaleString()}
          </div>
        </div>
        
        <div className="flex items-center mb-6">
          <FaUserFriends className="text-indigo-600 mr-2" />
          <span className="font-medium">{team.players.length} Players</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Team Players</h2>
        
        {team.players.length === 0 ? (
          <p className="text-gray-500">No players in this team yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-indigo-50 text-indigo-900">
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">University</th>
                  <th className="py-3 px-4 text-left">Category</th>
                  <th className="py-3 px-4 text-right">Value</th>
                  <th className="py-3 px-4 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {team.players.map(player => (
                  <tr key={player._id} className="hover:bg-indigo-50/30">
                    <td className="py-3 px-4 font-medium">{player.name}</td>
                    <td className="py-3 px-4">{player.university}</td>
                    <td className="py-3 px-4">{player.category}</td>
                    <td className="py-3 px-4 text-right">${player.playerValue.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">{player.playerPoints.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="mt-6 flex justify-end">
          <Link href={`/${userId}/dashboard/select-team`}>
            <span className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
              {team.players.length > 0 ? 'Edit Team' : 'Add Players'}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeamView;