const Prescription = require("../models/Prescription");

exports.getPrescriptionForPatient = async (patientId) => {
    try {
        const prescriptions = await Prescription.find({ patientId }).populate('prescribedBy', 'firstName lastName');

        return prescriptions;
    } catch (error) {
        throw new Error("Error retrieving prescription: ", + error.message);
    }
};