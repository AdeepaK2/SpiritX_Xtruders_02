'use client';

import { useState, useEffect } from 'react';
import { FaSort, FaSortUp, FaSortDown, FaSearch, FaInfoCircle, FaPlus, FaEdit, FaTrash, FaTimes, FaCheck } from 'react-icons/fa';
import PlayerStatsView from '@/components/features/PlayerStatsView';

// Define player type based on your API response
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

// New player form data
interface NewPlayerData {
  name: string;
  university: string;
  category: 'Batsman' | 'Bowler' | 'All-rounder';
  totalRuns: number;
  ballsFaced: number;
  inningsPlayed: number;
  wickets: number;
  oversBowled: number;
  runsConceded: number;
}

type SortField = keyof Player | null;
type SortDirection = 'asc' | 'desc';

const AdminPlayersView = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('playerValue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  
  // Admin features state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [newPlayer, setNewPlayer] = useState<NewPlayerData>({
    name: '',
    university: '',
    category: 'Batsman',
    totalRuns: 0,
    ballsFaced: 0,
    inningsPlayed: 0,
    wickets: 0,
    oversBowled: 0,
    runsConceded: 0
  });

  // Fetch players data
  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/player');
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      setPlayers(data.players || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch players');
      console.error('Error fetching players:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPlayers();
  }, []);
  
  // Handle sorting logic
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Sort icon component
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <FaSort className="ml-1 text-gray-400" />;
    return sortDirection === 'asc' ? 
      <FaSortUp className="ml-1 text-indigo-600" /> : 
      <FaSortDown className="ml-1 text-indigo-600" />;
  };
  
  // Filter and sort players
  const filteredAndSortedPlayers = [...players]
    .filter(player => {
      const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           player.university.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || player.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      
      const fieldA = a[sortField];
      const fieldB = b[sortField];
      
      if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Format helpers
  const formatNumber = (num: number) => num.toLocaleString();
  const formatCurrency = (value: number) => `Rs. ${(value / 1000000).toFixed(2)}M`;
  const formatDecimal = (num: number) => num.toFixed(2);

  // Handle player view
  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
  };
  
  // Close modals
  const closePlayerStats = () => setSelectedPlayer(null);
  const closeCreateModal = () => setShowCreateModal(false);
  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setPlayerToDelete(null);
  };

  // Handle player delete confirmation
  const confirmDelete = (player: Player, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click handler
    setPlayerToDelete(player);
    setShowDeleteConfirm(true);
  };

  // Delete player
  const deletePlayer = async () => {
    if (!playerToDelete) return;
    
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/player?id=${playerToDelete._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete player');
      }

      // Refresh player list
      await fetchPlayers();
      closeDeleteConfirm();
      
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error deleting player');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Convert to number if numeric field
    const numericFields = ['totalRuns', 'ballsFaced', 'inningsPlayed', 'wickets', 'oversBowled', 'runsConceded'];
    const newValue = numericFields.includes(name) ? Number(value) : value;
    
    setNewPlayer(prev => ({ ...prev, [name]: newValue }));
  };

  // Create new player
  const handleCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/player', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPlayer),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create player');
      }

      // Reset form & refresh player list
      setNewPlayer({
        name: '',
        university: '',
        category: 'Batsman',
        totalRuns: 0,
        ballsFaced: 0,
        inningsPlayed: 0,
        wickets: 0,
        oversBowled: 0,
        runsConceded: 0
      });
      
      await fetchPlayers();
      setShowCreateModal(false);
      
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error creating player');
    } finally {
      setIsSubmitting(false);
    }
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
          onClick={() => fetchPlayers()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Players Management</h1>
          <p className="text-gray-600">Add, edit, and manage player data</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center"
        >
          <FaPlus className="mr-2" /> Add Player
        </button>
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
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  <span>Player</span>
                  <SortIcon field="name" />
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('university')}
              >
                <div className="flex items-center">
                  <span>University</span>
                  <SortIcon field="university" />
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('playerValue')}
              >
                <div className="flex items-center">
                  <span>Value</span>
                  <SortIcon field="playerValue" />
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('playerPoints')}
              >
                <div className="flex items-center">
                  <span>Points</span>
                  <SortIcon field="playerPoints" />
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedPlayers.length > 0 ? (
              filteredAndSortedPlayers.map((player) => (
                <tr 
                  key={player._id} 
                  className="hover:bg-indigo-50 cursor-pointer transition-colors"
                >
                  <td 
                    className="px-6 py-4 whitespace-nowrap"
                    onClick={() => handlePlayerClick(player)}
                  >
                    <div className="font-medium text-gray-900">{player.name}</div>
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap"
                    onClick={() => handlePlayerClick(player)}
                  >
                    <div className="text-sm text-gray-500">{player.university}</div>
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap"
                    onClick={() => handlePlayerClick(player)}
                  >
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${player.category === 'Batsman' ? 'bg-blue-100 text-blue-800' : 
                        player.category === 'Bowler' ? 'bg-green-100 text-green-800' : 
                        'bg-purple-100 text-purple-800'}`}
                    >
                      {player.category}
                    </span>
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap"
                    onClick={() => handlePlayerClick(player)}
                  >
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(player.playerValue)}</div>
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap"
                    onClick={() => handlePlayerClick(player)}
                  >
                    <div className="text-sm text-gray-900">{formatDecimal(player.playerPoints)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={(e) => confirmDelete(player, e)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete Player"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
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
      {selectedPlayer && (
        <PlayerStatsView player={selectedPlayer} onClose={closePlayerStats} />
      )}

      {/* Create Player Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-bold text-gray-800">Add New Player</h3>
              <button onClick={closeCreateModal} className="text-gray-600 hover:text-gray-800">
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleCreatePlayer} className="p-4">
              {formError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                  {formError}
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Player Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={newPlayer.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">University *</label>
                  <input
                    type="text"
                    name="university"
                    value={newPlayer.university}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    name="category"
                    value={newPlayer.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="Batsman">Batsman</option>
                    <option value="Bowler">Bowler</option>
                    <option value="All-rounder">All-rounder</option>
                  </select>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Performance Statistics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Runs</label>
                    <input
                      type="number"
                      name="totalRuns"
                      value={newPlayer.totalRuns}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Balls Faced</label>
                    <input
                      type="number"
                      name="ballsFaced"
                      value={newPlayer.ballsFaced}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Innings Played</label>
                    <input
                      type="number"
                      name="inningsPlayed"
                      value={newPlayer.inningsPlayed}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Wickets</label>
                    <input
                      type="number"
                      name="wickets"
                      value={newPlayer.wickets}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Overs Bowled</label>
                    <input
                      type="number"
                      name="oversBowled"
                      value={newPlayer.oversBowled}
                      onChange={handleInputChange}
                      min="0"
                      step="0.1"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Runs Conceded</label>
                    <input
                      type="number"
                      name="runsConceded"
                      value={newPlayer.runsConceded}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>Create Player</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && playerToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Delete Player</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold">{playerToDelete.name}</span>? 
              This action cannot be undone.
            </p>
            
            {formError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {formError}
              </div>
            )}
            
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteConfirm}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={deletePlayer}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash className="mr-2" /> Delete Player
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlayersView;