const { getUserById, updateUserProfile, deleteUserProfile } = require("../services/userService");

/**
 * Get user profile by ID
 * @param {string} userId - User ID
 * @returns {Object} User profile information
 */
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await getUserById(userId);
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
    try {
        const userId = req.user.id;
        const updatedProfile = req.body;
        const user = await updateUserProfile(userId, updatedProfile);
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
