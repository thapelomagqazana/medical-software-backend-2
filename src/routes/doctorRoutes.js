const express = require("express");
const doctorController = require("../controllers/doctor.controller");
const authMiddleware = require("../middleware/authMiddleware");
const { 
    registerDoctorValidationRules,
    validateFetchDoctorsWithSlots,
    loginDoctorValidationRules } = require("../validators/doctor.validation");


const router = express.Router();

router.post("/register", registerDoctorValidationRules, doctorController.registerDoctor);
router.post("/login", loginDoctorValidationRules, doctorController.loginDoctor);
router.get('/slots', authMiddleware, validateFetchDoctorsWithSlots, doctorController.fetchDoctorsWithSlots);
router.get('/', authMiddleware, doctorController.fetchDoctors);



module.exports = router;