// ============================================================
// FILE: backend/config/db.js
// PURPOSE: Handles the MongoDB database connection using Mongoose
// ============================================================
// Mongoose is an ODM (Object-Document Mapper) that lets us
// interact with MongoDB using JavaScript objects/classes instead
// of raw MongoDB queries.
// ============================================================

// Load environment variables from .env file
require('dotenv').config();

// Import mongoose for database operations
const mongoose = require('mongoose');

/**
 * connectDB - Async function that establishes a connection to MongoDB
 *
 * We export this function and call it once in server.js when the app starts.
 * If the connection fails, we log the error and exit the process — there's
 * no point running the server without a database.
 */
const connectDB = async () => {
  try {
    // mongoose.connect() returns a promise, so we await it
    // process.env.MONGO_URI comes from our .env file
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options suppress deprecation warnings in the console
      // (they tell mongoose to use the new URL parser and server discovery)
    });

    // If we reach this line, the connection was successful
    // conn.connection.host tells us which MongoDB server we connected to
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If connection fails, log a readable error message
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);

    // Exit the Node.js process with failure code 1
    // This stops the server from running without a database
    process.exit(1);
  }
};

// Export the function so server.js can import and call it
module.exports = connectDB;
