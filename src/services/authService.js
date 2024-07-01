const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

require('dotenv').config();

// Register a new user
exports.registerUserService = async ({ email, password, role, firstName, lastName }) => {
    try {
        let user = await User.findOne({ email });

        if (user) {
            return { error: "User already exists" };
        }

        user = new User({
            email,
            password,
            role,
            firstName,
            lastName,
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        return { message: "User registered successfully" };
    } catch (error) {
        console.error(error.message);
        return { error: "Server Error"};
    }
};

// Authenticate user and generate JWT token
exports.loginUserService = async ({ email, password }) => {
    try {
        let user = await User.findOne({ email });

        if (!user) {
            return { error: "Invalid credentials" };
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return { error: "Invalid credentials" };
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role,
            },
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
        return { token };
    } catch (error) {
        console.error(error.message);
        return { error: "Server error" };
    }
};