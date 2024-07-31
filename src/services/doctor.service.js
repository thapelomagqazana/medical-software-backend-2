const Doctor = require("../models/doctor.model");
const Appointment = require("../models/appointment.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
 * Get all doctors with their available and unavailable slots for a specific date.
 * @param {Date} date - The date to fetch the slots for.
 * @returns {Promise<Array>} - A promise that resolves to an array of doctors with their slots.
 */
exports.getDoctorsWithSlots = async (date) => {
    const doctors = await Doctor.find({});
    const startOfDay = new Date(date.setHours(9, 0, 0, 0));
    const endOfDay = new Date(date.setHours(17, 0, 0, 0));

    const isWeekend = date.getDay() === 6 || date.getDay() === 0;
    if (isWeekend) {
        endOfDay.setHours(14);
    }

    const timeSlots = [];
    for (let slot = startOfDay; slot < endOfDay; slot.setMinutes(slot.getMinutes() + 60)) {
        timeSlots.push(new Date(slot));
    }

    const doctorsWithSlots = await Promise.all(doctors.map(async (doctor) => {
        const appointments = await Appointment.find({
            doctorId: doctor._id,
            startTime: { $gte: startOfDay, $lt: endOfDay }
        });

        const slots = timeSlots.map((slot) => {
            const isAvailable = !appointments.some((appointment) => 
                appointment.startTime.getTime() <= slot.getTime() &&
                appointment.endTime.getTime() > slot.getTime()
            );

            return { time: slot.toISOString(), available: isAvailable };
        });

        return {
            doctor,
            slots
        };
    }));

    return doctorsWithSlots;
};
