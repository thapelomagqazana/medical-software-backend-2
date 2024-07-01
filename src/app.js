const express = require("express");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");

const app = express();


/**
 * @module App
 * @description Main application module for setting up the Express server and routes.
 */

/**
 * @description Middleware to parse JSON request bodies.
 * @name useJson
 * @function
 * @memberof module:App
 */
app.use(express.json({ extended: false }));

// Define Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes); // New profile routes

/**
 * @description Default route to check if the API is running.
 * @name getDefaultRoute
 * @function
 * @memberof module:App
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {string} - Returns a message indicating the API is running.
 */
app.get('/', (req, res) => res.send('API running'));

module.exports = app;