const { validationResult } = require('express-validator');
const { 
    createPatientService,
    getPatientProfileService,
    loginPatientService,
    updatePatientProfileService } = require("../services/patient.service");

exports.registerPatient = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const patientData = req.body;
        const patient = await createPatientService(patientData);
        res.status(201).json(patient);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.loginPatient = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const patientData = req.body;
        const token = await loginPatientService({ email: patientData.email, password: patientData.password});
        res.status(200).json({ token: token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getPatientProfile = async (req, res) => {
    try {
        const patientId = req.params.id;
        const patient = await getPatientProfileService(patientId);
        res.status(200).json(patient);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

exports.updatePatientProfile = async (req, res) => {
    try {
        const patientId = req.params.id;
        const updateData = req.body;
        const patient = await updatePatientProfileService(patientId, updateData);
        res.status(200).json(patient);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};