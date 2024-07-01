const MedicalHistory = require("../models/MedicalHistory");

exports.getMedicalHistoryService = async (userId) => {
    try {
        const medicalHistory = await MedicalHistory.find({ userId });
        return medicalHistory;
    } catch (error){
        throw new Error(error.message);
    }
};

exports.addMedicalRecordService = async ({ userId, condition, diagnosisDate }) => {
    try {
        const newRecord = new MedicalHistory({ userId, condition, diagnosisDate });
        const savedRecord = await newRecord.save();
        return savedRecord;
    } catch (error){
        throw new Error(error.message);
    }
};

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

