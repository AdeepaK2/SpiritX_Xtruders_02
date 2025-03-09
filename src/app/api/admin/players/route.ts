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

    const players = await Player.find(query);
    return NextResponse.json({ success: true, data: players }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch players' }, { status: 500 });
  }
}

// Handle POST requests
export async function POST(req: NextRequest) {
  await connect();

  try {
    const playerData = await req.json();

    // Validate required fields
    if (!playerData.name || !playerData.university || !playerData.category) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const player = await Player.create(playerData);
    return NextResponse.json({ success: true, data: player }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create player' }, { status: 500 });
  }
}
