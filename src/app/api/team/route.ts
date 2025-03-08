import { NextRequest, NextResponse } from 'next/server';
import connect from '@/utils/db';
import Team from '@/models/teamSchema';
import Player from '@/models/playerSchema';
import User from '@/models/userSchema'; // Import the User model
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
    
    // Find the user to check budget
    const user = await User.findById(body.userId);
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }
    
    // Check if user already has a team
    const existingTeam = await Team.findOne({ userId: body.userId });
    if (existingTeam) {
      // If updating existing team, calculate difference for budget adjustment
      // For now, we'll just delete the old team and create a new one
      await Team.findByIdAndDelete(existingTeam._id);
      // We'll refund the previous team value to the user
      user.budget += existingTeam.totalValue || 0;
    }
    
    // Calculate total team value if players provided
    let totalTeamValue = 0;
    
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
      const players = await Player.find({ _id: { $in: body.players } });
      
      if (players.length !== body.players.length) {
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
      totalTeamValue = players.reduce(
        (sum: number, player: any) => sum + (player.playerValue || 0), 
        0
      );
      
      body.totalValue = totalTeamValue;
      
      // Check if user has enough budget
      if (totalTeamValue > user.budget) {
        return NextResponse.json({ 
          error: 'Insufficient budget to create this team',
          required: totalTeamValue,
          available: user.budget
        }, { status: 400 });
      }
      
      // Deduct the team cost from user's budget
      user.budget -= totalTeamValue;
      await user.save();
    }
    
    // Create new team
    const newTeam = new Team(body);
    await newTeam.save();
    
    return NextResponse.json({
      message: 'Team created successfully',
      team: newTeam,
      budgetRemaining: user.budget
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
    
    // Find the user to update budget
    const user = await User.findById(team.userId);
    if (!user) {
      return NextResponse.json({ 
        error: 'Team owner not found' 
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
      
      // Check if all players exist and calculate new team value
      const players = await Player.find({ _id: { $in: body.players } });
      
      if (players.length !== body.players.length) {
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
      
      // Calculate new team value
      const newTotalValue = players.reduce(
        (sum: number, player: any) => sum + (player.playerValue || 0), 
        0
      );
      
      // Calculate difference in budget
      const budgetDifference = team.totalValue - newTotalValue;
      
      // Check if user has enough budget for the new team value
      if (budgetDifference < 0 && Math.abs(budgetDifference) > user.budget) {
        return NextResponse.json({ 
          error: 'Insufficient budget to make these changes',
          required: Math.abs(budgetDifference),
          available: user.budget
        }, { status: 400 });
      }
      
      // Update user's budget based on the difference
      user.budget += budgetDifference;
      await user.save();
      
      // Update team players and value
      team.players = body.players;
      team.totalValue = newTotalValue;
    }
    
    await team.save();
    
    return NextResponse.json({
      message: 'Team updated successfully',
      team,
      budgetRemaining: user.budget
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
    
    const deletedTeam = await Team.findById(id);
    
    if (!deletedTeam) {
      return NextResponse.json({ 
        error: 'Team not found' 
      }, { status: 404 });
    }
    
    // Refund team value to user's budget
    const user = await User.findById(deletedTeam.userId);
    if (user) {
      user.budget += deletedTeam.totalValue || 0;
      await user.save();
    }
    
    // Now delete the team
    await Team.findByIdAndDelete(id);
    
    return NextResponse.json({
      message: 'Team deleted successfully',
      id: deletedTeam._id,
      refundedAmount: deletedTeam.totalValue || 0,
      newBudget: user ? user.budget : null
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