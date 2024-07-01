/**
 * @fileoverview Configures and connects to the MongoDB database using Mongoose.
 */
const mongoose = require("mongoose");

/**
 * Connects to the MongoDB database.
 *
 * This function uses the Mongoose library to establish a connection to the MongoDB database specified by the MONGO_URI environment variable. It uses the `useNewUrlParser` and `useUnifiedTopology` options for compatibility and stability.
 *
 * @async
 * @function connectDB
 * @returns {Promise<void>} A promise that resolves when the connection is successfully established.
 * @throws {Error} Throws an error if the connection fails, logging the error message to the console and exiting the process.
 */

const connectDB = async () => {
    // Attempt to connect to the MongoDB database
    try {
        await mongoose.connect(process.env.MONGO_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log("MongoDB Connected");
      } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
      }
};

module.exports = connectDB;