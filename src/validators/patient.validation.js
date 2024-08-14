const { body, check } = require('express-validator');

const registerPatientValidationRules = [
    body('firstName').notEmpty().withMessage('First Name is required'),
    body('lastName').notEmpty().withMessage('Last Name is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('dateOfBirth').isDate().withMessage('Invalid date of birth'),
    body('insuranceDetails').notEmpty().withMessage('Insurance details are required'),
    body('emergencyContacts').isArray().withMessage('Emergency contacts must be an array'),
    body('emergencyContacts.*.name').notEmpty().withMessage('Emergency contact name is required'),
    body('emergencyContacts.*.phone').notEmpty().withMessage('Emergency contact phone number is required'),
];

const loginPatientValidationRules = [
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

const validatePatientId = [
    check("patientId", "Patient ID must be a valid MongoDB ObjectID").isMongoId(),
];

module.exports = {
    registerPatientValidationRules,
    loginPatientValidationRules,
    validatePatientId
};