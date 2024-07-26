const { 
    setMedicationReminderService } = require("../services/reminder.service");

const { validationResult } = require("express-validator");

exports.setMedicationReminder = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const patientId = req.params.id;
        const reminderData = { ...req.body, patientId };
        const reminder = await setMedicationReminderService(reminderData);
        res.status(201).json(reminder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};