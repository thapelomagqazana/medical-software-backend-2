const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
    },
    medicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Medication",
        required: true,
    },
    reminderTime: {
        type: Date,
        required: true,
    },
    repeat: {
        type: String,
        enum: ["none", "daily", "weekly", "monthly"],
        default: "none",
        required: true,
    },
    notes: {
        type: String,
    },
}, {
    timestamps: true,
});

const Reminder = mongoose.model("Reminder", reminderSchema);

module.exports = Reminder;