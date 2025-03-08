'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Player {
  _id: string
  name: string
  category: 'Batsman' | 'Bowler' | 'All-rounder'
  playerValue: number
  playerPoints: number
  university: string
}

// Modify the SpiriterProps interface to include the optional isExpanded prop
interface SpiriterProps {
  selectedPlayers: Player[]
  budget: number
  isExpanded?: boolean // Add this optional prop
}

export default function Spiriter({ selectedPlayers, budget, isExpanded }: SpiriterProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I\'m Spiriter, your cricket team assistant. How can I help you build your dream team?' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([])
  const chatContainerRef = useRef<HTMLDivElement>(null)
  // Use the prop to initialize the state if provided
  const [isMinimized, setIsMinimized] = useState(isExpanded ? false : true)

  // Fetch all available players when component mounts
  useEffect(() => {
    async function fetchPlayers() {
      try {
        const response = await fetch('/api/player')
        const data = await response.json()
        if (data.players) {
          setAvailablePlayers(data.players)
        }
      } catch (error) {
        console.error('Error fetching players:', error)
      }
    }
    
    fetchPlayers()
  }, [])

  // Scroll to bottom of chat whenever messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  // Update minimized state when isExpanded prop changes
  useEffect(() => {
    if (isExpanded !== undefined) {
      setIsMinimized(!isExpanded)
    }
  }, [isExpanded])

  const toggleMinimized = () => {
    setIsMinimized(!isMinimized)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim()) return
    
    // Add user message to chat
    const userMessage = { role: 'user' as const, content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    
    try {
      // Prepare context about available and selected players
      const remainingBudget = budget - selectedPlayers.reduce((sum, p) => sum + p.playerValue, 0)
      const teamComposition = {
        batsmen: selectedPlayers.filter(p => p.category === 'Batsman').length,
        bowlers: selectedPlayers.filter(p => p.category === 'Bowler').length,
        allRounders: selectedPlayers.filter(p => p.category === 'All-rounder').length,
        total: selectedPlayers.length,
        remainingBudget
      }
      
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
      })
      
      if (!response.ok) {
        throw new Error('Failed to get response')
      }
      
      const data = await response.json()
      
      // Add assistant response to chat
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (error) {
      console.error('Error getting recommendation:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error while analyzing your team. Please try again.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isMinimized ? (
        // Minimized chat icon/button
        <button 
          onClick={toggleMinimized}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">S</span>
        </button>
      ) : (
        // Expanded chat window
        <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col w-80 sm:w-96 h-[500px] transition-all duration-300 animate-slideUp">
          <div className="bg-blue-600 text-white p-3 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-2">
                <span className="text-blue-600 font-bold text-lg">S</span>
              </div>
              <h2 className="font-semibold text-lg">Spiriter Assistant</h2>
            </div>
            <button 
              onClick={toggleMinimized}
              className="text-white hover:bg-blue-700 rounded p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 5.25l-7.5 7.5-7.5-7.5m15 6l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          </div>
          
          <div 
            ref={chatContainerRef}
            className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300"
          >
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user' 
                      ? 'bg-blue-500 text-white rounded-tr-none' 
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
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <form onSubmit={handleSendMessage} className="p-3 border-t">
            <div className="flex">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Spiriter for team suggestions..."
                className="flex-1 border rounded-l-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 text-white rounded-r-lg px-4 py-2 hover:bg-blue-700 disabled:bg-blue-300"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}