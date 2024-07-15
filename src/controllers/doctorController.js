const { 
    getAllDoctorsService, 
    getPatientsByDoctorService } = require("../services/doctorService");

/**
 * @route   GET /api/doctors
 * @desc    Get all doctors
 */
exports.getAllDoctors = async (req, res) => {
    try {
        const doctors = await getAllDoctorsService();
        res.json(doctors);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

/**
 * Controller to retrieve patients assigned to the logged-in doctor.
 * @param {Object} req - The request object. Assumes doctorId is available in req.user.id.
 * @param {Object} res - The response object.
 */
exports.getAssignedPatients = async (req, res) => {
    try {
        const doctorId = req.user.id;
        const patients = await getPatientsByDoctorService({ doctorId });

        if (!patients) {
            return res.status(404).json({ msg: 'No patients found for this doctor' });
        }

        return res.json(patients);
    } catch (error) {
        console.error('Error in getPatientsByDoctor:', error.message);
        return res.status(500).send("Server Error");
    }
};