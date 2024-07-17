const { getPrescriptionForPatient } = require("../services/prescriptionService");

/**
 * Retrieves all prescriptions for a patient.
 * @param {Object} req - Express request object containing the patientId in the query.
 * @param {Object} res - Express response object used to send the response.
 * @param {Function} next - Callback to pass control to the next middleware function.
 */
exports.viewPrescriptions = async (req, res, next) => {
    try {
        const patientId = req.params.patientId;
        const prescriptions = await getPrescriptionForPatient(patientId);
        res.json(prescriptions);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};