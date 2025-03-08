import { NextRequest, NextResponse } from 'next/server';
import connect from '@/utils/db';
import Player, { IPlayer } from '@/models/playerSchema';
import mongoose from 'mongoose';
import { calculatePlayerStats, normalizeCategory, processPlayerData } from '@/utils/playerUtils';

export const config = {
  api: {
    bodyParser: true,
  },
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

// GET endpoint to retrieve players
export async function GET(request: NextRequest) {
  try {
    await connect();
    
    const id = request.nextUrl.searchParams.get('id');
    const ids = request.nextUrl.searchParams.get('ids');
    
    // If ID is provided, fetch specific player
    if (id) {
      // Validate the ID format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { error: 'Invalid player ID format' },
          { status: 400 }
        );
      }

      const player = await Player.findById(id);
      
      if (!player) {
        return NextResponse.json(
          { error: 'Player not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ player }, { status: 200 });
    }
    
    // If IDs are provided as comma-separated list, fetch multiple players
    if (ids) {
      console.log(`Fetching multiple players with ids: ${ids}`);
      const playerIds = ids.split(',').filter(id => mongoose.Types.ObjectId.isValid(id));
      
      if (playerIds.length === 0) {
        return NextResponse.json(
          { error: 'No valid player IDs provided' },
          { status: 400 }
        );
      }
      
      const players = await Player.find({ _id: { $in: playerIds } });
      console.log(`Found ${players.length} players`);
      
      return NextResponse.json({ players }, { status: 200 });
    }
    
    // Otherwise return all players
    const players = await Player.find({});
    return NextResponse.json({ players }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching players:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Error fetching players', details: errorMessage },
      { status: 500 }
    );
  }
}
