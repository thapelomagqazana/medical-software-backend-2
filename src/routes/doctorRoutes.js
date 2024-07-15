const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { grantAccess } = require('../middleware/rbacMiddleware');
const doctorController = require("../controllers/doctorController");

/**
 * Retrieves a list of all doctors from the system.
 * This route is intended to be public but includes an authentication middleware to ensure 
 * that only authenticated users can view the list.
 *
 * @route GET /api/doctors
 * @access Public (requires authentication due to middleware)
 */
router.get("/", authMiddleware, doctorController.getAllDoctors);

/**
 * Retrieves a list of patients assigned to the currently authenticated doctor.
 * The actual doctor's identity is determined by the authentication token provided.
 * This ensures that each doctor only accesses their own list of patients.
 *
 * @route GET /api/doctors/patients
 * @access Public (requires authentication due to middleware)
 */
router.get("/patients", authMiddleware, doctorController.getAssignedPatients);

module.exports = router;