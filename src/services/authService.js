const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

require('dotenv').config();

/**
 * Registers a new user in the database.
 * 
 * @param {Object} params - The registration details.
 * @param {string} params.email - The user's email address.
 * @param {string} params.password - The user's password.
 * @param {string} params.role - The user's role.
 * @param {string} params.firstName - The user's first name.
 * @param {string} params.lastName - The user's last name.
 * @returns {Promise<Object>} A promise that resolves to a message object on success, or an error object if the user already exists.
 * @throws {Error} If there is a server error during the operation.
 */
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

/**
 * Authenticates a user and generates a JWT token.
 * 
 * @param {Object} params - The login details.
 * @param {string} params.email - The user's email address.
 * @param {string} params.password - The user's password.
 * @returns {Promise<Object>} A promise that resolves to a token object on successful authentication, or an error object if credentials are invalid.
 * @throws {Error} If there is a server error during the operation.
 */
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