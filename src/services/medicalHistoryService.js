const MedicalHistory = require("../models/MedicalHistory");

/**
 * Retrieves the medical history for a specific user.
 * 
 * @param {string} userId - The ID of the user whose medical history is being retrieved.
 * @returns {Promise<Array>} A promise that resolves to an array of medical history records.
 * @throws {Error} If an error occurs during the database operation.
 */
exports.getMedicalHistoryService = async (userId) => {
    try {
        const medicalHistory = await MedicalHistory.find({ userId });
        return medicalHistory;
    } catch (error){
        throw new Error(error.message);
    }
};

/**
 * Adds a new medical record for a user.
 * 
 * @param {Object} params - The medical record parameters.
 * @param {string} params.userId - The ID of the user.
 * @param {string} params.condition - The medical condition being recorded.
 * @param {Date} params.diagnosisDate - The date of diagnosis.
 * @returns {Promise<Object>} A promise that resolves to the newly created medical record.
 * @throws {Error} If an error occurs during the database operation.
 */
exports.addMedicalRecordService = async ({ userId, condition, diagnosisDate }) => {
    try {
        const newRecord = new MedicalHistory({ userId, condition, diagnosisDate });
        const savedRecord = await newRecord.save();
        return savedRecord;
    } catch (error){
        throw new Error(error.message);
    }
};

/**
 * Updates an existing medical record.
 * 
 * @param {Object} params - The update parameters.
 * @param {string} params.recordId - The ID of the medical record to update.
 * @param {Object} params.updatedRecord - An object containing the updated values for the record.
 * @returns {Promise<Object>} A promise that resolves to the updated medical record.
 * @throws {Error} If the medical record is not found or an error occurs during the update.
 */
exports.updateMedicalRecordService = async ({ recordId, updatedRecord }) => {
    try {
        const record = await MedicalHistory.findByIdAndUpdate(recordId, updatedRecord, { new: true });
        if (!record) {
            throw new Error("Medical record not found");
        }
        return record;
    } catch (error) {
        throw new Error(error.message);
    }
};

/**
 * Deletes a medical record.
 * 
 * @param {string} recordId - The ID of the medical record to delete.
 * @throws {Error} If the medical record is not found or an error occurs during deletion.
 */
exports.deleteMedicalRecordService = async (recordId) => {
    try {
        const deletedRecord = await MedicalHistory.findByIdAndDelete(recordId);
        if (!deletedRecord) {
            throw new Error("Medical record not found");
        }

    } catch (error){
        throw new Error(error.message);
    }
};

