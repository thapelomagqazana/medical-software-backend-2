const mongoose = require("mongoose");

const medicalHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    condition: {
        type: String,
        required: true
    },
    diagnosisDate: {
        type: Date,
        required: true
    },
});

module.exports = mongoose.model("MedicalHistory", medicalHistorySchema);