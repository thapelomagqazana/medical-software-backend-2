const express = require("express");
const doctorController = require("../controllers/doctor.controller");
const authMiddleware = require("../middleware/authMiddleware");
const { 
    registerDoctorValidationRules,
    validateFetchDoctorWithSlots,
    loginDoctorValidationRules } = require("../validators/doctor.validation");


const router = express.Router();

router.post("/register", registerDoctorValidationRules, doctorController.registerDoctor);
router.post("/login", loginDoctorValidationRules, doctorController.loginDoctor);
router.get('/slots', authMiddleware, validateFetchDoctorWithSlots, doctorController.fetchDoctorWithSlots);
router.get('/', authMiddleware, doctorController.fetchDoctors);



module.exports = router;