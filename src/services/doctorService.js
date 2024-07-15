const User = require("../models/User");
const Appointment = require("../models/Appointment");

// Service for retrieving all doctors in the database
exports.getAllDoctorsService = async () => {
    try {
        return await User.find({
            role: "doctor"
        }).select("-password"); // Exclude sensitive fields like password
    } catch (err) {
        throw new Error(err.message);
    }
};

// Service for retrieving a list of patients assigned to a specified doctor
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