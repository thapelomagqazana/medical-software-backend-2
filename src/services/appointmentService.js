const Appointment = require("../models/Appointment");

exports.getAllAppointmentsService = async () => {
    try {
        return await Appointment.find().populate('doctorId', 'firstName lastName');
    } catch (error) {
        throw new Error(error.message);
    }
};

exports.getAppointmentByIdService = async (id) => {
    try {
        const appointment = await Appointment.findById(id).populate('doctorId', 'firstName lastName');
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

        // Check if the doctor is already booked during the specified time
        const existingAppointment = await Appointment.findOne({
            doctorId,
            $or: [
                { startTime: { $lt: endTime, $gte: startTime } },  // Check overlapping start time
                { endTime: { $gt: startTime, $lte: endTime } }    // Check overlapping end time
            ]
        });

        if (existingAppointment) {
            throw new Error('Doctor is already booked during this time');
        }

        // Check if the patient is already booked during the specified time
        const patientAppointment = await Appointment.findOne({
            patientId,
            $or: [
                { startTime: { $lt: endTime, $gte: startTime } },  // Check overlapping start time
                { endTime: { $gt: startTime, $lte: endTime } }    // Check overlapping end time
            ]
        });

        if (patientAppointment) {
            throw new Error('Patient already has an appointment during this time');
        }

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

        // Check if the doctor is already booked during the specified time
        if (doctorId && (doctorId !== appointment.doctorId || startTime.getTime() !== appointment.startTime.getTime() || endTime.getTime() !== appointment.endTime.getTime())) {
            const existingDoctorAppointment = await Appointment.findOne({
                doctorId,
                $or: [
                    { startTime: { $lt: endTime, $gte: startTime } },  // Check overlapping start time
                    { endTime: { $gt: startTime, $lte: endTime } }    // Check overlapping end time
                ]
            });

            if (existingDoctorAppointment && existingDoctorAppointment.id !== id) {
                throw new Error('Doctor is already booked during this time');
            }
        }

        // Check if the patient is already booked during the specified time
        if (patientId && (patientId !== appointment.patientId || startTime.getTime() !== appointment.startTime.getTime() || endTime.getTime() !== appointment.endTime.getTime())) {
            const existingPatientAppointment = await Appointment.findOne({
                patientId,
                $or: [
                    { startTime: { $lt: endTime, $gte: startTime } },  // Check overlapping start time
                    { endTime: { $gt: startTime, $lte: endTime } }    // Check overlapping end time
                ]
            });

            if (existingPatientAppointment && existingPatientAppointment.id !== id) {
                throw new Error('Patient already has an appointment during this time');
            }
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
        }).sort({ startTime: 1 })
        .populate('doctorId', 'firstName lastName'); // Sort by ascending order of appointment start time

        // console.log(upcomingAppointments);
        return upcomingAppointments;

    } catch (error) {
        throw new Error(error.message);
    }
};