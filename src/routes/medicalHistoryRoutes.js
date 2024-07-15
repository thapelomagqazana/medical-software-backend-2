const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { grantAccess } = require('../middleware/rbacMiddleware');
const { body, param } = require('express-validator');
const medicalHistoryController = require('../controllers/medicalHistoryController');

/**
 * Retrieves the medical history for a specified user. Includes authorization check.
 * 
 * @route GET /api/medical-history/:userId
 * @param {param} userId - The ID of the user whose medical history is being retrieved. Must be a valid MongoDB Object ID.
 * @access Private
 */
router.get('/:userId', [
    // Validate and sanitize userId parameter
    param('userId').isMongoId().withMessage('Invalid user ID format'),
], authMiddleware, 
medicalHistoryController.getMedicalHistory);

/**
 * Adds a medical record to the medical history of a specified user.
 * 
 * @route POST /api/medical-history/:userId
 * @param {param} userId - The user ID for whom the medical record is added. Must be a valid MongoDB Object ID.
 * @body {string} condition - The medical condition to record.
 * @body {string} diagnosisDate - The date of diagnosis, must be a valid ISO 8601 date string.
 * @access Private
 */
router.post('/:userId', [
    // Validate and sanitize userId parameter
    param('userId').isMongoId().withMessage('Invalid user ID format'),
    // Validate and sanitize incoming request body fields
    body('condition').notEmpty().isString(),
    body('diagnosisDate').notEmpty().isISO8601().toDate(),
], authMiddleware, 
medicalHistoryController.addMedicalRecord);

/**
 * Updates a specific medical record in the medical history.
 * 
 * @route PUT /api/medical-history/:recordId
 * @param {param} recordId - The ID of the medical record to update. Must be a valid MongoDB Object ID.
 * @body {string} condition - (Optional) The updated medical condition.
 * @body {string} diagnosisDate - (Optional) The updated date of diagnosis, converted to a Date object.
 * @access Private
 */
router.put('/:recordId', [
    // Validate and sanitize recordId parameter
    param('recordId').isMongoId().withMessage('Invalid record ID format'),
    // Validate and sanitize incoming request body fields
    body('condition').optional().isString(),
    body('diagnosisDate').optional().isISO8601().toDate(),
], authMiddleware, 
medicalHistoryController.updateMedicalRecord);

/**
 * Deletes a specific medical record from the medical history.
 * 
 * @route DELETE /api/medical-history/:recordId
 * @param {param} recordId - The ID of the medical record to delete. Must be a valid MongoDB Object ID.
 * @access Private
 */
router.delete('/:recordId', [
    // Validate and sanitize recordId parameter
    param('recordId').isMongoId().withMessage('Invalid record ID format'),
], authMiddleware, 
medicalHistoryController.deleteMedicalRecord);

module.exports = router;