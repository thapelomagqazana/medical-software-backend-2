const { body } = require("express-validator");

const updateMedicationValidationRules = [
    body("name").optional().isString().withMessage("Name must be a string"),
    body("dosage").optional().isString().withMessage("Dosage must be a string"),
    body("frequency").optional().isString().withMessage("Frequency must be a string"),
    body("startDate").optional().isISO8601().toDate().withMessage("Start Date must be a valid date"),
    body("endDate").optional().isISO8601().toDate().withMessage("End Date must be a valid date"),
    body("prescribedBy").optional().isMongoId().withMessage("Prescribed By must be a valid MongoDB ID"),
];

module.exports = {
    updateMedicationValidationRules,
};