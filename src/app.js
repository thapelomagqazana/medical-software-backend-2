const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
// const authRoutes = require("./routes/authRoutes");
// const profileRoutes = require("./routes/profileRoutes");
// const medicalHistoryRoutes = require("./routes/medicalHistoryRoutes");
// const appointmentRoutes = require("./routes/appointmentRoutes");
// const patientRoutes = require("./routes/patientRoutes");
// const doctorRoutes = require("./routes/doctorRoutes");

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
// app.use(express.json({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Logging
app.use(morgan("dev"));


// Define Routes
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
// app.use("/api/auth", authRoutes);
// app.use("/api/profile", profileRoutes); 
// app.use("/api/medical-history", medicalHistoryRoutes);
// app.use("/api/appointments", appointmentRoutes);
// app.use("/api/patient", patientRoutes);
// app.use("/api/doctors", doctorRoutes);

// Catch unhandled routes
// app.all('*', (req, res) => {
//     res.status(404).send(`Cannot find ${req.originalUrl} on this server!`);
// });

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