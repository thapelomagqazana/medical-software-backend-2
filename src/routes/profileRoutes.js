const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { grantAccess } = require('../middleware/rbacMiddleware');
const profileController = require('../controllers/userController');

// GET /api/profile/me/:userId
router.get('/me/:userId', authMiddleware, grantAccess("viewProfile"), profileController.getProfile);

// PUT /api/profile/edit
router.put('/edit/:userId', authMiddleware, grantAccess("updateProfile"), profileController.updateProfile);

// DELETE /api/profile/delete/:userId (Optional)
router.delete('/delete/:userId', authMiddleware, grantAccess("deleteProfile"), profileController.deleteProfile);

module.exports = router;