const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load environment variables correctly
const dotenvPath = path.resolve(__dirname, '..', '.env');
console.log('Looking for .env file at:', dotenvPath);
console.log('File exists:', fs.existsSync(dotenvPath));

require('dotenv').config({ path: dotenvPath });

// Debug MongoDB connection string
console.log('MongoDB URI:', process.env.MONGODB_URI ? '[Found]' : '[Missing]');

async function migrateProfiles() {
  try {
    console.log('Connecting to database...');
    
    // Hardcode the connection string if needed
    const mongoUri ='mongodb+srv://adeepashashintha:TrCljNU7ZDbodQZw@cluster0.7adqy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    console.log('Using connection string:', mongoUri.replace(/mongodb\+srv:\/\/([^:]+):[^@]+@/, 'mongodb+srv://$1:***@')); // Safely log without password
    
    await mongoose.connect(mongoUri);
    console.log('Connected to database');

    // Basic schema just for migration purposes
    const UserSchema = new mongoose.Schema({
      username: String,
      email: String,
      profileImage: Object,
      profileIcon: Number
    }, { strict: false });

    // Get the User model
    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    console.log('Finding users to migrate...');
    
    // Find all users
    const users = await User.find({});
    
    console.log(`Found ${users.length} users total`);
    let migratedCount = 0;

    for (const user of users) {
      console.log(`Processing user: ${user.username} (${user._id})`);
      
      // Skip users that already have a profileIcon set
      if (user.profileIcon >= 1 && user.profileIcon <= 5) {
        console.log(`User already has profileIcon = ${user.profileIcon}, skipping`);
        continue;
      }

      // Default value
      let newProfileIcon = 1;
      
      // Try to extract from profileImage if it exists
      if (user.profileImage && user.profileImage.data) {
        try {
          if (Buffer.isBuffer(user.profileImage.data)) {
            // If it's a buffer, get the first byte
            newProfileIcon = user.profileImage.data[0] || 1;
          } else if (user.profileImage.data.buffer) {
            // If it's a MongoDB Binary object
            const dataView = new Uint8Array(user.profileImage.data.buffer);
            newProfileIcon = dataView[0] || 1;
          }
          
          // Ensure the value is within our range
          if (newProfileIcon < 1 || newProfileIcon > 5) {
            newProfileIcon = 1;
          }
          
          console.log(`Extracted profileIcon = ${newProfileIcon} from profileImage data`);
        } catch (err) {
          console.error(`Failed to extract from profileImage:`, err);
        }
      }
      
      // Set the profileIcon field
      user.profileIcon = newProfileIcon;
      await user.save();
      
      console.log(`Updated user ${user._id}, set profileIcon = ${newProfileIcon}`);
      migratedCount++;
    }

    console.log(`Migration completed: ${migratedCount} users updated`);
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed with error:', error);
    process.exit(1);
  }
}

// Call the function and handle any uncaught errors
migrateProfiles().catch(err => {
  console.error('Uncaught error in migration:', err);
  process.exit(1);
});

console.log('Migration script started');