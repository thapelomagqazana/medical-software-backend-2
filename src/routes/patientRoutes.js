const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { grantAccess } = require('../middleware/rbacMiddleware');
const appointmentController = require("../controllers/appointmentController");

/**
 * Retrieves all upcoming appointments for the currently authenticated patient.
 * Authentication is required to ensure only the patient can access their upcoming appointments.
 *
 * @route GET /api/patient/upcoming-appointments
 * @access Private
 */
router.get("/upcoming-appointments", 
    authMiddleware, // Middleware to verify the user's token and populate req.user
    appointmentController.getUpcomingAppointmentsByPatient // Controller action to retrieve appointments
);

/**
 * Retrieves all appointments for the currently authenticated patient.
 * This includes both past and future appointments, providing a comprehensive view.
 *
 * @route GET /api/patient/appointments
 * @access Private
 */
router.get("/appointments", 
    authMiddleware,  // Middleware to verify the user's token and populate req.user
    appointmentController.getAllAppointmentsByPatient  // Controller action to retrieve all appointments
);

module.exports = router;