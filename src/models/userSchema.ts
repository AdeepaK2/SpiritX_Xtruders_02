import mongoose from 'mongoose';

// Define the User schema
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
  accountCreationDate: {
    type: Date,
    default: Date.now,
  },
  lastLoginDate: {
    type: Date,
    default: Date.now,
  },
});

// Create and export the User model
// Use mongoose.models to prevent recompiling the model
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;