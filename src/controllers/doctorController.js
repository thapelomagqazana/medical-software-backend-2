const { getAllDoctorsService } = require("../services/doctorService");

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