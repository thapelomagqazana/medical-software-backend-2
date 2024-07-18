const express = require("express");
const doctorController = require("../controllers/doctor.controller");
const { registerDoctorValidationRules } = require("../validators/doctor.validation");

const router = express.Router();

router.post("/register", registerDoctorValidationRules, doctorController.registerDoctor);

module.exports = router;