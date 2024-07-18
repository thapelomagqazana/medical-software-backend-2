const { validationResult } = require("express-validator");
const doctorService = require("../services/doctor.service");

exports.registerDoctor = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const doctorData = req.body;
        const doctor = await doctorService.createDoctor(doctorData);
        res.status(201).json(doctor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};