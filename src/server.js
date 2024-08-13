const app = require("./app");
const connectDB = require("./config/db");

// Load environment variables from .env file
require('dotenv').config();


/**
 * @module Server
 * @description Main server module for starting the Express server and connecting to the database.
 */

const PORT = process.env.PORT || 5000;


/**
 * @function connectDB
 * @description Connects to the database.
 * @memberof module:Server
 */
connectDB();

/**
 * @description Starts the Express server and listens on the specified port.
 * @name listen
 * @function
 * @memberof module:Server
 * @param {number} port - The port number on which the server should listen.
 * @param {function} callback - The callback function to execute once the server is running.
 */
app.listen(PORT, () => {
    console.log(`${new Date()}: Server is running on port ${PORT}`);
});