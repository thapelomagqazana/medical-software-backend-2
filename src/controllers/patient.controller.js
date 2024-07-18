const { validationResult } = require('express-validator');
const { createPatient } = require("../services/patient.service");

exports.registerPatient = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const patientData = req.body;
        const patient = await createPatient(patientData);
        res.status(201).json(patient);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};