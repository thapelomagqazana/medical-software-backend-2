const User = require("../models/User");

// Service for retrieving all doctors in the database
exports.getAllDoctorsService = async () => {
    try {
        return await User.find({
            role: "doctor"
        }).select("-password"); // Exclude sensitive fields like password
    } catch (err) {
        throw new Error(err.message);
    }
};