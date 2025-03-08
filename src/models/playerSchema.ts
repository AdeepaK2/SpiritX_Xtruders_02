import mongoose, { Document, Schema } from 'mongoose';

// Define TypeScript types for the player schema
export interface IPlayer extends Document {
  name: string;
  university: string;
  category: 'Batsman' | 'Bowler' | 'All-rounder';
  totalRuns: number;
  ballsFaced: number;
  inningsPlayed: number;
  wickets: number;
  oversBowled: number;
  runsConceded: number;
  battingStrikeRate: number;
  bowlingStrikeRate: number;
  battingAverage: number;
  economyRate: number;
  playerPoints: number;
  playerValue: number;
}

// Define the Player Schema
const playerSchema: Schema<IPlayer> = new Schema({
  name: { type: String, required: true },
  university: { type: String, required: true },
  category: { type: String, required: true, enum: ['Batsman', 'Bowler', 'All-rounder'] },
  totalRuns: { type: Number, required: true },
  ballsFaced: { type: Number, required: true },
  inningsPlayed: { type: Number, required: true },
  wickets: { type: Number, required: true },
  oversBowled: { type: Number, required: true },
  runsConceded: { type: Number, required: true },
  battingStrikeRate: { type: Number, required: true },
  bowlingStrikeRate: { type: Number, required: true },
  battingAverage: { type: Number, required: true },
  economyRate: { type: Number, required: true },
  playerPoints: { type: Number, required: true },
  playerValue: { type: Number, required: true }
}, { timestamps: true });

const Player = mongoose.models.Player || mongoose.model<IPlayer>('Player', playerSchema);

export default Player;
