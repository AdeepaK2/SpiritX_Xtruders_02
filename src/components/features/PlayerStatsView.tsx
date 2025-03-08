import { FaTimes, FaUser, FaRocket, FaBaseballBall, FaChartLine } from 'react-icons/fa';
import { useState, useEffect } from 'react';

// Use the same Player interface from PlayersView
interface Player {
  _id: string;
  name: string;
  university: string;
  category: 'Batsman' | 'Bowler' | 'All-rounder';
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

interface PlayerStatsViewProps {
  player: Player;
  onClose: () => void;
}

const PlayerStatsView = ({ player, onClose }: PlayerStatsViewProps) => {
  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };
  
  // Format currency
  const formatCurrency = (value: number) => {
    return `Rs. ${(value / 1000000).toFixed(2)}M`;
  };
  
  // Format decimal numbers
  const formatDecimal = (num: number) => {
    return num.toFixed(2);
  };
  
  // Calculate percentage (e.g., for charts)
  const calculatePercentage = (value: number, max: number) => {
    return Math.min(Math.round((value / max) * 100), 100);
  };
  
  // Handle closing with escape key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b p-4 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-800">{player.name}</h2>
          <button 
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={onClose}
          >
            <FaTimes className="text-xl" />
          </button>
        </div>
        
        {/* Player Basic Info */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center mb-6">
              <div className="h-20 w-20 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                <FaUser className="text-white text-3xl" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold">{player.name}</h3>
                <p className="text-gray-600">{player.university}</p>
                <span className={`px-3 py-1 mt-2 inline-block text-sm font-semibold rounded-full 
                  ${player.category === 'Batsman' ? 'bg-blue-100 text-blue-800' : 
                    player.category === 'Bowler' ? 'bg-green-100 text-green-800' : 
                    'bg-purple-100 text-purple-800'}`}
                >
                  {player.category}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Value</p>
                <p className="text-lg font-semibold">{formatCurrency(player.playerValue)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Points</p>
                <p className="text-lg font-semibold">{formatDecimal(player.playerPoints)}</p>
              </div>
            </div>
            
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <h4 className="text-lg font-semibold mb-3">Performance Rating</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Overall</span>
                    <span>{calculatePercentage(player.playerPoints, 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${calculatePercentage(player.playerPoints, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                {player.category !== 'Bowler' && (
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Batting</span>
                      <span>{calculatePercentage(player.battingStrikeRate, 200)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${calculatePercentage(player.battingStrikeRate, 200)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {player.category !== 'Batsman' && (
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Bowling</span>
                      <span>{calculatePercentage(10 - player.economyRate, 10)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${calculatePercentage(10 - player.economyRate, 10)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Stats Tables */}
          <div className="space-y-6">
            {/* Batting Stats */}
            {player.category !== 'Bowler' && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-blue-800">Batting Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Runs</p>
                    <p className="text-lg font-semibold">{formatNumber(player.totalRuns)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Balls Faced</p>
                    <p className="text-lg font-semibold">{formatNumber(player.ballsFaced)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Batting Average</p>
                    <p className="text-lg font-semibold">{formatDecimal(player.battingAverage)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Strike Rate</p>
                    <p className="text-lg font-semibold">{formatDecimal(player.battingStrikeRate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Innings Played</p>
                    <p className="text-lg font-semibold">{player.inningsPlayed}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Runs per Inning</p>
                    <p className="text-lg font-semibold">
                      {player.inningsPlayed > 0 ? formatDecimal(player.totalRuns / player.inningsPlayed) : '0.00'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Bowling Stats */}
            {player.category !== 'Batsman' && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-green-800">Bowling Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Wickets</p>
                    <p className="text-lg font-semibold">{player.wickets}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Overs Bowled</p>
                    <p className="text-lg font-semibold">{formatDecimal(player.oversBowled)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Runs Conceded</p>
                    <p className="text-lg font-semibold">{formatNumber(player.runsConceded)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Economy Rate</p>
                    <p className="text-lg font-semibold">{formatDecimal(player.economyRate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Bowling Strike Rate</p>
                    <p className="text-lg font-semibold">
                      {player.bowlingStrikeRate > 0 ? formatDecimal(player.bowlingStrikeRate) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Wickets per Over</p>
                    <p className="text-lg font-semibold">
                      {player.oversBowled > 0 ? formatDecimal(player.wickets / player.oversBowled) : '0.00'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Recent Form & Comparison (optional section) */}
        <div className="p-6 border-t">
          <h3 className="text-lg font-semibold mb-4">Recent Form</h3>
          <p className="text-gray-600 mb-4">Recent performance data will be displayed here in the future.</p>
          
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerStatsView;