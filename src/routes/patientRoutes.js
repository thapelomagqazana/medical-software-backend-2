const express = require("express");
const patientController = require("../controllers/patient.controller");
const appointmentController = require("../controllers/appointment.controller");
const authMiddleware = require("../middleware/authMiddleware");
const { grantAccess } = require('../middleware/rbacMiddleware');
const { 
    registerPatientValidationRules,
    loginPatientValidationRules } = require("../validators/patient.validation");
const { 
    bookAppointmentValidationRules,
    updateAppointmentValidationRules } = require("../validators/appointment.validation");

const router = express.Router();

router.post("/register", registerPatientValidationRules, patientController.registerPatient);
router.post("/login", loginPatientValidationRules, patientController.loginPatient);

router.get("/:id/profile", authMiddleware, patientController.getPatientProfile);
router.put("/:id/profile", authMiddleware, patientController.updatePatientProfile);

router.get("/:id/appointments", authMiddleware, appointmentController.getPatientAppointments);
router.post("/:id/appointments", 
    authMiddleware, 
    bookAppointmentValidationRules, 
    appointmentController.bookAppointment);

router.put('/:id/appointments/:appointmentId', 
    authMiddleware, 
    updateAppointmentValidationRules, 
    appointmentController.updateAppointment);

module.exports = router;