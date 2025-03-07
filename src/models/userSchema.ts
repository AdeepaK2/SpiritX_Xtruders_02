import mongoose from 'mongoose';

// Define the User schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password should be at least 6 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export the User model
// Use mongoose.models to prevent recompiling the model
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;