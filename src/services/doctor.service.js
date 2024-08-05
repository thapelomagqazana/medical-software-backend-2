const Doctor = require("../models/doctor.model");
const Appointment = require("../models/appointment.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { toZonedTime } = require("date-fns-tz");

// Load environment variables from .env file
require('dotenv').config();

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

exports.loginDoctorService = async ({ email, password }) => {
    try {
        let doctor = await Doctor.findOne({ email });

        if (!doctor) {
            throw new Error("Invalid credentials");
        }

        const isMatch = await bcrypt.compare(password, doctor.password);

        if (!isMatch) {
            throw new Error("Invalid credentials");
        }

        const payload = {
            user: {
                id: doctor.id
            },
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
        return token;
    } catch (error) {
        console.error(error.message);
        throw new Error(error.message);
    }
};


/**
 * Get the available and unavailable slots for a specific doctor on a specific date.
 * @param {Date} date - The date to fetch the slots for.
 * @param {String} doctorId - The ID of the doctor to fetch the slots for.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the doctor and their slots.
 */
exports.getDoctorWithSlots = async (date, doctorId) => {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
        throw new Error("Doctor not found");
    }

    // Create local start and end times for the day in the Johannesburg time zone
    const startOfDayLocal = new Date(date.setHours(9, 0, 0, 0));
    const endOfDayLocal = new Date(date.setHours(17, 0, 0, 0));

    const isWeekend = date.getDay() === 6 || date.getDay() === 0;
    if (isWeekend) {
        endOfDayLocal.setHours(14);
    }

    const timeZone = process.env.TIMEZONE;

    // Convert local times to UTC
    const startOfDay = toZonedTime(startOfDayLocal, timeZone);
    const endOfDay = toZonedTime(endOfDayLocal, timeZone);

    // Generate time slots from startOfDay to endOfDay in UTC
    const timeSlots = [];
    for (let slot = new Date(startOfDay); slot < endOfDay; slot = new Date(slot.getTime() + 60 * 60 * 1000)) {
        timeSlots.push(slot);
    }

    const appointments = await Appointment.find({
        doctorId,
        startTime: { $gte: startOfDay, $lt: endOfDay }
    });

    const slots = timeSlots.map((slot) => {
        const isAvailable = !appointments.some((appointment) =>
            appointment.startTime.getTime() <= slot.getTime() &&
            appointment.endTime.getTime() > slot.getTime()
        );

        return { time: slot.toISOString(), available: isAvailable };
    });

    return { slots };
};
