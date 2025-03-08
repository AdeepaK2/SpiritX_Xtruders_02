import mongoose, { Document, Schema } from 'mongoose';
import { IPlayer } from './playerSchema';

// Define TypeScript types for the team schema
export interface ITeam extends Document {
  name: string;
  userId: mongoose.Types.ObjectId; // Reference to the user who created the team
  players: mongoose.Types.ObjectId[]; // Array of player references (maximum 11)
  totalValue: number;
  createdAt: Date;
  updatedAt: Date;
}

// Define the Team Schema
const teamSchema: Schema<ITeam> = new Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  players: [{
    type: Schema.Types.ObjectId,
    ref: 'Player',
    required: true
  }],
  totalValue: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true,
  validateBeforeSave: true 
});

// Middleware to validate team composition
teamSchema.pre('save', function(next) {
  // Check if team has exactly 11 players
  if (this.players.length > 11) {
    return next(new Error('A team cannot have more than 11 players'));
  }
  
  next();
});

const Team = mongoose.models.Team || mongoose.model<ITeam>('Team', teamSchema);

export default Team;