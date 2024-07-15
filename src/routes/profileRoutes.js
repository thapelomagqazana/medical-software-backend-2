const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { grantAccess } = require('../middleware/rbacMiddleware');
const { body, param } = require('express-validator');
const profileController = require('../controllers/userController');

/**
 * Retrieves the profile of a user by their ID. Includes authorization and authentication checks.
 *
 * @route GET /api/profile/me/:userId
 * @param {param} userId - The ID of the user whose profile is being retrieved. Must be a valid MongoDB ID.
 * @access Private with role-based access (viewProfile)
 */
router.get('/me/:userId', [
    // Validate and sanitize userId parameter
    param('userId').isMongoId().withMessage('Invalid user ID format'),
], authMiddleware, grantAccess("viewProfile"), profileController.getProfile);

/**
 * Updates the profile of a user. Users can only update their own profile unless granted additional permissions.
 *
 * @route PUT /api/profile/edit/:userId
 * @param {param} userId - The ID of the user whose profile is to be updated. Must be a valid MongoDB ID.
 * @body {string} firstName - The first name to update.
 * @body {string} lastName - The last name to update.
 * @access Private with role-based access (updateProfile)
 */
router.put('/edit/:userId', [ 
    // Validate and sanitize userId parameter
    param('userId').isMongoId().withMessage('Invalid user ID format'),
    // Validate and sanitize incoming request body fields
    body('firstName').notEmpty().isString(),
    body('lastName').notEmpty().isString(), 
], authMiddleware, grantAccess("updateProfile"), profileController.updateProfile);

/**
 * Deletes a user profile by their ID. This operation is restricted and typically requires administrative privileges.
 *
 * @route DELETE /api/profile/delete/:userId
 * @param {param} userId - The ID of the user whose profile is to be deleted. Must be a valid MongoDB ID.
 * @access Private with role-based access (deleteProfile)
 */
router.delete('/delete/:userId', [
    // Validate and sanitize userId parameter
    param('userId').isMongoId().withMessage('Invalid user ID format'),
], authMiddleware, grantAccess("deleteProfile"), profileController.deleteProfile);

module.exports = router;