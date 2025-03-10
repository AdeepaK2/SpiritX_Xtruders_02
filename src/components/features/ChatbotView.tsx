'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FaRobot } from 'react-icons/fa';

interface Player {
  _id: string;
  name: string;
  category: 'Batsman' | 'Bowler' | 'All-rounder';
  playerValue: number;
  playerPoints: number;
  university: string;
}

interface Team {
  players: Player[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatbotView = () => {
  const params = useParams();
  const userId = Array.isArray(params.userId) ? params.userId[0] : params.userId ?? '';
  
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [budget, setBudget] = useState(1000000); // Default budget
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I\'m Spiriter, your cricket team assistant. How can I help you build your dream team?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  
  // Fetch team data to get selected players
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/team?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.teams && data.teams.length > 0) {
            setTeam(data.teams[0]);
            
            // Fetch all users and find the one we need
            // This matches your current API structure
            const userResponse = await fetch('/api/user');
            if (userResponse.ok) {
              const userData = await userResponse.json();
              if (userData.users) {
                // Find the user with matching ID
                const currentUser = userData.users.find(
                  (user: any) => user._id === userId
                );
                if (currentUser && currentUser.budget) {
                  setBudget(currentUser.budget);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching team data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchPlayers = async () => {
      try {
        const response = await fetch('/api/player');
        const data = await response.json();
        if (data.players) {
          setAvailablePlayers(data.players);
        }
      } catch (error) {
        console.error('Error fetching players:', error);
      }
    };
    
    if (userId) {
      fetchTeamData();
      fetchPlayers();
    }
  }, [userId]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const selectedPlayers = team?.players || [];
      // Prepare context about available and selected players
      const remainingBudget = budget - selectedPlayers.reduce((sum, p) => sum + p.playerValue, 0);
      const teamComposition = {
        batsmen: selectedPlayers.filter(p => p.category === 'Batsman').length,
        bowlers: selectedPlayers.filter(p => p.category === 'Bowler').length,
        allRounders: selectedPlayers.filter(p => p.category === 'All-rounder').length,
        total: selectedPlayers.length,
        remainingBudget
      };
      
      // Call our API route that will interact with Gemini
      const response = await fetch('/api/spiriter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: input,
          selectedPlayers,
          availablePlayers,
          teamComposition,
          budget,
          remainingBudget
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      
      // Add assistant response to chat
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error getting recommendation:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error while analyzing your team. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col w-full max-w-full overflow-hidden px-2">
      <div className="mb-2">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center">
          <FaRobot className="mr-3 text-indigo-600" />
          Spiriter AI Assistant
        </h1>
        <p className="text-gray-600 text-sm">
          Get help building your cricket team from our AI assistant
        </p>
      </div>
      
      {loading ? (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center flex-1 flex items-center justify-center">
          <div>
            <div className="inline-block w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg text-gray-600">Loading your team data...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-indigo-800 to-purple-700 text-white p-3 flex items-center">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3 shadow-md">
              <span className="text-indigo-700 font-bold text-xl">S</span>
            </div>
            <h2 className="font-semibold text-xl">Spiriter Assistant</h2>
          </div>
          
          {/* Chat Messages - Using flex-1 with overflow-y-auto for internal scrolling */}
          <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-gray-100 text-gray-800 rounded-tl-none'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-100 text-gray-800 rounded-lg rounded-tl-none p-3 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200">
            <div className="flex">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Spiriter for team suggestions..."
                className="flex-1 border border-gray-300 rounded-l-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-r-lg px-6 py-3 hover:from-indigo-700 hover:to-purple-700 disabled:from-indigo-300 disabled:to-purple-300 font-medium transition-all duration-200"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatbotView;