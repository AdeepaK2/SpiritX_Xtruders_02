import { NextRequest, NextResponse } from 'next/server';
import { createReadStream } from 'fs';
import * as fs from 'fs/promises'; // Corrected import for fs promises
import csvParser from 'csv-parser';
import connect from '@/utils/db';
import Player, { IPlayer } from '@/models/playerSchema';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid'; // You may need to install this: npm install uuid @types/uuid

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parsing to handle file upload
  },
};

// Helper function to calculate statistics
const calculatePlayerStats = (playerData: any) => {
  const {
    totalRuns,
    ballsFaced,
    inningsPlayed,
    wickets,
    oversBowled,
    runsConceded
  } = playerData;

  // Calculate Batting and Bowling Statistics
  const battingStrikeRate = (totalRuns / ballsFaced) * 100;
  const bowlingStrikeRate = oversBowled / wickets;
  const battingAverage = totalRuns / inningsPlayed;
  const economyRate = (runsConceded / oversBowled) * 6;

  // Calculate Player Points
  const playerPoints =
    (battingStrikeRate / 5) +
    (battingAverage * 0.8) +
    (bowlingStrikeRate * 500) +
    (economyRate * 140);

  // Calculate Player Value (rounded to nearest 50,000)
  let playerValue = (9 * playerPoints + 100) * 1000;
  playerValue = Math.round(playerValue / 50000) * 50000; // Round to nearest 50,000

  return {
    battingStrikeRate,
    bowlingStrikeRate,
    battingAverage,
    economyRate,
    playerPoints,
    playerValue,
  };
};

// POST endpoint to upload CSV and insert players data
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const csvFile = formData.get('csvFile') as File;

    if (!csvFile) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Create temp directory if it doesn't exist
    const tempDir = path.join(process.cwd(), 'temp');
    try {
      await fs.mkdir(tempDir, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }

    // Save file to temp location
    const filePath = path.join(tempDir, `${uuidv4()}.csv`);
    const bytes = await csvFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    const playersData: IPlayer[] = [];

    // Process CSV file
    return new Promise((resolve) => {
      createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (row) => {
          const playerStats = calculatePlayerStats(row);
          const player = new Player({
            name: row.name || '',
            university: row.university || '',
            category: row.category || '',
            totalRuns: parseInt(row.totalRuns) || 0,
            ballsFaced: parseInt(row.ballsFaced) || 0,
            inningsPlayed: parseInt(row.inningsPlayed) || 0,
            wickets: parseInt(row.wickets) || 0,
            oversBowled: parseFloat(row.oversBowled) || 0,
            runsConceded: parseInt(row.runsConceded) || 0,
            battingStrikeRate: playerStats.battingStrikeRate,
            bowlingStrikeRate: playerStats.bowlingStrikeRate,
            battingAverage: playerStats.battingAverage,
            economyRate: playerStats.economyRate,
            playerPoints: playerStats.playerPoints,
            playerValue: playerStats.playerValue,
          });
          playersData.push(player);
        })
        .on('end', async () => {
          try {
            await connect();
            await Player.insertMany(playersData);
            // Delete the temporary file
            await fs.unlink(filePath);
            resolve(NextResponse.json({ message: 'Players data inserted successfully' }, { status: 201 }));
          } catch (err) {
            console.error('Error inserting players data:', err);
            resolve(NextResponse.json({ error: 'Error inserting data' }, { status: 500 }));
          }
        });
    });
  } catch (error) {
    console.error('Error processing upload:', error);
    return NextResponse.json({ error: 'Error processing upload' }, { status: 500 });
  }
}

// GET endpoint to retrieve all players
export async function GET() {
  try {
    // Connect to the database
    await connect();

    // Retrieve all players from the database
    const players = await Player.find();

    // Return the players data
    return NextResponse.json({ players }, { status: 200 });
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json({ error: 'Failed to retrieve players' }, { status: 500 });
  }
}

// PUT endpoint to update an existing player by ID
export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    const body = await request.json();

    // Validate input
    if (!id) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 });
    }

    // Connect to the database
    await connect();

    // Find and update the player
    const updatedPlayer = await Player.findByIdAndUpdate(id, body, { new: true });

    if (!updatedPlayer) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // Return success response
    return NextResponse.json({ message: 'Player updated successfully', updatedPlayer }, { status: 200 });
  } catch (error) {
    console.error('Error in PUT /players:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE endpoint to remove a player by ID
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');

    // Validate input
    if (!id) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 });
    }

    // Connect to the database
    await connect();

    // Find and delete the player
    const deletedPlayer = await Player.findByIdAndDelete(id);

    if (!deletedPlayer) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // Return success response
    return NextResponse.json({ message: 'Player deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /players:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
