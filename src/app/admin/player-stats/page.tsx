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
}

const PlayerStats = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch("/api/player");
        if (!response.ok) throw new Error("Failed to load players");
        const data = await response.json();
        if (!Array.isArray(data.players)) throw new Error("Invalid data format");
        setPlayers(data.players);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, []);

  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p className="text-center">Loading players...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="flex">
      <AdminSidebar activeFeature="player-stats" onFeatureSelect={() => {}} /> {/* Sidebar Component */}
      <div className="flex-1 p-6">
      <h2 className="text-2xl font-bold mb-4">Player Stats</h2>
      <input
        type="text"
        placeholder="Search by Name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 mb-4 border rounded-md"
      />
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4 border">Name</th>
              <th className="py-2 px-4 border">University</th>
              <th className="py-2 px-4 border">Category</th>
              <th className="py-2 px-4 border">Total Runs</th>
              <th className="py-2 px-4 border">Wickets</th>
              <th className="py-2 px-4 border">Points</th>
              <th className="py-2 px-4 border">Value</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.length > 0 ? (
              filteredPlayers.map((player) => (
                <tr key={player._id} className="text-center border-b hover:bg-gray-100">
                  <td className="py-2 px-4">{player.name}</td>
                  <td className="py-2 px-4">{player.university}</td>
                  <td className="py-2 px-4">{player.category}</td>
                  <td className="py-2 px-4">{player.totalRuns}</td>
                  <td className="py-2 px-4">{player.wickets}</td>
                  <td className="py-2 px-4">{player.playerPoints}</td>
                  <td className="py-2 px-4">{player.playerValue}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-4">No players found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    </div>

  );
};

export default PlayerStats;
