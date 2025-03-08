import { NextRequest, NextResponse } from 'next/server';
import connect from '@/utils/db';
import Player, { IPlayer } from '@/models/playerSchema';

export const config = {
  api: {
    bodyParser: true,
  },
};

// Helper function to calculate player statistics
const calculatePlayerStats = (playerData: any) => {
  const totalRuns = parseInt(playerData.totalRuns) || 0;
  const ballsFaced = parseInt(playerData.ballsFaced) || 1;
  const inningsPlayed = parseInt(playerData.inningsPlayed) || 1;
  const wickets = parseInt(playerData.wickets) || 0;
  const oversBowled = parseFloat(playerData.oversBowled) || 0;
  const runsConceded = parseInt(playerData.runsConceded) || 0;

  // Batting calculations
  const battingStrikeRate = (totalRuns / ballsFaced) * 100;
  const battingAverage = totalRuns / inningsPlayed;
  
  // Bowling calculations - handle division by zero
  const totalBallsBowled = oversBowled * 6;
  const bowlingStrikeRate = wickets > 0 ? totalBallsBowled / wickets : 0;
  const economyRate = oversBowled > 0 ? (runsConceded / oversBowled) * 6 : 0;

  // Player points calculation according to the formula
  const battingPoints = (battingStrikeRate / 5) + (battingAverage * 0.8);
  const bowlingPoints = bowlingStrikeRate > 0 ? 500 / bowlingStrikeRate : 0;
  const playerPoints = battingPoints + bowlingPoints + economyRate;

  // Player value calculation
  let playerValue = (9 * playerPoints + 100) * 1000;
  playerValue = Math.round(playerValue / 50000) * 50000;

  return {
    battingStrikeRate: isFinite(battingStrikeRate) ? battingStrikeRate : 0,
    bowlingStrikeRate: isFinite(bowlingStrikeRate) ? bowlingStrikeRate : 0,
    battingAverage: isFinite(battingAverage) ? battingAverage : 0,
    economyRate: isFinite(economyRate) ? economyRate : 0,
    playerPoints: isFinite(playerPoints) ? playerPoints : 0,
    playerValue: isFinite(playerValue) ? playerValue : 0,
  };
};

// Function to normalize category to match enum values in schema
const normalizeCategory = (category: string): 'Batsman' | 'Bowler' | 'All-rounder' => {
  const normalized = category.toLowerCase().trim();
  
  if (normalized.includes('bat')) return 'Batsman';
  if (normalized.includes('bowl')) return 'Bowler';
  if (normalized.includes('all') || normalized.includes('rounder')) return 'All-rounder';
  
  // Default case
  return 'Batsman';
};

// Process a single player data object
const processPlayerData = (playerData: any) => {
  // Map field names from request format to schema format
  const mappedPlayer = {
    name: playerData.Name || playerData.name,
    university: playerData.University || playerData.university,
    category: playerData.Category || playerData.category,
    totalRuns: playerData['Total Runs'] || playerData.totalRuns || 0,
    ballsFaced: playerData['Balls Faced'] || playerData.ballsFaced || 0,
    inningsPlayed: playerData['Innings Played'] || playerData.inningsPlayed || 0,
    wickets: playerData.Wickets || playerData.wickets || 0,
    oversBowled: playerData['Overs Bowled'] || playerData.oversBowled || 0,
    runsConceded: playerData['Runs Conceded'] || playerData.runsConceded || 0
  };

  const missingFields: string[] = [];

  // Check for missing required fields
  if (!mappedPlayer.name || mappedPlayer.name.trim() === '') {
    missingFields.push('name');
  }
  if (!mappedPlayer.university || mappedPlayer.university.trim() === '') {
    missingFields.push('university');
  }
  if (!mappedPlayer.category || mappedPlayer.category.trim() === '') {
    missingFields.push('category');
  }

  // If missing any required fields, return validation error
  if (missingFields.length > 0) {
    return {
      isValid: false,
      error: `Missing required fields: ${missingFields.join(', ')}`,
      data: null
    };
  }

  // Normalize category to match enum values in schema
  const normalizedCategory = normalizeCategory(mappedPlayer.category);
  
  // Calculate player stats
  const playerStats = calculatePlayerStats(mappedPlayer);
  
  // Create player object
  const player = new Player({
    name: mappedPlayer.name,
    university: mappedPlayer.university,
    category: normalizedCategory,
    totalRuns: parseInt(String(mappedPlayer.totalRuns)) || 0,
    ballsFaced: parseInt(String(mappedPlayer.ballsFaced)) || 0,
    inningsPlayed: parseInt(String(mappedPlayer.inningsPlayed)) || 0,
    wickets: parseInt(String(mappedPlayer.wickets)) || 0,
    oversBowled: parseFloat(String(mappedPlayer.oversBowled)) || 0,
    runsConceded: parseInt(String(mappedPlayer.runsConceded)) || 0,
    battingStrikeRate: playerStats.battingStrikeRate,
    bowlingStrikeRate: playerStats.bowlingStrikeRate,
    battingAverage: playerStats.battingAverage,
    economyRate: playerStats.economyRate,
    playerPoints: playerStats.playerPoints,
    playerValue: playerStats.playerValue,
  });

  return {
    isValid: true,
    error: null,
    data: player
  };
};

// POST endpoint to add a single player
export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
      
      // Enhanced debug logging
      console.log("Request body received:", body);
      console.log("Request body type:", typeof body);
      console.log("Is array:", Array.isArray(body));
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      return NextResponse.json({ 
        error: 'Invalid JSON in request body' 
      }, { status: 400 });
    }
    
    // Check if body exists
    if (!body) {
      return NextResponse.json({ 
        error: 'No request body provided' 
      }, { status: 400 });
    }
    
    // Handle array input
    if (Array.isArray(body)) {
      // If empty array, treat as a formatting issue rather than empty data
      if (body.length === 0) {
        return NextResponse.json({ 
          error: 'Empty array provided. For single player, send an object not an array.' 
        }, { status: 400 });
      }
      
      // Process array of players
      try {
        await connect();
        const validPlayers: IPlayer[] = [];
        const invalidPlayers: any[] = [];

        for (const playerData of body) {
          const result = processPlayerData(playerData);
          if (result.isValid) {
            validPlayers.push(result.data);
          } else {
            invalidPlayers.push({
              data: playerData,
              error: result.error
            });
          }
        }

        if (validPlayers.length > 0) {
          await Player.insertMany(validPlayers);
        }

        return NextResponse.json({
          message: `${validPlayers.length} players added successfully`,
          invalidCount: invalidPlayers.length,
          invalidPlayers: invalidPlayers.length > 0 ? invalidPlayers : undefined
        }, { status: 201 });
      } catch (error) {
        console.error("Error processing player array:", error);
        return NextResponse.json({ 
          error: 'Error processing player array' 
        }, { status: 500 });
      }
    }
    
    // At this point, body should be a single player object
    console.log("Processing single player:", body);
    
    // Process single player object
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ 
        error: 'Invalid player data format' 
      }, { status: 400 });
    }

    // Process player data
    const result = processPlayerData(body);
    
    if (!result.isValid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Connect to the database and insert the player
    await connect();
    await result.data.save();

    return NextResponse.json({
      message: 'Player added successfully',
      player: {
        id: result.data._id,
        name: result.data.name,
        university: result.data.university,
        category: result.data.category,
        playerValue: result.data.playerValue,
        playerPoints: result.data.playerPoints
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 });
  }
}
