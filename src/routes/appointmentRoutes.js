const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { grantAccess } = require('../middleware/rbacMiddleware');
const { body, param } = require("express-validator");
const appointmentController = require("../controllers/appointmentController");

// GET /api/appointments
router.get('/', authMiddleware, appointmentController.getAppointments);

// GET /api/appointments/:id
router.get('/:id',[
    // Validate and sanitize appointmentId parameter
    param('id').isMongoId().withMessage('Invalid appointment ID format'),
], authMiddleware, 
appointmentController.getAppointmentById);

// POST /api/appointments
router.post('/', [
  // Validate and sanitize incoming request body fields
  body('patientId').notEmpty().isString(),
  body('doctorId').notEmpty().isString(),
  body('startTime').notEmpty().isISO8601().toDate(),
  body('endTime').notEmpty().isISO8601().toDate(),
], authMiddleware, 
appointmentController.createAppointment);

// PUT /api/appointments/:id
router.put('/:id', [
    // Validate and sanitize appointmentId parameter
    param('id').isMongoId().withMessage('Invalid appointment ID format'),
    // Validate and sanitize incoming request body fields
    body('patientId').optional().isString(),
    body('doctorId').optional().isString(),
    body('startTime').optional().isISO8601().toDate(),
    body('endTime').optional().isISO8601().toDate(),
], authMiddleware, appointmentController.updateAppointment);

// DELETE /api/appointments/:id
router.delete('/:id', [
    // Validate and sanitize appointmentId parameter
    param('id').isMongoId().withMessage('Invalid appointment ID format'),
], authMiddleware, appointmentController.deleteAppointment);

module.exports = router;