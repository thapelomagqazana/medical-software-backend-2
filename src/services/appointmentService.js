const Appointment = require("../models/Appointment");

exports.getAllAppointmentsService = async () => {
    try {
        return await Appointment.find();
    } catch (error) {
        throw new Error(error.message);
    }
};

exports.getAppointmentByIdService = async (id) => {
    try {
        const appointment = await Appointment.findById(id);
        if (!appointment) {
            throw new Error("Appointment not found");
        }
        return appointment;
    } catch (error) {
        throw new Error(error.message);
    }
};

exports.createAppointmentService = async ({ patientId, doctorId, startTime, endTime }) => {
    try {
        const newAppointment = new Appointment({
            patientId,
            doctorId,
            startTime,
            endTime,
        });

        return await newAppointment.save();
    } catch (error) {
        throw new Error(error.message);
    }
};

exports.updateAppointmentService = async (id, { patientId, doctorId, startTime, endTime, status }) => {
    try {
        let appointment = await Appointment.findById(id);
        if (!appointment) {
            throw new Error("Appointment not found");
        }
        appointment.patientId = patientId;
        appointment.doctorId = doctorId;
        appointment.startTime = startTime;
        appointment.endTime = endTime;
        appointment.status = status;
        return await appointment.save();
    } catch (error) {
        throw new Error(error.message);
    }
};

exports.deleteAppointmentService = async (id) => {
    try {
        const appointment = await Appointment.findById(id);
        if (!appointment) {
            throw new Error("Appointment not found");
        }
        await Appointment.deleteOne({ _id: id });
        return { msg: "Appointment removed" };
    } catch (error) {
        throw new Error(error.message);
    }
};

exports.getAppointmentsByPatientService = async (id) => {
    try {
        const upcomingAppointments = await Appointment.find({
            patientId: id,
            startTime: { $gte: new Date() }, // Filter for future appointments
        }).sort({ startTime: 1 }); // Sort by ascending order of appointment start time

        // console.log(upcomingAppointments);
        return upcomingAppointments;

    } catch (error) {
        throw new Error(error.message);
    }
};