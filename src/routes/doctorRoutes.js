const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { grantAccess } = require('../middleware/rbacMiddleware');
const doctorController = require("../controllers/doctorController");

/**
 * @route   GET /api/doctors
 * @desc    Get all doctors
 * @access  Public
 */
router.get("/", authMiddleware, doctorController.getAllDoctors);

/**
 * @route   GET /api/doctors/patients
 * @desc    Retrieve patients for a doctor
 * @access  Public
 */
router.get("/patients", authMiddleware, doctorController.getAssignedPatients);

module.exports = router;