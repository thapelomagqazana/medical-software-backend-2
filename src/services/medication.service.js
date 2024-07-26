const Medication = require("../models/medication.model");

exports.getPatientMedicationsService = async (patientId) => {
    return await Medication.find({ patientId }).populate('prescribedBy', 'firstName lastName');
};