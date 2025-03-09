'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Spiriter from '@/components/Spiriter'
import { FaMoneyBillWave, FaUsers, FaTrophy, FaSearch, FaFilter, FaUserPlus, FaInfoCircle } from 'react-icons/fa'

// Types
interface Player {
  _id: string
  name: string
  university: string
  category: 'Batsman' | 'Bowler' | 'All-rounder'
  playerValue: number
  playerPoints: number
  battingAverage?: number
  bowlingStrikeRate?: number
  economyRate?: number
}

interface User {
  _id: string
  username: string
  email: string
  budget: number
  accountCreationDate: string
  lastLoginDate: string
}

interface Team {
  _id: string
  name: string
  userId: string
  players: Player[]
  totalValue: number
  createdAt: string
  updatedAt: string
}

// Improved budget display component with animation
const EnhancedBudgetDisplay = ({ total, used }: { total: number, used: number }) => {
  const remaining = total - used
  const percentUsed = (used / total) * 100

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl shadow-lg mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center mb-2">
            <FaMoneyBillWave className="mr-2" />
            Your Budget
          </h2>
          <p className="text-sm opacity-80">Manage your team's finances wisely</p>
        </div>

        <div className="mt-4 md:mt-0">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs uppercase tracking-wide opacity-80">Total Budget</p>
              <p className="text-2xl font-bold">₹{total.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide opacity-80">Remaining</p>
              <p className={`text-2xl font-bold ${remaining < total * 0.1 ? 'text-red-300' : ''}`}>
                ₹{remaining.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-xs mb-1">
          <span>0%</span>
          <span>{percentUsed.toFixed(1)}% used</span>
          <span>100%</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              percentUsed > 90 ? 'bg-red-400' : 
              percentUsed > 70 ? 'bg-yellow-300' : 'bg-green-400'
            }`} 
            style={{ width: `${percentUsed}%` }} />
        </div>
      </div>
    </div>
  )
}

// Enhanced player card component
const PlayerCard = ({ player, isSelected, onToggleSelect, disabled }: { 
  player: Player, 
  isSelected: boolean, 
  onToggleSelect: () => void,
  disabled: boolean
}) => {
  return (
    <div 
      className={`border rounded-lg overflow-hidden transition-all duration-300 flex flex-col h-full ${
        isSelected 
          ? 'bg-green-50 border-green-500 shadow-md shadow-green-100' 
          : 'bg-white hover:shadow-md'
      }`}
    >
      <div className="p-4 flex-grow">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg truncate max-w-[70%]">{player.name}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
            player.category === 'Batsman' ? 'bg-blue-100 text-blue-800' : 
            player.category === 'Bowler' ? 'bg-red-100 text-red-800' : 
            'bg-purple-100 text-purple-800'
          }`}>
            {player.category}
          </span>
        </div>

        <p className="text-gray-600 text-sm mt-1 truncate">{player.university}</p>

        <div className="mt-3 bg-gray-50 p-2 rounded-md">
          <div className="text-sm text-gray-600">Value:</div>
          <div className="text-xl font-bold text-gray-800">₹{player.playerValue.toLocaleString()}</div>
        </div>

        {/* Player stats - more consistent layout */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className={`p-2 rounded ${player.battingAverage ? 'bg-blue-50' : 'bg-gray-50'}`}>
            <span className={`block ${player.battingAverage ? 'text-blue-700' : 'text-gray-500'}`}>
              Batting Avg
            </span>
            <span className="font-medium">
              {player.battingAverage || 'Not Defined'}
            </span>
          </div>
          <div className={`p-2 rounded ${player.bowlingStrikeRate ? 'bg-red-50' : 'bg-gray-50'}`}>
            <span className={`block ${player.bowlingStrikeRate ? 'text-red-700' : 'text-gray-500'}`}>
              Strike Rate
            </span>
            <span className="font-medium">
              {player.bowlingStrikeRate || 'Not Defined'}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={onToggleSelect}
        disabled={disabled && !isSelected}
        className={`w-full py-2 px-2 font-medium text-center transition-colors mt-auto ${
          isSelected 
            ? 'bg-red-500 text-white hover:bg-red-600' 
            : disabled 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-green-500 text-white hover:bg-green-600'
        }`}
      >
        {isSelected ? 'Remove from Team' : 'Add to Team'}
      </button>
    </div>
  )
}

