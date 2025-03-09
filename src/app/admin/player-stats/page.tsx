"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/adminfetures/AdminSidebar";

interface Player {
  _id: string;
  name: string;
  university: string;
  category: "Batsman" | "Bowler" | "All-rounder";
  totalRuns: number;
  inningsPlayed: number;
  wickets: number;
  oversBowled: number;
  runsConceded: number;
  playerPoints: number;
  playerValue: number;
  battingAvg?: number;
}

type SortField = 'name' | 'university' | 'category' | 'playerValue' | 'playerPoints' | 'battingAvg';
type SortDirection = 'asc' | 'desc';

const PlayerStats = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch("/api/player");
        if (!response.ok) throw new Error("Failed to load players");
        const data = await response.json();
        if (!Array.isArray(data.players)) throw new Error("Invalid data format");
        
        // Calculate batting average for each player
        const playersWithStats = data.players.map((player: Player) => ({
          ...player,
          battingAvg: player.inningsPlayed > 0 
            ? Number((player.totalRuns / player.inningsPlayed).toFixed(2)) 
            : 0
        }));
        
        setPlayers(playersWithStats);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, []);

  const sortPlayers = (a: Player, b: Player) => {
    let comparison = 0;
    
    switch(sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'university':
        comparison = a.university.localeCompare(b.university);
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
      case 'playerValue':
        comparison = a.playerValue - b.playerValue;
        break;
      case 'playerPoints':
        comparison = a.playerPoints - b.playerPoints;
        break;
      case 'battingAvg':
        comparison = (a.battingAvg || 0) - (b.battingAvg || 0);
        break;
      default:
        comparison = 0;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const filteredPlayers = players
    .filter((player) => {
      const nameMatch = player.name.toLowerCase().includes(search.toLowerCase());
      const categoryMatch = selectedCategory === "All Categories" || player.category === selectedCategory;
      return nameMatch && categoryMatch;
    })
    .sort(sortPlayers);

  const togglePlayerSelection = (playerId: string) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
    } else {
      if (selectedPlayers.length < 11) {
        setSelectedPlayers([...selectedPlayers, playerId]);
      }
    }
  };

  if (loading) return <p className="text-center p-8">Loading players...</p>;
  if (error) return <p className="text-center text-red-500 p-8">{error}</p>;

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar activeFeature="player-stats" onFeatureSelect={() => {}} />
      
      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow p-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="text-purple-800 font-medium">Team Status: {selectedPlayers.length}/11 players selected</div>
            <div className="ml-4 bg-gray-200 h-2 rounded-full w-48">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ width: `${(selectedPlayers.length / 11) * 100}%` }} 
              ></div>
            </div>
          </div>
          <button 
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            disabled={selectedPlayers.length !== 11}
          >
            Create Team
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Player Stats</h1>
          <p className="text-gray-600 mb-2">View and analyze all players statistics</p>
          <p className="text-purple-600 mb-4">ℹ️ Click each player to view their full stats</p>
          
          <div className="flex justify-between mb-6">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search players..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option>All Categories</option>
              <option>Batsman</option>
              <option>Bowler</option>
              <option>All-rounder</option>
            </select>
          </div>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      Player {getSortIcon('name')}
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('university')}
                    >
                      University {getSortIcon('university')}
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('category')}
                    >
                      Category {getSortIcon('category')}
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('playerValue')}
                    >
                      Value {getSortIcon('playerValue')}
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('playerPoints')}
                    >
                      Points {getSortIcon('playerPoints')}
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('battingAvg')}
                    >
                      Batting Avg {getSortIcon('battingAvg')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPlayers.map((player) => (
                    <tr 
                      key={player._id} 
                      className={`hover:bg-gray-50 cursor-pointer ${selectedPlayers.includes(player._id) ? 'bg-indigo-50' : ''}`}
                      onClick={() => togglePlayerSelection(player._id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{player.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{player.university}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {player.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Rs. {(player.playerValue / 1000000).toFixed(2)}M
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {player.playerPoints.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {player.battingAvg?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerStats;