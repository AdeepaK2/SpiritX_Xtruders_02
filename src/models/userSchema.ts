import mongoose from 'mongoose';

// // This function handles the schema migration
// async function migrateUserSchema() {
//   try {
//     // Check if the User collection exists and drop it if it does
//     if (mongoose.connection.readyState === 1) {
//       const collections = mongoose.connection.db ? await mongoose.connection.db.listCollections({ name: 'users' }).toArray() : [];
//       if (collections.length > 0) {
//         console.log('Dropping existing User collection to apply schema changes...');
//         if (mongoose.connection.db) {
//           await mongoose.connection.db.dropCollection('users');
//         } else {
//           console.error('Database connection is not established.');
//         }
//         console.log('User collection dropped successfully.');
//       }
//     }
//   } catch (error) {
//     console.error('Failed to migrate User schema:', error);
//   }
// }

// Define the User schema with strict enforcement and image support
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
  profileImage: {
    data: {
      type: Buffer,  // Store binary image data directly
      default: null
    },
    contentType: {
      type: String,  // Store MIME type (e.g., "image/jpeg", "image/png")
      default: null
    },
    uploadDate: {
      type: Date,
      default: null
    }
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