// Team stats component
const TeamStats = ({ selectedPlayers }: { selectedPlayers: Player[] }) => {
  const batsmen = selectedPlayers.filter(p => p.category === 'Batsman').length
  const bowlers = selectedPlayers.filter(p => p.category === 'Bowler').length
  const allRounders = selectedPlayers.filter(p => p.category === 'All-rounder').length

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h3 className="text-lg font-medium mb-3">Team Composition</h3>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-blue-50 p-3 rounded">
          <span className="block text-lg font-bold text-blue-700">{batsmen}</span>
          <span className="text-sm text-blue-600">Batsmen</span>
        </div>
        <div className="bg-red-50 p-3 rounded">
          <span className="block text-lg font-bold text-red-700">{bowlers}</span>
          <span className="text-sm text-red-600">Bowlers</span>
        </div>
        <div className="bg-purple-50 p-3 rounded">
          <span className="block text-lg font-bold text-purple-700">{allRounders}</span>
          <span className="text-sm text-purple-600">All-rounders</span>
        </div>
      </div>

      <div className="mt-3 text-center">
        <div className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm">
          {selectedPlayers.length}/11 Players
        </div>
      </div>
    </div>
  )
}

export default function SelectTeamPage() {
  const params = useParams()
  const router = useRouter()
  const userId = Array.isArray(params.userId) ? params.userId[0] : params.userId ?? ''
  
  const [loading, setLoading] = useState(true)
  const [players, setPlayers] = useState<Player[]>([])
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [teamName, setTeamName] = useState('')
  const [filter, setFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [creatingTeam, setCreatingTeam] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [existingTeam, setExistingTeam] = useState<Team | null>(null)

  // Calculate used budget
  const usedBudget = selectedPlayers.reduce((sum, player) => sum + player.playerValue, 0)
  
  // Fetch players, user data, and check for existing teams
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch players
        const playersRes = await fetch('/api/player')
        if (!playersRes.ok) throw new Error('Failed to load players')
        const playersData = await playersRes.json()
        
        // Fetch user data with the correct API format
        const userRes = await fetch(`/api/user?id=${userId}`)
        if (!userRes.ok) throw new Error('Failed to load user data')
        const userData = await userRes.json()
        
        // Check for existing team
        const teamRes = await fetch(`/api/team?userId=${userId}`)
        if (!teamRes.ok) throw new Error('Failed to check existing team')
        const teamData = await teamRes.json()
        
        console.log('Player data:', playersData)
        console.log('User data:', userData)
        console.log('Team data:', teamData)
        
        if (playersData.players) {
          setPlayers(playersData.players)
        }
        
        if (userData.user) {
          setUser(userData.user)
        }
        
        // If user has an existing team
        if (teamData.teams && teamData.teams.length > 0) {
          const team = teamData.teams[0]
          setExistingTeam(team)
          setTeamName(team.name)
          
          // The team.players from the API should already be populated
          if (team.players && Array.isArray(team.players)) {
            setSelectedPlayers(team.players)
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load data. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    
    if (userId) {
      fetchData()
    }
  }, [userId])

  // Toggle player selection
  const togglePlayerSelection = (player: Player) => {
    setSelectedPlayers(prev => {
      if (prev.some(p => p._id === player._id)) {
        // Remove player if already selected
        return prev.filter(p => p._id !== player._id)
      } else {
        // Add player if not already selected
        
        // Check if adding would exceed budget
        const newTotal = usedBudget + player.playerValue
        if (user && newTotal > user.budget) {
          setError(`Adding ${player.name} would exceed your budget`)
          setTimeout(() => setError(''), 3000)
          return prev
        }
        
        // Check if team size is already 11
        if (prev.length >= 11) {
          setError('Your team can have a maximum of 11 players')
          setTimeout(() => setError(''), 3000)
          return prev
        }
        
        return [...prev, player]
      }
    })
  }
  
  // Filter players
  const filteredPlayers = players.filter(player => {
    const nameMatch = player.name.toLowerCase().includes(filter.toLowerCase())
    const categoryMatch = categoryFilter === 'all' || player.category.toLowerCase() === categoryFilter.toLowerCase()
    return nameMatch && categoryMatch
  })

  // Create or update team
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!teamName.trim()) {
      setError('Please enter a team name')
      setTimeout(() => setError(''), 3000)
      return
    }
    
    if (selectedPlayers.length < 1) {
      setError('Please select at least one player')
      setTimeout(() => setError(''), 3000)
      return
    }
    
    setCreatingTeam(true)
    setError('')
    
    try {
      // Prepare data for API
      const teamData = {
        name: teamName.trim(),
        userId,
        players: selectedPlayers.map(p => p._id)
      }
      
      // If updating existing team, use POST with existing team ID
      const apiMethod = existingTeam ? 'POST' : 'POST'
      const apiUrl = '/api/team'
      
      // If there's an existing team, include its ID for updates
      if (existingTeam) {
        Object.assign(teamData, { _id: existingTeam._id })
      }
      
      const response = await fetch(apiUrl, {
        method: apiMethod,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save team')
      }
      
      // Show success message
      setSuccess(`Team "${teamName}" ${existingTeam ? 'updated' : 'created'} successfully!`)
      
      // Redirect to team dashboard after a short delay
      setTimeout(() => {
        router.push(`/${userId}/dashboard/team`)
      }, 2000)
      
    } catch (err: any) {
      console.error('Error saving team:', err)
      setError(err.message || 'Failed to save team')
    } finally {
      setCreatingTeam(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 md:mb-0">
          <FaUsers className="inline-block mr-2 text-blue-600" />
          Create Your Dream Team
        </h1>
        
        {user && (
          <div className="bg-blue-50 border-l-4 border-blue-500 py-2 px-3 rounded">
            <div className="flex items-center">
              <FaMoneyBillWave className="text-blue-500 mr-2" />
              <span className="font-medium">Your Budget: </span>
              <span className="ml-1 font-bold text-blue-700">₹{user.budget.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-start">
          <FaInfoCircle className="mr-2 mt-1 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
          <FaTrophy className="mr-2" />
          <span>{success}</span>
        </div>
      )}
      
      {existingTeam && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <p className="font-bold">You already have a team: {existingTeam.name}</p>
              <p>Creating a new team will replace your existing one.</p>
            </div>
            <button 
              onClick={() => router.push(`/${userId}/dashboard/team`)}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mt-2 sm:mt-0"
            >
              View Your Team
            </button>
          </div>
        </div>
      )}
      
      {/* Enhanced budget display at the top */}
      {user && (
        <EnhancedBudgetDisplay total={user.budget} used={usedBudget} />
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selected Players Panel */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-4 sticky top-4">
            <form onSubmit={handleCreateTeam}>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaUserPlus className="text-green-600 mr-2" />
                Your Team
              </h2>
              
              <div className="mb-4">
                <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter team name"
                />
              </div>
              
              {/* Team stats component */}
              <TeamStats selectedPlayers={selectedPlayers} />
              
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  Selected Players <span className="ml-2 bg-blue-100 text-blue-800 text-xs py-1 px-2 rounded-full">{selectedPlayers.length}/11</span>
                </h3>
                
                {selectedPlayers.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500 mb-2">No players selected yet</p>
                    <p className="text-sm text-gray-400">Select players from the available list</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {selectedPlayers.map(player => (
                      <div key={player._id} className="flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors">
                        <div>
                          <div className="flex items-center">
                            <span className={`w-2 h-2 rounded-full mr-2 ${
                              player.category === 'Batsman' ? 'bg-blue-500' : 
                              player.category === 'Bowler' ? 'bg-red-500' : 'bg-purple-500'
                            }`}></span>
                            <p className="font-medium">{player.name}</p>
                          </div>
                          <p className="text-sm text-gray-600 mt-0.5">₹{player.playerValue.toLocaleString()}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => togglePlayerSelection(player)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between font-semibold">
                        <span>Total Value:</span>
                        <span>₹{usedBudget.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600 mt-1">
                        <span>Remaining Budget:</span>
                        <span>₹{user ? (user.budget - usedBudget).toLocaleString() : 0}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <button
                type="submit"
                disabled={creatingTeam}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-md disabled:bg-blue-300 font-medium transition-colors flex items-center justify-center"
              >
                {creatingTeam ? (
                  <>
                    <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                    Processing...
                  </>
                ) : (
                  existingTeam ? 'Update Team' : 'Create Team'
                )}
              </button>
            </form>
          </div>
        </div>
        
        {/* Available Players Panel */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Available Players</h2>
            
            <div className="mb-6 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search players by name..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="sm:w-48">
                <div className="relative">
                  <FaFilter className="absolute left-3 top-3 text-gray-400" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  >
                    <option value="all">All Categories</option>
                    <option value="batsman">Batsmen</option>
                    <option value="bowler">Bowlers</option>
                    <option value="all-rounder">All-rounders</option>
                  </select>
                </div>
              </div>
            </div>
            
            {filteredPlayers.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500 mb-2">No players found</p>
                <p className="text-sm text-gray-400">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredPlayers.map(player => (
                  <PlayerCard
                    key={player._id}
                    player={player}
                    isSelected={selectedPlayers.some(p => p._id === player._id)}
                    onToggleSelect={() => togglePlayerSelection(player)}
                    disabled={
                      !selectedPlayers.some(p => p._id === player._id) &&
                      (user && (usedBudget + player.playerValue > user.budget) || selectedPlayers.length >= 11)
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Floating Spiriter chatbot - appears on every page */}
      {!loading && user && (
        <Spiriter 
          selectedPlayers={selectedPlayers} 
          budget={user.budget} 
        />
      )}
    </div>
  )
}
