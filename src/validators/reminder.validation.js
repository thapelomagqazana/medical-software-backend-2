const { body } = require("express-validator");

const setReminderValidationRules = [
    body("medicationId")
        .notEmpty().withMessage("Medication ID is required")
        .isMongoId().withMessage("Medication ID must be a valid Mongo ID"),
    body("reminderTime")
        .notEmpty().withMessage("Reminder time is required")
        .isISO8601().withMessage("Reminder time must be a valid ISO8601 date-time"),
    body("repeat")
        .notEmpty().withMessage("Repeat is required")
        .isIn(["none", "daily", "weekly", "monthly"]).withMessage("Invalid repeat option"),
    body('notes')
        .optional()
        .isString().withMessage('Notes must be a string'),
];

module.exports = {
    setReminderValidationRules,
};