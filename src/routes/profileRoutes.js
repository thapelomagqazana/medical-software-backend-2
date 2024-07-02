const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { grantAccess } = require('../middleware/rbacMiddleware');
const { body, param } = require('express-validator');
const profileController = require('../controllers/userController');

// GET /api/profile/me/:userId
router.get('/me/:userId', [
    // Validate and sanitize userId parameter
    param('userId').isMongoId().withMessage('Invalid user ID format'),
], authMiddleware, grantAccess("viewProfile"), profileController.getProfile);

// PUT /api/profile/edit
router.put('/edit/:userId', [ 
    // Validate and sanitize userId parameter
    param('userId').isMongoId().withMessage('Invalid user ID format'),
    // Validate and sanitize incoming request body fields
    body('firstName').notEmpty().isString(),
    body('lastName').notEmpty().isString(), 
], authMiddleware, grantAccess("updateProfile"), profileController.updateProfile);

// DELETE /api/profile/delete/:userId (Optional)
router.delete('/delete/:userId', [
    // Validate and sanitize userId parameter
    param('userId').isMongoId().withMessage('Invalid user ID format'),
], authMiddleware, grantAccess("deleteProfile"), profileController.deleteProfile);

module.exports = router;