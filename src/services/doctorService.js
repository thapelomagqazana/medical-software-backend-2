const User = require("../models/User");
const Appointment = require("../models/Appointment");

/**
 * Retrieves all doctors from the database, excluding their password for security.
 * 
 * @returns {Promise<Array>} A promise that resolves to an array of doctor objects without password fields.
 * @throws {Error} If there is a database error during the fetch.
 */
exports.getAllDoctorsService = async () => {
    try {
        return await User.find({
            role: "doctor"
        }).select("-password"); // Exclude sensitive fields like password
    } catch (err) {
        throw new Error(err.message);
    }
};

/**
 * Retrieves a list of patients assigned to a specified doctor based on appointments.
 * 
 * @param {Object} params - Parameters for retrieving patients.
 * @param {string} params.doctorId - The ID of the doctor whose patients are being retrieved.
 * @returns {Promise<Array>} A promise that resolves to an array of patient objects with patient details.
 * @throws {Error} If no patients are found or if there is an error during the database query.
 */
exports.getPatientsByDoctorService = async ({ doctorId }) => {
    try {
        // console.log(doctorId);
        const appointments = await Appointment.find({ doctorId }).
        populate("patientId", 
            "firstName lastName"
        );

        if (!appointments || 
            appointments.length === 0) {
                throw new Error("No patients found");
            }
        return appointments.map(appointment => ({
            patientId: appointment.patientId._id,
            firstName: appointment.patientId.firstName,
            lastName: appointment.patientId.lastName,
        }));
    } catch (error) {
        console.error("Error fetching patients:", error);
        throw new Error("Failed to fetch patients");
    }
};