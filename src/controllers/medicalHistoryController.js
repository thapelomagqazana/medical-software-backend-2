const { 
    getMedicalHistoryService, 
    addMedicalRecordService, 
    updateMedicalRecordService, 
    deleteMedicalRecordService } = require("../services/medicalHistoryService");

const { validationResult } = require("express-validator");

/**
 * Get medical history for a user
 * @param {string} userId - User ID
 * @returns {Array} List of medical records
 */
exports.getMedicalHistory = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const userId = req.params.userId;
        const medicalHistory = await getMedicalHistoryService(userId);
        res.status(200).json(medicalHistory);
    } catch (error){
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

/**
 * Add new medical record for a user
 * @param {string} userId - User ID
 * @param {Object} newRecord - New medical record information
 * @returns {Object} Added medical record
 */
exports.addMedicalRecord = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const userId = req.params.userId;
        const { condition, diagnosisDate } = req.body;
        const newRecord = await addMedicalRecordService({ userId, condition, diagnosisDate });
        res.status(201).json(newRecord);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

/**
 * Update existing medical record
 * @param {string} recordId - Medical record ID
 * @param {Object} updatedRecord - Updated record information
 * @returns {Object} Updated medical record
 */
exports.updateMedicalRecord = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const recordId = req.params.recordId;
        const updatedRecord = req.body;
        
        const record = await updateMedicalRecordService({ recordId, updatedRecord });
        res.status(200).json(record);
    } catch (error){
        console.error(error);
        if (error.message === "Medical record not found") {
            res.status(404).json({ message: "Medical record not found" });
        } else {
            res.status(500).json({ message: "Server Error" });
        }
    }
};

/**
 * Delete medical record
 * @param {string} recordId - Medical record ID
 * @returns {string} Message confirming deletion
 */
exports.deleteMedicalRecord = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const recordId = req.params.recordId;
        await deleteMedicalRecordService(recordId);

        res.status(200).json({ message: 'Medical record deleted successfully' });
    } catch (error) {
        console.error(error);
        if (error.message === "Medical record not found") {
            res.status(404).json({ message: "Medical record not found" });
        } else {
            res.status(500).json({ message: "Server Error" });
        }
    }
};