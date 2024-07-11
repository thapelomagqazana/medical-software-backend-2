const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { grantAccess } = require('../middleware/rbacMiddleware');
const appointmentController = require("../controllers/appointmentController");

// GET /api/patient/upcoming-appointments
router.get("/upcoming-appointments", authMiddleware, appointmentController.getUpcomingAppointmentsByPatient);

// GET /api/patient/appointments
router.get("/appointments", authMiddleware, appointmentController.getAllAppointmentsByPatient);

module.exports = router;