const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { grantAccess } = require('../middleware/rbacMiddleware');
const medicalHistoryController = require('../controllers/medicalHistoryController');

// GET /api/medical-history/:userId
router.get('/:userId', authMiddleware, medicalHistoryController.getMedicalHistory);

// POST /api/medical-history/:userId
router.post('/:userId', authMiddleware, medicalHistoryController.addMedicalRecord);

// PUT /api/medical-history/:recordId
router.put('/:recordId', authMiddleware, medicalHistoryController.updateMedicalRecord);

// DELETE /api/medical-history/:recordId
router.delete('/:recordId', authMiddleware, medicalHistoryController.deleteMedicalRecord);

module.exports = router;