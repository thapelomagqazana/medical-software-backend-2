const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { grantAccess } = require('../middleware/rbacMiddleware');
const profileController = require('../controllers/userController');

// GET /api/profile
router.get('/me', authMiddleware, grantAccess("viewProfile"), profileController.getProfile);

// PUT /api/profile
router.put('/edit', authMiddleware, grantAccess("viewProfile"), profileController.updateProfile);

// DELETE /api/profile/:userId (Optional)
// router.delete('/:userId', profileController.deleteProfile);

module.exports = router;