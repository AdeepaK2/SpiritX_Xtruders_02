import { NextRequest, NextResponse } from 'next/server';
import connect from '@/utils/db';
import Player, { IPlayer } from '@/models/playerSchema';
import mongoose from 'mongoose';


export const config = {
  api: {
    bodyParser: true,
  },
};

// Helper function to calculate player statistics
export const calculatePlayerStats = (playerData: any) => {
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
export const normalizeCategory = (category: string): 'Batsman' | 'Bowler' | 'All-rounder' => {
  const normalized = category.toLowerCase().trim();
  
  if (normalized.includes('bat')) return 'Batsman';
  if (normalized.includes('bowl')) return 'Bowler';
  if (normalized.includes('all') || normalized.includes('rounder')) return 'All-rounder';
  
  // Default case
  return 'Batsman';
};

// Process a single player data object
export const processPlayerData = (playerData: any) => {
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

// DELETE endpoint to remove a player by ID
export async function DELETE(request: NextRequest) {
  try {
    // Get ID from query parameter: /api/player?id=123
    const id = request.nextUrl.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 });
    }

    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid player ID format' },
        { status: 400 }
      );
    }

    // Connect to database - ensure connection is established
    await connect();

    // Find and delete the player
    const deletedPlayer = await Player.findByIdAndDelete(id);

    if (!deletedPlayer) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Player deleted successfully',
        deletedPlayer: {
          id: deletedPlayer._id,
          name: deletedPlayer.name
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting player:', error);
    
    // Provide more specific error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Error deleting player', 
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}

// PATCH endpoint to update a player by ID
export async function PATCH(request: NextRequest) {
  try {
    // Get ID from query parameter: /api/player?id=123
    const id = request.nextUrl.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 });
    }

    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid player ID format' },
        { status: 400 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log("PATCH body received:", body);
    } catch (parseError) {
      console.error("Failed to parse JSON body:", parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Connect to database
    console.log("Connecting to MongoDB...");
    await connect();
    console.log("MongoDB connection established");

    // Find the player
    console.log(`Finding player with ID: ${id}`);
    const player = await Player.findById(id);
    if (!player) {
      console.log(`Player with ID ${id} not found`);
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }
    console.log(`Player found:`, player.toObject());

    // Map fields from request to player model
    const updatedFields: any = {};
    const incrementFields: any = {};
    
    // Handle basic fields
    if (body.name || body.Name) updatedFields.name = body.name || body.Name;
    if (body.university || body.University) updatedFields.university = body.university || body.University;
    
    // Handle category with normalization
    if (body.category || body.Category) {
      const categoryValue = body.category || body.Category;
      updatedFields.category = normalizeCategory(categoryValue);
    }

    // Handle numeric fields - support both replacement and incrementation
    const numericFields = [
      { reqField: 'totalRuns', altField: 'Total Runs', incField: 'add_totalRuns' },
      { reqField: 'ballsFaced', altField: 'Balls Faced', incField: 'add_ballsFaced' },
      { reqField: 'inningsPlayed', altField: 'Innings Played', incField: 'add_inningsPlayed' },
      { reqField: 'wickets', altField: 'Wickets', incField: 'add_wickets' },
      { reqField: 'oversBowled', altField: 'Overs Bowled', incField: 'add_oversBowled' },
      { reqField: 'runsConceded', altField: 'Runs Conceded', incField: 'add_runsConceded' }
    ];

    // Check for incremental updates
    let hasIncrementalChanges = false;
    numericFields.forEach(field => {
      // Check for increment fields
      if (body[field.incField] !== undefined) {
        hasIncrementalChanges = true;
        const value = field.reqField === 'oversBowled' 
          ? parseFloat(String(body[field.incField])) 
          : parseInt(String(body[field.incField]));
        
        incrementFields[field.reqField] = value;
      }
      // Also handle direct replacements (existing functionality)
      else if (body[field.reqField] !== undefined || body[field.altField] !== undefined) {
        const value = body[field.reqField] !== undefined ? body[field.reqField] : body[field.altField];
        updatedFields[field.reqField] = field.reqField === 'oversBowled' 
          ? parseFloat(String(value)) 
          : parseInt(String(value));
      }
    });

    // If we have increments, apply them to get the new values
    if (Object.keys(incrementFields).length > 0) {
      console.log("Incrementing fields:", incrementFields);
      for (const [field, increment] of Object.entries(incrementFields)) {
        updatedFields[field] = player[field] + increment;
        console.log(`Incrementing ${field} from ${player[field]} by ${increment} to ${updatedFields[field]}`);
      }
    }

    // If performance stats changed, recalculate derived statistics
    if (numericFields.some(field => updatedFields[field.reqField] !== undefined) || hasIncrementalChanges) {
      const statsInput = {
        totalRuns: updatedFields.totalRuns !== undefined ? updatedFields.totalRuns : player.totalRuns,
        ballsFaced: updatedFields.ballsFaced !== undefined ? updatedFields.ballsFaced : player.ballsFaced,
        inningsPlayed: updatedFields.inningsPlayed !== undefined ? updatedFields.inningsPlayed : player.inningsPlayed,
        wickets: updatedFields.wickets !== undefined ? updatedFields.wickets : player.wickets,
        oversBowled: updatedFields.oversBowled !== undefined ? updatedFields.oversBowled : player.oversBowled,
        runsConceded: updatedFields.runsConceded !== undefined ? updatedFields.runsConceded : player.runsConceded,
      };
      
      console.log("Recalculating stats with:", statsInput);
      const recalculatedStats = calculatePlayerStats(statsInput);
      
      // Update derived fields
      updatedFields.battingStrikeRate = recalculatedStats.battingStrikeRate;
      updatedFields.bowlingStrikeRate = recalculatedStats.bowlingStrikeRate;
      updatedFields.battingAverage = recalculatedStats.battingAverage;
      updatedFields.economyRate = recalculatedStats.economyRate;
      updatedFields.playerPoints = recalculatedStats.playerPoints;
      updatedFields.playerValue = recalculatedStats.playerValue;
    }

    console.log("Final updatedFields:", updatedFields);
    
    if (Object.keys(updatedFields).length === 0) {
      console.log("No updates to apply");
      return NextResponse.json({
        message: 'No changes to update'
      }, { status: 200 });
    }

    // Update the player
    console.log(`Updating player ${id} with:`, updatedFields);
    const updatedPlayer = await Player.findByIdAndUpdate(
      id,
      { $set: updatedFields },
      { new: true, runValidators: true }
    );
    
    console.log("Player after update:", updatedPlayer);

    if (!updatedPlayer) {
      console.error("Update failed - player not found after update");
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Player updated successfully',
      player: {
        id: updatedPlayer._id,
        name: updatedPlayer.name,
        university: updatedPlayer.university,
        category: updatedPlayer.category,
        totalRuns: updatedPlayer.totalRuns,
        ballsFaced: updatedPlayer.ballsFaced,
        inningsPlayed: updatedPlayer.inningsPlayed,
        wickets: updatedPlayer.wickets,
        oversBowled: updatedPlayer.oversBowled,
        runsConceded: updatedPlayer.runsConceded,
        battingStrikeRate: updatedPlayer.battingStrikeRate,
        bowlingStrikeRate: updatedPlayer.bowlingStrikeRate,
        battingAverage: updatedPlayer.battingAverage,
        economyRate: updatedPlayer.economyRate,
        playerPoints: updatedPlayer.playerPoints,
        playerValue: updatedPlayer.playerValue
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating player:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Error updating player',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
