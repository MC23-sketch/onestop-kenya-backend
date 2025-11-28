const mongoose = require('mongoose');

// Cache the connection to reuse in serverless environment
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    // If already connected, return existing connection
    if (cached.conn && mongoose.connection.readyState === 1) {
        return cached.conn;
    }

    // If connection is in progress, wait for it
    if (!cached.promise) {
        const opts = {
            bufferCommands: true, // Enable buffering for serverless
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 10000, // Increased timeout
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
        };

        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
            console.log('✅ MongoDB Connected');
            cached.conn = mongoose;
            return mongoose;
        }).catch((error) => {
            console.error(`❌ Error connecting to MongoDB: ${error.message}`);
            cached.promise = null;
            cached.conn = null;
            throw error;
        });
    }

    try {
        cached.conn = await cached.promise;
        // Verify connection is still active
        if (mongoose.connection.readyState !== 1) {
            // Connection lost, reset and reconnect
            cached.conn = null;
            cached.promise = null;
            return connectDB();
        }
    } catch (e) {
        cached.promise = null;
        cached.conn = null;
        throw e;
    }

    return cached.conn;
};

module.exports = connectDB;

