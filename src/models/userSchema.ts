import mongoose from 'mongoose';

// Define the User schema with strict enforcement
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Password should be at least 6 characters']
  },
  profileIcon: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  },
  budget: {
    type: Number,
    required: true,
    default: 9000000,
  },
  accountCreationDate: {
    type: Date,
    default: Date.now,
  },
  lastLoginDate: {
    type: Date,
    default: Date.now,
  },
}, { 
  strict: true,
  versionKey: '__v'
});

// Create indexes for commonly queried fields
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

// Only create the model if it doesn't already exist
// This prevents model redefinition errors
const User = mongoose.models.User || mongoose.model('User', userSchema);



export default User;