'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Spiriter from '@/components/Spiriter'

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
  username: string
  budget: number
}

// Component for displaying individual player cards
const PlayerCard = ({ player, isSelected, onToggleSelect, disabled }: { 
  player: Player, 
  isSelected: boolean, 
  onToggleSelect: () => void,
  disabled: boolean
}) => {
  return (
    <div className={`border rounded-lg p-4 ${isSelected ? 'bg-green-100 border-green-500' : 'bg-white'}`}>
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">{player.name}</h3>
        <span className={`px-2 py-1 rounded text-sm ${
          player.category === 'Batsman' ? 'bg-blue-100 text-blue-800' : 
          player.category === 'Bowler' ? 'bg-red-100 text-red-800' : 
          'bg-purple-100 text-purple-800'
        }`}>
          {player.category}
        </span>
      </div>
      <p className="text-gray-600 text-sm">{player.university}</p>
      <div className="flex justify-between mt-2">
        <p className="text-gray-800">₹{(player.playerValue).toLocaleString()}</p>
        <p className="text-gray-800">Points: {player.playerPoints.toFixed(1)}</p>
      </div>
      <div className="mt-3">
        <button
          onClick={onToggleSelect}
          disabled={disabled && !isSelected}
          className={`w-full py-1 px-2 rounded ${
            isSelected 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : disabled 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {isSelected ? 'Remove' : 'Add to Team'}
        </button>
      </div>
    </div>
  )
}

// Component for budget display
const BudgetDisplay = ({ total, used }: { total: number, used: number }) => {
  const remaining = total - used
  const percentUsed = (used / total) * 100
  
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h2 className="text-lg font-semibold mb-2">Budget</h2>
      <div className="flex justify-between mb-1">
        <span>Total: ₹{total.toLocaleString()}</span>
        <span>Remaining: ₹{remaining.toLocaleString()}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full ${
            percentUsed > 90 ? 'bg-red-500' : 
            percentUsed > 70 ? 'bg-yellow-500' : 'bg-green-500'
          }`} 
          style={{ width: `${percentUsed}%` }}>
        </div>
      </div>
    </div>
  )
}

// Main page component
export default function SelectTeamPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.userId as string
  
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
  const [existingTeam, setExistingTeam] = useState<any>(null)

  // Calculate used budget
  const usedBudget = selectedPlayers.reduce((sum, player) => sum + player.playerValue, 0)
  
  // Fetch players, user data, and check for existing teams
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch players
        const playersRes = await fetch('/api/player')
        const playersData = await playersRes.json()
        
        // Fetch user to get budget
        const userRes = await fetch(`/api/user?id=${userId}`)
        const userData = await userRes.json()
        
        // Check if user already has a team
        const teamRes = await fetch(`/api/team?userId=${userId}`)
        const teamData = await teamRes.json()
        
        if (playersData.players) {
          setPlayers(playersData.players)
        }
        
        if (userData.users && userData.users.length > 0) {
          setUser(userData.users[0])
        }
        
        if (teamData.teams && teamData.teams.length > 0) {
          setExistingTeam(teamData.teams[0])
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load data. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [userId])

  // Toggle player selection
  const togglePlayerSelection = (player: Player) => {
    if (selectedPlayers.some(p => p._id === player._id)) {
      setSelectedPlayers(selectedPlayers.filter(p => p._id !== player._id))
    } else {
      // Check if adding would exceed budget
      const newTotal = usedBudget + player.playerValue
      if (user && newTotal > user.budget) {
        setError('Adding this player would exceed your budget')
        setTimeout(() => setError(''), 3000)
        return
      }
      
      // Check if team size is already 11
      if (selectedPlayers.length >= 11) {
        setError('Your team can have a maximum of 11 players')
        setTimeout(() => setError(''), 3000)
        return
      }
      
      setSelectedPlayers([...selectedPlayers, player])
    }
  }
  
  // Filter players
  const filteredPlayers = players.filter(player => {
    const nameMatch = player.name.toLowerCase().includes(filter.toLowerCase())
    const categoryMatch = categoryFilter === 'all' || player.category.toLowerCase() === categoryFilter.toLowerCase()
    return nameMatch && categoryMatch
  })

  // Create team
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
    
    try {
      const response = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: teamName,
          userId: userId,
          players: selectedPlayers.map(p => p._id),
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create team')
      }
      
      // Show success message
      setSuccess(`Team "${teamName}" created successfully!`)
      
      // Redirect to team dashboard after a short delay
      setTimeout(() => {
        router.push(`/${userId}/dashboard`)
      }, 2000)
      
    } catch (err: any) {
      console.error('Error creating team:', err)
      setError(err.message || 'Failed to create team')
      setTimeout(() => setError(''), 3000)
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
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Create Your Dream Team</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      {existingTeam && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold">You already have a team: {existingTeam.name}</p>
              <p>Creating a new team will replace your existing one.</p>
            </div>
            <button 
              onClick={() => router.push(`/${userId}/dashboard`)}
              className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
            >
              View Your Team
            </button>
          </div>
        </div>
      )}
      
      {user && (
        <BudgetDisplay total={user.budget} used={usedBudget} />
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selected Players Panel */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow p-4">
          <form onSubmit={handleCreateTeam}>
            <h2 className="text-xl font-semibold mb-4">Your Team</h2>
            
            <div className="mb-4">
              <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
                Team Name
              </label>
              <input
                type="text"
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter team name"
              />
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Selected Players ({selectedPlayers.length}/11)</h3>
              
              {selectedPlayers.length === 0 ? (
                <p className="text-gray-500 italic">No players selected yet</p>
              ) : (
                <div className="space-y-2">
                  {selectedPlayers.map(player => (
                    <div key={player._id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{player.name}</p>
                        <p className="text-sm text-gray-600">₹{player.playerValue.toLocaleString()}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => togglePlayerSelection(player)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  
                  <div className="border-t pt-2 mt-4">
                    <div className="flex justify-between font-semibold">
                      <span>Total Value:</span>
                      <span>₹{usedBudget.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <button
              type="submit"
              disabled={creatingTeam}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md disabled:bg-blue-300"
            >
              {creatingTeam ? 'Creating...' : 'Create Team'}
            </button>
          </form>
        </div>
        
        {/* Available Players Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 className="text-xl font-semibold mb-4">Available Players</h2>
            
            <div className="mb-4 flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search players..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="all">All Categories</option>
                  <option value="batsman">Batsmen</option>
                  <option value="bowler">Bowlers</option>
                  <option value="all-rounder">All-rounders</option>
                </select>
              </div>
            </div>
            
            {filteredPlayers.length === 0 ? (
              <p className="text-gray-500 italic">No players found</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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