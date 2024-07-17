const { 
    getUserByIdService, 
    updateUserProfileService, 
    deleteUserProfileService, 
    updateProfilePictureService } = require("../services/userService");
const fileStorageService = require("../services/fileStorageService");
const { validationResult } = require("express-validator");

/**
 * Get user profile by ID
 * @param {string} userId - User ID
 * @returns {Object} User profile information
 */
exports.getProfile = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const userId = req.params.userId;
        const user = await getUserByIdService(userId);
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        if (error.message === "User not found") {
            res.status(404).json({ message: "User not found" });
        } else {
            res.status(500).json({ message: "Server Error" });
        }
    }
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updatedProfile - Updated profile information
 * @returns {Object} Updated user profile
 */
exports.updateProfile = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const userId = req.params.userId;
        const updatedProfile = req.body;
        const user = await updateUserProfileService(userId, updatedProfile);
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        if (error.message === "User not found") {
            res.status(404).json({ message: "User not found" });
        } else {
            res.status(500).json({ message: "Server Error" });
        }
    }
};

/**
 * Delete user profile
 * @param {string} userId - User ID
 * @returns {Object} Deleted user profile
 */
exports.deleteProfile = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const userId = req.params.userId;
        const user = await deleteUserProfileService(userId);
        res.status(200).json({ message: 'User deleted successfully', user });
    } catch (error) {
        console.error(error);
        if (error.message === 'User not found') {
          res.status(404).json({ message: 'User not found' });
        } else {
          res.status(500).json({ message: 'Server Error' });
        }
    }
};

exports.uploadProfilePicture = fileStorageService.single("picture"), async (req, res) => {
    try {
        console.log(req.file);
        if (!req.file) {
            return res.status(400).send({ msg: "No file uploaded" });
        }

        const patient = await updateProfilePictureService(req.user.id, req.file.path);
        res.status(200).json(patient);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: error.message });
    }
};
