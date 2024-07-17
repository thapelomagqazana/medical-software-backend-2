const User = require("../models/User");

/**
 * Retrieves a user by ID excluding the password from the result.
 * 
 * @param {string} userId - The ID of the user to retrieve.
 * @returns {Promise<Object>} A promise that resolves to the user object.
 * @throws {Error} Throws an error if the user is not found or if an internal error occurs.
 */
const getUserByIdService = async (userId) => {
    try {
        const user = await User.findById(userId).select("-password");
        if (!user){
            throw new Error("User not found");
        }
        return user;
    } catch (error) {
        throw new Error(error.message);
    }
};

/**
 * Updates a user's profile information.
 * 
 * @param {string} userId - The ID of the user whose profile is to be updated.
 * @param {Object} updateProfile - An object containing the updates to be applied to the user's profile.
 * @returns {Promise<Object>} A promise that resolves to the updated user object.
 * @throws {Error} Throws an error if the user is not found or if an internal error occurs.
 */
const updateUserProfileService = async (userId, updateProfile) => {
    try {
        const user = await User.findByIdAndUpdate(userId, updateProfile, { new: true });
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    } catch (error) {
        throw new Error(error.message);
    }
};

/**
 * Deletes a user's profile.
 * 
 * @param {string} userId - The ID of the user to be deleted.
 * @returns {Promise<Object>} A promise that resolves to the deleted user object.
 * @throws {Error} Throws an error if the user is not found or if an internal error occurs.
 */
const deleteUserProfileService = async (userId) => {
    try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    } catch (error) {
        throw new Error(error.message);
    }
};

const updateProfilePictureService = async (patientId, filePath) => {
    try {
        const patient = await User.findById(patientId);
        console.log(patient);
        if (!patient) {
            throw new Error("Patient not found");
        }

        patient.profilePicture = filePath; // Update the profile picture path
        await patient.save();
        return patient;
    } catch (error) {
        throw new Error("Failed to update profile picture: " + error.message);
    }
};

module.exports = {
    getUserByIdService,
    updateUserProfileService,
    deleteUserProfileService,
    updateProfilePictureService
};