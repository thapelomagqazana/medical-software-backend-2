const Patient = require("../models/patient.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require('dotenv').config();

exports.createPatientService = async (patientData) => {
    const existingPatient = await Patient.findOne({ email: patientData.email });
    if (existingPatient) {
        throw new Error("Email already exists");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(patientData.password, saltRounds);
    patientData.password = hashedPassword;

    const patient = new Patient(patientData);
    await patient.save();
    return patient;
};

exports.loginPatientService = async ({ email, password }) => {
    try {
        let patient = await Patient.findOne({ email });

        if (!patient) {
            throw new Error("Invalid credentials");
        }

        const isMatch = await bcrypt.compare(password, patient.password);
        if (!isMatch) {
            throw new Error("Invalid credentials");
        }

        const payload = {
            user: {
                id: patient.id
            },
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
        return token;
    } catch (error) {
        throw new Error(error.message);
    }
};

exports.getPatientProfileService = async (id) => {
    const patient = await Patient.findById(id);
    if (!patient) {
        throw new Error("Patient not found");
    }
    return patient;
};

exports.updatePatientProfileService = async (id, updateData) => {
    const existingPatient = await Patient.findOne({ email: updateData.email });
    if (existingPatient) {
        throw new Error("Email already exists");
    }

    const patient = await Patient.findByIdAndUpdate(id, updateData, { new: true });
    if (!patient) {
        throw new Error("Patient not found");
    }
    return patient;
};