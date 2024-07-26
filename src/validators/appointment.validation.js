const { body } = require('express-validator');

const bookAppointmentValidationRules = [
    body('doctorId')
        .notEmpty().withMessage('Doctor ID is required')
        .isMongoId().withMessage('Doctor ID must be a valid Mongo ID'),
    body('startTime')
        .notEmpty().withMessage('Start time is required')
        .isISO8601().withMessage('Start time must be a valid ISO8601 date-time'),
    body('endTime')
        .notEmpty().withMessage('End time is required')
        .isISO8601().withMessage('End time must be a valid ISO8601 date-time')
        .custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.startTime)) {
                throw new Error('End time must be after start time');
            }
            return true;
        }),
    body('reason')
        .notEmpty().withMessage('Reason is required')
        .isString().withMessage('Reason must be a string'),
];

const updateAppointmentValidationRules = [
    body('startTime')
        .optional()
        .isISO8601().withMessage('Start time must be a valid ISO8601 date-time'),
    body('endTime')
        .optional()
        .isISO8601().withMessage('End time must be a valid ISO8601 date-time')
        .custom((value, { req }) => {
            if (value && new Date(value) <= new Date(req.body.startTime || req.body.currentStartTime)) {
                throw new Error('End time must be after start time');
            }
            return true;
        }),
    body('reason')
        .optional()
        .isString().withMessage('Reason must be a string'),
    body('status')
        .optional()
        .isIn(['scheduled', 'cancelled', 'completed']).withMessage('Invalid status'),
];

module.exports = {
    bookAppointmentValidationRules,
    updateAppointmentValidationRules,
};