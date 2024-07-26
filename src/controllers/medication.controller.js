const { 
    getPatientMedicationsService } = require("../services/medication.service");


exports.getPatientMedications = async (req, res) => {
    try {
        const patientId = req.params.id;
        const medications = await getPatientMedicationsService(patientId);
        res.status(200).json(medications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};