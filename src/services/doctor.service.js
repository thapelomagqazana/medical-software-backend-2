const Doctor = require("../models/doctor.model");
const bcrypt = require("bcrypt");

exports.createDoctor = async (doctorData) => {
    const existingEmailDoctor = await Doctor.findOne({ email: doctorData.email });
    if (existingEmailDoctor) {
        throw new Error("Email already exists");
    }

    const existingLicenseNumberDoctor = await Doctor.findOne({ licenseNumber: doctorData.licenseNumber });

    if (existingLicenseNumberDoctor) {
        throw new Error("License Number already exists");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(doctorData.password, saltRounds);
    doctorData.password = hashedPassword;

    const doctor = new Doctor(doctorData);
    await doctor.save();
    return doctor;
};