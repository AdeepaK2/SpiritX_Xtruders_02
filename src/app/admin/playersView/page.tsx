"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FaSort, FaSortUp, FaSortDown, FaSearch, FaTimes, FaInfoCircle } from "react-icons/fa";
import PlayerStatsView from "@/components/features/PlayerStatsView"; // Ensure this component exists
import { Pencil, Trash2 } from "lucide-react";

interface Player {
  _id: string;
  name: string;
  university: string;
  category: "Batsman" | "Bowler" | "All-rounder";
  totalRuns: number;
  ballsFaced: number;
  inningsPlayed: number;
  wickets: number;
  oversBowled: number;
  runsConceded: number;
  battingStrikeRate: number;
  battingAverage: number;
  bowlingStrikeRate: number;
  economyRate: number;
  playerPoints: number;
  playerValue: number;
}

type SortField = keyof Player | null;
type SortDirection = "asc" | "desc";

export default function AdminPlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("playerValue");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const router = useRouter();
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/admin/players");
      setPlayers(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch players");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this player?")) return;

    setDeleteLoading(id);
    try {
      await axios.delete(`/api/admin/players/${id}`);
      setPlayers((prev) => prev.filter((player) => player._id !== id)); // Optimistic update
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete player");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <FaSort className="ml-1 text-gray-400" />;
    return sortDirection === "asc" ? (
      <FaSortUp className="ml-1 text-indigo-600" />
    ) : (
      <FaSortDown className="ml-1 text-indigo-600" />
    );
  };

  const filteredAndSortedPlayers = [...players]
    .filter((player) => {
      const matchesSearch =
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.university.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || player.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      const fieldA = a[sortField];
      const fieldB = b[sortField];
      if (fieldA < fieldB) return sortDirection === "asc" ? -1 : 1;
      if (fieldA > fieldB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatCurrency = (value: number) => {
    return `Rs. ${(value / 1000000).toFixed(2)}M`;
  };

  const formatDecimal = (num: number) => {
    return num.toFixed(2);
  };

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
  };

  const closePlayerStats = () => {
    setSelectedPlayer(null);
  };

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
        <h3 className="text-lg font-medium text-red-800">Error loading players</h3>
        <p className="text-red-700">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full p-6 bg-gradient-to-b from-[#e7e5e5] to-[#d7d7db] min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Players Management</h1>
        <p className="text-gray-600">View and manage all players</p>
        <p className="text-sm text-indigo-600 mt-2 flex items-center">
          <FaInfoCircle className="mr-1" /> Click each player to view their full stats
        </p>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="relative w-full md:w-64">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search players..."
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Categories</option>
            <option value="Batsman">Batsmen</option>
            <option value="Bowler">Bowlers</option>
            <option value="All-rounder">All-rounders</option>
          </select>
        </div>
      </div>

      {/* Players table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center">
                  <span>Player</span>
                  <SortIcon field="name" />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("university")}
              >
                <div className="flex items-center">
                  <span>University</span>
                  <SortIcon field="university" />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Category
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("playerValue")}
              >
                <div className="flex items-center">
                  <span>Value</span>
                  <SortIcon field="playerValue" />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("playerPoints")}
              >
                <div className="flex items-center">
                  <span>Points</span>
                  <SortIcon field="playerPoints" />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("battingAverage")}
              >
                <div className="flex items-center">
                  <span>Batting Avg</span>
                  <SortIcon field="battingAverage" />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("bowlingStrikeRate")}
              >
                <div className="flex items-center">
                  <span>Bowling SR</span>
                  <SortIcon field="bowlingStrikeRate" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedPlayers.length > 0 ? (
              filteredAndSortedPlayers.map((player) => (
                <tr
                  key={player._id}
                  className="hover:bg-indigo-50 hover:shadow-sm cursor-pointer transition-colors"
                  onClick={() => handlePlayerClick(player)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{player.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{player.university}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${player.category === "Batsman"
                          ? "bg-blue-100 text-blue-800"
                          : player.category === "Bowler"
                          ? "bg-green-100 text-green-800"
                          : "bg-purple-100 text-purple-800"}`}
                    >
                      {player.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(player.playerValue)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDecimal(player.playerPoints)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDecimal(player.battingAverage)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {player.bowlingStrikeRate > 0 ? formatDecimal(player.bowlingStrikeRate) : "-"}
                    </div>
                  </td>
<td className="px-6 py-4 whitespace-nowrap">
  <div className="flex gap-2">
    <button
      onClick={() => router.push(`/admin/playersView/edit/${player._id}`)}
      className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition shadow-md flex items-center"
      title="Edit"
    >
      <Pencil size={18} />
    </button>
    <button
      onClick={() => handleDelete(player._id)}
      className={`p-2 rounded-md ${
        deleteLoading === player._id
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-red-500 hover:bg-red-600"
      } text-white transition shadow-md flex items-center`}
      disabled={deleteLoading === player._id}
      title="Delete"
    >
      {deleteLoading === player._id ? "..." : <Trash2 size={18} />}
    </button>
  </div>
</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No players found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Total players count */}
      <div className="mt-4 text-sm text-gray-600">
        Total: {filteredAndSortedPlayers.length} players
      </div>

      {/* Player Stats Modal */}
      {selectedPlayer && <PlayerStatsView player={selectedPlayer} onClose={closePlayerStats} />}
    </div>
  );
}