const { 
    getPatientMedicationsService,
    updateMedicationService } = require("../services/medication.service");

const { validationResult } = require("express-validator");

/**
 * Controller to fetch all medications for a specific patient.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} - Response with the list of medications.
 */
exports.getPatientMedications = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { patientId } = req.params;
        const medications = await getPatientMedicationsService(patientId);

        if (!medications.length) {
            return res.status(404).json({ message: "No medications found for this patient." })
        }
        res.status(200).json(medications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Controller that Updates a medication for a patient.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
exports.updateMedication = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const { patientId, medicationId } = req.params;
        const updateData = req.body;

        const updatedMedication = await updateMedicationService(patientId, medicationId, updateData);

        res.status(200).json(updatedMedication);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};