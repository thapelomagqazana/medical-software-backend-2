const Patient = require("../models/patient.model");
const bcrypt = require("bcrypt");

exports.createPatient = async (patientData) => {
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