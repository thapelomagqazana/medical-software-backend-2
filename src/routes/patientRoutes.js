const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { grantAccess } = require('../middleware/rbacMiddleware');
const appointmentController = require("../controllers/appointmentController");

// GET /api/patient/appointments
router.get("/appointments", authMiddleware, appointmentController.getAppointmentsByPatient);

module.exports = router;