const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    medications: [{
        name: String,
        dose: String,
        frequency: String,
        duration: String
    }],
    prescribedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    datePrescribed: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Prescription", prescriptionSchema);