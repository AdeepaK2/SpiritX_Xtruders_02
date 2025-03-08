import { NextRequest, NextResponse } from 'next/server';
import connect from '@/utils/db';
import Team from '@/models/teamSchema';
import Player from '@/models/playerSchema';
import mongoose from 'mongoose';

// POST: Create a new team
export async function POST(request: NextRequest) {
  try {
    await connect();
    
    const body = await request.json();
    
    if (!body.name || !body.userId) {
      return NextResponse.json({ 
        error: 'Team name and user ID are required' 
      }, { status: 400 });
    }
    
    // Validate player IDs if provided
    if (body.players && Array.isArray(body.players)) {
      // Check that all player IDs are valid ObjectIds
      const invalidIds = body.players.filter(
        (id: string) => !mongoose.Types.ObjectId.isValid(id)
      );
      
      if (invalidIds.length > 0) {
        return NextResponse.json({ 
          error: 'Invalid player ID format' 
        }, { status: 400 });
      }
      
      // Check if all players exist in database
      const playerCount = await Player.countDocuments({
        _id: { $in: body.players }
      });
      
      if (playerCount !== body.players.length) {
        return NextResponse.json({ 
          error: 'One or more players do not exist' 
        }, { status: 400 });
      }
      
      // Check for team size limit
      if (body.players.length > 11) {
        return NextResponse.json({ 
          error: 'A team cannot have more than 11 players' 
        }, { status: 400 });
      }
      
      // Calculate total team value
      const players = await Player.find({ _id: { $in: body.players } });
      body.totalValue = players.reduce(
        (sum: number, player: any) => sum + (player.playerValue || 0), 
        0
      );
    }
    
    // Create new team
    const newTeam = new Team(body);
    await newTeam.save();
    
    return NextResponse.json({
      message: 'Team created successfully',
      team: newTeam
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({ 
      error: 'Error creating team', 
      details: errorMessage 
    }, { status: 500 });
  }
}

// PATCH: Update a team (add/remove players)
export async function PATCH(request: NextRequest) {
  try {
    await connect();
    
    const id = request.nextUrl.searchParams.get('id');
    
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ 
        error: 'Valid team ID is required' 
      }, { status: 400 });
    }
    
    const body = await request.json();
    const team = await Team.findById(id);
    
    if (!team) {
      return NextResponse.json({ 
        error: 'Team not found' 
      }, { status: 404 });
    }
    
    // Update basic team info
    if (body.name) team.name = body.name;
    
    // Handle player updates
    if (body.players && Array.isArray(body.players)) {
      // Validate player IDs
      const invalidIds = body.players.filter(
        (id: string) => !mongoose.Types.ObjectId.isValid(id)
      );
      
      if (invalidIds.length > 0) {
        return NextResponse.json({ 
          error: 'Invalid player ID format' 
        }, { status: 400 });
      }
      
      // Check if all players exist
      const playerCount = await Player.countDocuments({
        _id: { $in: body.players }
      });
      
      if (playerCount !== body.players.length) {
        return NextResponse.json({ 
          error: 'One or more players do not exist' 
        }, { status: 400 });
      }
      
      // Check team size
      if (body.players.length > 11) {
        return NextResponse.json({ 
          error: 'A team cannot have more than 11 players' 
        }, { status: 400 });
      }
      
      // Update players array
      team.players = body.players;
      
      // Recalculate total team value
      const players = await Player.find({ _id: { $in: body.players } });
      team.totalValue = players.reduce(
        (sum: number, player: any) => sum + (player.playerValue || 0), 
        0
      );
    }
    
    await team.save();
    
    return NextResponse.json({
      message: 'Team updated successfully',
      team
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating team:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({ 
      error: 'Error updating team', 
      details: errorMessage 
    }, { status: 500 });
  }
}

// GET: Retrieve teams
export async function GET(request: NextRequest) {
  try {
    await connect();
    
    const id = request.nextUrl.searchParams.get('id');
    const userId = request.nextUrl.searchParams.get('userId');
    
    // Get specific team
    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ 
          error: 'Invalid team ID format' 
        }, { status: 400 });
      }
      
      const team = await Team.findById(id).populate('players');
      
      if (!team) {
        return NextResponse.json({ 
          error: 'Team not found' 
        }, { status: 404 });
      }
      
      return NextResponse.json({ team }, { status: 200 });
    }
    
    // Get teams by user
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return NextResponse.json({ 
          error: 'Invalid user ID format' 
        }, { status: 400 });
      }
      
      const teams = await Team.find({ userId }).populate('players');
      return NextResponse.json({ teams }, { status: 200 });
    }
    
    // Get all teams
    const teams = await Team.find({}).populate('players');
    return NextResponse.json({ teams }, { status: 200 });
  } catch (error) {
    console.error('Error fetching teams:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({ 
      error: 'Error fetching teams', 
      details: errorMessage 
    }, { status: 500 });
  }
}

// DELETE: Remove a team
export async function DELETE(request: NextRequest) {
  try {
    await connect();
    
    const id = request.nextUrl.searchParams.get('id');
    
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ 
        error: 'Valid team ID is required' 
      }, { status: 400 });
    }
    
    const deletedTeam = await Team.findByIdAndDelete(id);
    
    if (!deletedTeam) {
      return NextResponse.json({ 
        error: 'Team not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({
      message: 'Team deleted successfully',
      id: deletedTeam._id
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting team:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({ 
      error: 'Error deleting team', 
      details: errorMessage 
    }, { status: 500 });
  }
}