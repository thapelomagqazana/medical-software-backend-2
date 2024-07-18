const express = require("express");
const patientController = require("../controllers/patient.controller");
const { registerPatientValidationRules } = require("../validators/patient.validation");

const router = express.Router();

router.post("/register", registerPatientValidationRules, patientController.registerPatient);

module.exports = router;