const Medication = require("../models/medication.model");

/**
 * Fetches all medications for a specific patient.
 * @param {string} patientId - The ID of the patient.
 * @returns {Promise<Array>} - A promise that resolves to an array of medications.
 */
exports.getPatientMedicationsService = async (patientId) => {
    return await Medication.find({ patientId }).populate('prescribedBy', 'firstName lastName');
};

/**
 * Updates an existing medication for a patient.
 *
 * @param {String} patientId - The ID of the patient.
 * @param {String} medicationId - The ID of the medication to update.
 * @param {Object} updateData - The updated medication data.
 * @returns {Promise<Object>} The updated medication object.
 * @throws {Error} If the medication is not found or there is a database error.
 */
exports.updateMedicationService = async (patientId, medicationId, updateData) => {
    try {
        console.log(patientId);
        console.log(medicationId);
        console.log(updateData);
        const medication = await Medication.findOneAndUpdate(
            { _id: medicationId, patientId: patientId },
            updateData,
            { new: true, runValidators: true }
        );

        if (!medication) {
            throw new Error("Medication not found or does not belong to this patient");
        }

        return medication;
    } catch (error) {
        throw new Error(error.message);
    }
};