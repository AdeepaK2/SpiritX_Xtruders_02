"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";

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

export default function EditPlayerPage() {
  const router = useRouter();
  const { id } = useParams();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const response = await axios.get(`/api/admin/players/${id}`);
        if (response.data.success) {
          setPlayer(response.data.data);
        } else {
          setError(response.data.error || "Player not found");
        }
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to fetch player");
        console.error("Fetch Player Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPlayer();
    } else {
      setError("Player ID is missing");
      setLoading(false);
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!player) return;

    try {
      const response = await axios.put(`/api/admin/players/${id}`, player);
      if (response.data.success) {
        alert("Player updated successfully!");
        router.push("/admin/players");
      } else {
        setError(response.data.error || "Failed to update player");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update player");
      console.error("Update Player Error:", err);
    }
  };

  if (loading) {
    return <div className="text-center text-lg text-white py-10 animate-pulse">Loading player details...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 text-lg py-10">{error}</div>;
  }

  if (!player) {
    return <div className="text-center text-gray-500 text-lg py-10">Player not found</div>;
  }

  return (
    <div className="p-6 max-w-9xl mx-auto bg-gradient-to-b from-[#e7e5e5] to-[#aeaeed] min-h-screen">
      <h1 className="text-3xl font-bold text-black mb-6">Edit Player</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
          <input
            type="text"
            value={player.name}
            onChange={(e) => setPlayer({ ...player, name: e.target.value })}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">University</label>
          <input
            type="text"
            value={player.university}
            onChange={(e) => setPlayer({ ...player, university: e.target.value })}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            value={player.category}
            onChange={(e) =>
              setPlayer({
                ...player,
                category: e.target.value as "Batsman" | "Bowler" | "All-rounder",
              })
            }
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="Batsman">Batsman</option>
            <option value="Bowler">Bowler</option>
            <option value="All-rounder">All-rounder</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Total Runs</label>
          <input
            type="number"
            value={player.totalRuns}
            onChange={(e) => setPlayer({ ...player, totalRuns: Number(e.target.value) })}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Wickets</label>
          <input
            type="number"
            value={player.wickets}
            onChange={(e) => setPlayer({ ...player, wickets: Number(e.target.value) })}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Player Value</label>
          <input
            type="number"
            value={player.playerValue}
            onChange={(e) => setPlayer({ ...player, playerValue: Number(e.target.value) })}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Player Points</label>
          <input
            type="number"
            value={player.playerPoints}
            onChange={(e) => setPlayer({ ...player, playerPoints: Number(e.target.value) })}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Update Player
        </button>
      </form>
    </div>
  );
}