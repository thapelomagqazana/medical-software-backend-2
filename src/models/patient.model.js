const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    dateOfBirth: {
        type: Date,
        required: true,
    },
    insuranceDetails: {
        type: String,
        required: true,
    },
    emergencyContacts: [{
        name: String,
        phone: String,
    }],
});

const Patient = mongoose.model("Patient", patientSchema);

module.exports = Patient;