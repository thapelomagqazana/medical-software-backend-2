const express = require("express");
const patientController = require("../controllers/patient.controller");
const authMiddleware = require("../middleware/authMiddleware");
const { grantAccess } = require('../middleware/rbacMiddleware');
const { 
    registerPatientValidationRules,
    loginPatientValidationRules } = require("../validators/patient.validation");

const router = express.Router();

router.post("/register", registerPatientValidationRules, patientController.registerPatient);
router.post("/login", loginPatientValidationRules, patientController.loginPatient);

router.get("/:id/profile", authMiddleware, patientController.getPatientProfile);
router.put("/:id/profile", authMiddleware, patientController.updatePatientProfile);

module.exports = router;