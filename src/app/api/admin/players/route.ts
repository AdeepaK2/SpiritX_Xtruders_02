import { NextRequest, NextResponse } from 'next/server';
import connect from '@/utils/db';
import Player from '@/models/playerSchema';

// Handle GET requests
export async function GET(req: NextRequest) {
  await connect();

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    // Build query
    const query: any = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (category) query.category = category;

    console.log('Fetching players with query:', query); // Log the query for debugging

    const players = await Player.find(query);
    return NextResponse.json({ success: true, data: players }, { status: 200 });
  } catch (error) {
    console.error('GET Players Error:', error); // Log the error for debugging
    return NextResponse.json(
      { success: false, error: 'Failed to fetch players' },
      { status: 500 }
    );
  }
}

// Handle POST requests
export async function POST(req: NextRequest) {
  await connect(); // Connect to MongoDB
  console.log('Connected to MongoDB');

  try {
    // Parse the request body
    const playerData = await req.json();
    console.log('Request Body:', playerData);

    // Validate required fields
    if (!playerData.name || !playerData.university || !playerData.category) {
      return NextResponse.json(
        { success: false, error: 'Name, university, and category are required' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['Batsman', 'Bowler', 'All-rounder'];
    if (!validCategories.includes(playerData.category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category. Must be one of: Batsman, Bowler, All-rounder' },
        { status: 400 }
      );
    }

    // Set default values for numeric fields if not provided
    const numericFields = [
      'totalRuns',
      'ballsFaced',
      'inningsPlayed',
      'wickets',
      'oversBowled',
      'runsConceded',
      'battingStrikeRate',
      'bowlingStrikeRate',
      'battingAverage',
      'economyRate',
      'playerPoints',
      'playerValue',
    ];

    for (const field of numericFields) {
      if (playerData[field] === undefined || playerData[field] === null) {
        playerData[field] = 0; // Set default value to 0 if not provided
      } else if (isNaN(playerData[field])) {
        return NextResponse.json(
          { success: false, error: `${field} must be a number` },
          { status: 400 }
        );
      } else if (playerData[field] < 0) {
        return NextResponse.json(
          { success: false, error: `${field} cannot be negative` },
          { status: 400 }
        );
      }
    }

    // Create a new player document
    const newPlayer = new Player(playerData);
    await newPlayer.save(); // Save the player to the database

    // Return success response with the created player
    return NextResponse.json(
      { success: true, data: newPlayer },
      { status: 201 }
    );
  } catch (error) {
    console.error('CREATE Player Error:', error); // Log the error for debugging
    return NextResponse.json(
      { success: false, error: 'Failed to create player' },
      { status: 500 }
    );
  }
}