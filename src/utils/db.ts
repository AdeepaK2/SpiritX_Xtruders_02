import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGO_DB_URI;

if (!MONGODB_URI) {
    throw new Error(
        "Please define the MONGO_DB_URI environment variable inside .env.local"
    );
}

const connect = async () => {
    const connectionState = mongoose.connection.readyState;

    if (connectionState === 1) {
        console.log("DB already connected");
        return;
    }

    if (connectionState === 2) {
        console.log("DB connecting");
        return;
    }

    try {
        // Await the connection to ensure it's properly established
        await mongoose.connect(MONGODB_URI);
        console.log("DB connected");
    } catch (error: any) {
        console.error("Error connecting to the database:", error);
        throw new Error(`Database connection failed: ${error.message}`);
    }
};

export default connect;
