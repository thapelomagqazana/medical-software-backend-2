const { validationResult } = require("express-validator");
const Doctor = require("../models/doctor.model");
const doctorService = require("../services/doctor.service");

exports.registerDoctor = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const doctorData = req.body;

        if (doctorData.password !== doctorData.confirmPassword) {
            return res.status(400).json({ message:"Passwords do not match" });
        }

        const doctor = await doctorService.createDoctor(doctorData);
        res.status(201).json(doctor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.loginDoctor = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const doctorData = req.body;
        const token = await doctorService.loginDoctorService({ email: doctorData.email, password: doctorData.password});
        res.status(200).json({ token: token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.fetchDoctorsWithSlots = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { date } = req.query;
        const doctorsWithSlots = await doctorService.getDoctorsWithSlots(new Date(date));
        res.status(200).json(doctorsWithSlots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.fetchDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find({});
        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
