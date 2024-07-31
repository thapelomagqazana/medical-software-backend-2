const { body, query } = require('express-validator');

const registerDoctorValidationRules = [
    body('firstName').notEmpty().withMessage('First Name is required'),
    body('lastName').notEmpty().withMessage('Last Name is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('specialty').notEmpty().withMessage('Specialty is required'),
    body('licenseNumber').notEmpty().withMessage('License number is required'),
];

const loginDoctorValidationRules = [
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

const validateFetchDoctorsWithSlots = [
    query('date')
        .isISO8601()
        .withMessage('Date must be a valid ISO 8601 date'),
];

module.exports = {
    registerDoctorValidationRules,
    validateFetchDoctorsWithSlots,
    loginDoctorValidationRules,
};