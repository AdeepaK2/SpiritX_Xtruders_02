import { NextRequest, NextResponse } from 'next/server';
import connect from '@/utils/db';
import Player from '@/models/playerSchema';

// GET a single player by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await connect();

  try {
    const { id } = params; // Extract the player ID from params

    // Validate the ID format (optional but recommended)
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { success: false, error: 'Invalid player ID format' },
        { status: 400 }
      );
    }

    const player = await Player.findById(id);

    if (!player) {
      return NextResponse.json(
        { success: false, error: 'Player not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: player }, { status: 200 });
  } catch (error) {
    console.error('GET Player Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch player' },
      { status: 500 }
    );
  }
}

// UPDATE a player by ID
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connect();

  try {
    const { id } = params;

    // Validate the ID format (optional but recommended)
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { success: false, error: 'Invalid player ID format' },
        { status: 400 }
      );
    }

    const playerData = await req.json(); // Parse request body

    const updatedPlayer = await Player.findByIdAndUpdate(
      id,
      playerData,
      {
        new: true, // Return the updated document
        runValidators: true, // Validate the update
      }
    );

    if (!updatedPlayer) {
      return NextResponse.json(
        { success: false, error: 'Player not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: updatedPlayer },
      { status: 200 }
    );
  } catch (error) {
    console.error('UPDATE Player Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update player' },
      { status: 500 }
    );
  }
}

// DELETE a player by ID
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await connect();

  try {
    const { id } = params;

    // Validate the ID format (optional but recommended)
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { success: false, error: 'Invalid player ID format' },
        { status: 400 }
      );
    }

    const deletedPlayer = await Player.findByIdAndDelete(id);

    if (!deletedPlayer) {
      return NextResponse.json(
        { success: false, error: 'Player not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error) {
    console.error('DELETE Player Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete player' },
      { status: 500 }
    );
  }
}