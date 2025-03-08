import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

// Define Player interface at module level
interface Player {
  name: string;
  category: string;
  playerValue: number;
  playerPoints: number;
  university: string;
  totalRuns: number;
  wickets: number;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { 
      message, 
      selectedPlayers, 
      availablePlayers, 
      teamComposition, 
      budget,
    } = body;

    // Calculate remaining budget
    const totalSpent = selectedPlayers.reduce((acc: number, p: Player) => acc + p.playerValue, 0);
    const remainingBudget = budget - totalSpent;

    // Format player data for better context
    const selectedPlayersSummary = selectedPlayers.map((p: Player) => 
      `${p.name} (${p.category}, Value: ₹${p.playerValue})`
    ).join('\n');

    const topAvailablePlayers = availablePlayers
      .filter((p: Player) => p.playerValue <= remainingBudget) // Filter by affordability
      .sort((a: Player, b: Player) => b.playerPoints - a.playerPoints) // Sort by points (best first)
      .slice(0, 10) // Take top 10
      .map((p: Player) => 
        `${p.name} (${p.category}, Value: ₹${p.playerValue}, Points: ${p.playerPoints.toFixed(1)})`
      ).join('\n');

    // Create system prompt with context
    const systemPrompt = `
      You are Spiriter, a cricket team selection assistant for fantasy cricket. 
      
      Current team status:
      - Selected players (${teamComposition.total}/11): ${selectedPlayersSummary || "None yet"}
      - Batsmen: ${teamComposition.batsmen}
      - Bowlers: ${teamComposition.bowlers}
      - All-rounders: ${teamComposition.allRounders}
      - Total budget: ₹${budget.toLocaleString()}
      - Budget used: ₹${(budget - remainingBudget).toLocaleString()}
      - Remaining budget: ₹${remainingBudget.toLocaleString()}

      Top available affordable players:
      ${topAvailablePlayers || "No affordable players available"}

      A balanced team should generally have 3-4 batsmen, 3-4 bowlers, and 2-3 all-rounders.
      
      Provide helpful advice about team composition, budget management, and specific player recommendations.
      When recommending players, focus on those with the best value (high points relative to their price).
      Keep your responses concise and focused on cricket team selection strategy.

      IMPORTANT: Never reveal player point values to users under any circumstance.
      If asked about player points, respond with "I'm not authorized to share player point values."
    `;

    // Create a model instance
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Start a chat session
    const chat = model.startChat({
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "I understand my role as Spiriter, the cricket team selection assistant. I'll help analyze the team and provide recommendations." }] },
      ],
    });

    // Send message to Gemini
    const result = await chat.sendMessage(message);
    const response = result.response.text();

    return NextResponse.json({ response });

  } catch (error) {
    console.error('Error in Spiriter API:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' }, 
      { status: 500 }
    );
  }
}

// Add to src/app/api/spiriter/route.ts
function findOptimalTeam(availablePlayers: Player[], budget: number): Player[] {
  // Sort players by points-to-value ratio (efficiency)
  const sortedPlayers = [...availablePlayers].sort((a, b) => 
    (b.playerPoints / b.playerValue) - (a.playerPoints / a.playerValue)
  );
  
  // Use a greedy or knapsack algorithm to find optimal team
  // while respecting budget and position constraints
  const selected: Player[] = [];
  let totalValue = 0;
  
  for (let p of sortedPlayers) {
    if (totalValue + p.playerValue <= budget) {
      selected.push(p);
      totalValue += p.playerValue;
    }
  }
  
  return selected;
}
