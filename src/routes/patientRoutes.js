const express = require("express");
const patientController = require("../controllers/patient.controller");
const appointmentController = require("../controllers/appointment.controller");
const medicationController = require("../controllers/medication.controller");
const reminderController = require("../controllers/reminder.controller");
const authMiddleware = require("../middleware/authMiddleware");
const { grantAccess } = require('../middleware/rbacMiddleware');
const { 
    registerPatientValidationRules,
    loginPatientValidationRules } = require("../validators/patient.validation");
const { 
    bookAppointmentValidationRules,
    updateAppointmentValidationRules } = require("../validators/appointment.validation");

const { 
    setReminderValidationRules } = require("../validators/reminder.validation");

const router = express.Router();

router.post("/register", registerPatientValidationRules, patientController.registerPatient);
router.post("/login", loginPatientValidationRules, patientController.loginPatient);

router.get("/:id/profile", authMiddleware, patientController.getPatientProfile);
router.put("/:id/profile", authMiddleware, patientController.updatePatientProfile);

router.get("/:id/appointments", authMiddleware, appointmentController.getPatientAppointments);
router.get("/:id/appointments/upcoming", authMiddleware, 
    appointmentController.getUpcomingAppointmentsByPatient);
router.post("/:id/appointments", 
    authMiddleware, 
    bookAppointmentValidationRules, 
    appointmentController.bookAppointment);
router.put('/:id/appointments/:appointmentId', 
    authMiddleware, 
    updateAppointmentValidationRules, 
    appointmentController.updateAppointment);


router.get("/:id/medications", authMiddleware, medicationController.getPatientMedications);
router.post("/:id/medications/reminders", 
    authMiddleware, 
    setReminderValidationRules, 
    reminderController.setMedicationReminder);

module.exports = router;