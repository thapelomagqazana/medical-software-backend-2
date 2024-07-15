const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

/**
 * Registers a new user with the required details. Performs validation to ensure that
 * the email is valid, the password meets the minimum length requirement, and both
 * first name and last name are provided.
 *
 * @route POST /api/auth/register
 * @desc Registers a new user and returns user data if successful.
 * @access Public
 * @validation
 *    email: Must be a valid email format.
 *    password: Must be at least 6 characters long.
 *    firstName: Must not be empty.
 *    lastName: Must not be empty.
 */
router.post(
  '/register',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('firstName', 'First name is required').notEmpty(),
    check('lastName', 'Last name is required').notEmpty(),
  ],
  registerUser
);

/**
 * Authenticates a user using their email and password. If successful, returns a JWT token
 * which can be used to authenticate subsequent requests. Validation ensures that the
 * email is in a valid format and the password is present.
 *
 * @route POST /api/auth/login
 * @desc Authenticates user and returns a JWT token if successful.
 * @access Public
 * @validation
 *    email: Must be a valid email format.
 *    password: Must be present.
 */
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  loginUser
);

module.exports = router;
