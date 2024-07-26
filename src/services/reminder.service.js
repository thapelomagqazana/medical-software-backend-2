const Reminder = require("../models/reminder.model");

exports.setMedicationReminderService = async (reminderData) => {
    const reminder = new Reminder(reminderData);
    await reminder.save();
    return reminder;
};