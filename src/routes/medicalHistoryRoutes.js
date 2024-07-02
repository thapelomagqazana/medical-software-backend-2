const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { grantAccess } = require('../middleware/rbacMiddleware');
const { body, param } = require('express-validator');
const medicalHistoryController = require('../controllers/medicalHistoryController');

// GET /api/medical-history/:userId
router.get('/:userId', [
    // Validate and sanitize userId parameter
    param('userId').isMongoId().withMessage('Invalid user ID format'),
], authMiddleware, 
medicalHistoryController.getMedicalHistory);

// POST /api/medical-history/:userId
router.post('/:userId', [
    // Validate and sanitize userId parameter
    param('userId').isMongoId().withMessage('Invalid user ID format'),
    // Validate and sanitize incoming request body fields
    body('condition').notEmpty().isString(),
    body('diagnosisDate').notEmpty().isISO8601().toDate(),
], authMiddleware, 
medicalHistoryController.addMedicalRecord);

// PUT /api/medical-history/:recordId
router.put('/:recordId', [
    // Validate and sanitize recordId parameter
    param('recordId').isMongoId().withMessage('Invalid record ID format'),
    // Validate and sanitize incoming request body fields
    body('condition').optional().isString(),
    body('diagnosisDate').optional().isISO8601().toDate(),
], authMiddleware, 
medicalHistoryController.updateMedicalRecord);

// DELETE /api/medical-history/:recordId
router.delete('/:recordId', [
    // Validate and sanitize recordId parameter
    param('recordId').isMongoId().withMessage('Invalid record ID format'),
], authMiddleware, 
medicalHistoryController.deleteMedicalRecord);

module.exports = router;