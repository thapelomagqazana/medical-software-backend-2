const User = require("../models/User");

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

module.exports = {
    getUserByIdService,
    updateUserProfileService,
    deleteUserProfileService,
};