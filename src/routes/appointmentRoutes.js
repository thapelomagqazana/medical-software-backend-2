const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { grantAccess } = require('../middleware/rbacMiddleware');
const { body, param } = require("express-validator");
const appointmentController = require("../controllers/appointmentController");

/**
 * Retrieves all appointments from the database.
 * 
 * @route GET /api/appointments/all
 * @access Private (Requires authentication)
 */
router.get('/all', authMiddleware, appointmentController.getAppointments);

/**
 * Retrieves a specific appointment by its ID.
 * 
 * @route GET /api/appointments/:id
 * @param {string} id - The ID of the appointment to retrieve. Must be a valid MongoDB Object ID.
 * @access Private (Requires authentication)
 */
router.get('/:id',[
    // Validate and sanitize appointmentId parameter
    param('id').isMongoId().withMessage('Invalid appointment ID format'),
], authMiddleware, 
appointmentController.getAppointmentById);

/**
 * Creates a new appointment with the provided patient and doctor IDs, and start/end times.
 * 
 * @route POST /api/appointments
 * @body {string} patientId - The patient's ID.
 * @body {string} doctorId - The doctor's ID.
 * @body {Date} startTime - The start time of the appointment.
 * @body {Date} endTime - The end time of the appointment.
 * @access Private (Requires authentication)
 */
router.post('/', [
  // Validate and sanitize incoming request body fields
  body('patientId').notEmpty().isString(),
  body('doctorId').notEmpty().isString(),
  body('startTime').notEmpty().isISO8601().toDate(),
  body('endTime').notEmpty().isISO8601().toDate(),
], authMiddleware, 
appointmentController.createAppointment);

/**
 * Updates an existing appointment by ID. All fields are optional; only provided fields will be updated.
 * 
 * @route PUT /api/appointments/:id
 * @param {string} id - The ID of the appointment to update. Must be a valid MongoDB Object ID.
 * @body {string} patientId - Optional. New patient's ID.
 * @body {string} doctorId - Optional. New doctor's ID.
 * @body {Date} startTime - Optional. New start time.
 * @body {Date} endTime - Optional. New end time.
 * @access Private (Requires authentication)
 */
router.put('/:id', [
    // Validate and sanitize appointmentId parameter
    param('id').isMongoId().withMessage('Invalid appointment ID format'),
    // Validate and sanitize incoming request body fields
    body('patientId').optional().isString(),
    body('doctorId').optional().isString(),
    body('startTime').optional().isISO8601().toDate(),
    body('endTime').optional().isISO8601().toDate(),
], authMiddleware, appointmentController.updateAppointment);

/**
 * Deletes an appointment by its ID.
 * 
 * @route DELETE /api/appointments/:id
 * @param {string} id - The ID of the appointment to delete. Must be a valid MongoDB Object ID.
 * @access Private (Requires authentication)
 */
router.delete('/:id', [
    // Validate and sanitize appointmentId parameter
    param('id').isMongoId().withMessage('Invalid appointment ID format'),
], authMiddleware, appointmentController.deleteAppointment);

module.exports = router;