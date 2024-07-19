const jwt = require("jsonwebtoken");

require('dotenv').config();

/**
 * Authentication middleware to verify JWT token.
 * Adds user object to request object if token is valid.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authMiddleware = (req, res, next) => {
    // Get token from headers
    const token = req.header("Authorization");

    // Check if token exists
    if (!token) {
        return res.status(401).json({ message: "Authorization denied, no token provided" });
    }

    try {
        // Replace the "Bearer " prefix and trim any extra space
        const cleanToken = token.replace("Bearer ", "").trim();

        // Verify token
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);

        // Attach user from token payload to request object
        req.user = decoded.user;
        next();
    } catch (error) {
        // console.error(error.message);
        res.status(401).json({ message: "Authorization denied, invalid token" });
    }
};

module.exports = authMiddleware;
