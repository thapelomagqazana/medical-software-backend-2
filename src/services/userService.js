const User = require("../models/User");

const getUserById = async (userId) => {
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

const updateUserProfile = async (userId, updateProfile) => {
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

const deleteUserProfile = async (userId) => {
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
    getUserById,
    updateUserProfile,
    deleteUserProfile,
};