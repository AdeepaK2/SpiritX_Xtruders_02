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
  budget: {
    type: Number,
    required: true,  // Make it required to ensure it's always added
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
  strict: true,  // Enforce schema validation
  versionKey: '__v' // Explicit version key
});

// Create and export the User model
const User = mongoose.model('User', userSchema);

export default User;