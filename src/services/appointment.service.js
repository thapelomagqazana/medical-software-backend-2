const Appointment = require("../models/appointment.model");

/**
 * Retrieves all appointments from the database with doctor details.
 * 
 * @returns {Promise<Array>} A promise that resolves to an array of all appointments with populated doctor details.
 * @throws {Error} If there is a database error during the fetch.
 */
exports.getAllAppointmentsService = async () => {
    try {
        return await Appointment.find().populate('doctorId', 'firstName lastName');
    } catch (error) {
        throw new Error(error.message);
    }
};

/**
 * Retrieves a specific appointment by its ID with doctor details.
 * 
 * @param {string} id - The ID of the appointment to retrieve.
 * @returns {Promise<Object>} A promise that resolves to the appointment object with populated doctor details.
 * @throws {Error} If the appointment is not found or there is a database error.
 */
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

/**
 * Creates a new appointment ensuring no overlapping with existing appointments for both doctor and patient.
 * 
 * @param {Object} params - The appointment details.
 * @param {string} params.patientId - The ID of the patient.
 * @param {string} params.doctorId - The ID of the doctor.
 * @param {Date} params.startTime - The start time of the appointment.
 * @param {Date} params.endTime - The end time of the appointment.
 * @returns {Promise<Object>} A promise that resolves to the newly created appointment object.
 * @throws {Error} If there is a scheduling conflict or a database error.
 */
exports.createAppointmentService = async (appointmentData) => {
    try {
        const { doctorId, startTime, endTime, patientId } = appointmentData;
        
        await checkDoctorAvailability(doctorId, startTime, endTime);
        await checkPatientAvailability(patientId, startTime, endTime);

        const newAppointment = new Appointment(appointmentData);
        await newAppointment.save();
        return newAppointment;
    } catch (error) {
        throw new Error(error.message);
    }
};

const checkDoctorAvailability = async (doctorId, startTime, endTime, excludeAppointmentId = null) => {
    const query = {
        doctorId,
        status: "scheduled",
        $or: [
            { startTime: { $lt: endTime, $gte: startTime } },
            { endTime: { $gt: startTime, $lte: endTime } }
        ]
    };

    if (excludeAppointmentId) {
        query._id = { $ne: excludeAppointmentId };
    }

    const existingAppointment = await Appointment.findOne(query);

    if (existingAppointment) {
        throw new Error('Doctor is already booked during this time');
    }
};

const checkPatientAvailability = async (patientId, startTime, endTime, excludeAppointmentId = null) => {
    const query = {
        patientId,
        status: "scheduled",
        $or: [
            { startTime: { $lt: endTime, $gte: startTime } },
            { endTime: { $gt: startTime, $lte: endTime } }
        ]
    };

    if (excludeAppointmentId) {
        query._id = { $ne: excludeAppointmentId };
    }

    const existingAppointment = await Appointment.findOne(query);

    if (existingAppointment) {
        throw new Error('Patient already has an appointment during this time');
    }
};

/**
 * Updates an existing appointment, checking for scheduling conflicts before saving.
 * 
 * @param {string} id - The ID of the appointment to update.
 * @param {Object} updateData - Updated appointment details.
 * @returns {Promise<Object>} A promise that resolves to the updated appointment object.
 * @throws {Error} If the appointment does not exist, there is a scheduling conflict, or a database error occurs.
 */
exports.updateAppointmentService = async (appointmentId, patientId, updateData) => {
    try {
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            throw new Error('Appointment not found');
        }
    
        if (updateData.startTime || updateData.endTime) {
            const { doctorId, startTime, endTime } = { ...appointment.toObject(), ...updateData };
    
            await checkDoctorAvailability(doctorId, startTime, endTime, appointmentId);
            await checkPatientAvailability(patientId, startTime, endTime, appointmentId);
        }
    
        Object.assign(appointment, updateData, { modifiedAt: new Date() });
        await appointment.save();
        return appointment;
        
    } catch (error) {
        throw new Error(error.message);
    }
};

/**
 * Deletes an appointment by its ID.
 * 
 * @param {string} id - The ID of the appointment to delete.
 * @returns {Promise<Object>} A promise that resolves to a confirmation of deletion.
 * @throws {Error} If the appointment is not found or there is a database error.
 */
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

/**
 * Retrieves all upcoming appointments for a specified patient.
 * 
 * @param {string} id - The patient ID.
 * @returns {Promise<Array>} A promise that resolves to an array of upcoming appointments.
 * @throws {Error} If there is a database error.
 */
exports.getUpcomingAppointmentsByPatientService = async (id) => {
    try {
        const upcomingAppointments = await Appointment.find({
            patientId: id,
            startTime: { $gte: new Date() }, // Filter for future appointments
            status: "scheduled",
        }).sort({ startTime: 1 })
        .populate('doctorId', 'firstName lastName'); // Sort by ascending order of appointment start time

        // console.log(upcomingAppointments);
        return upcomingAppointments;

    } catch (error) {
        throw new Error(error.message);
    }
};

/**
 * Retrieves all appointments for a specified patient.
 * 
 * @param {string} id - The patient ID.
 * @returns {Promise<Array>} A promise that resolves to an array of appointments.
 * @throws {Error} If there is a database error.
 */
exports.getPatientAppointmentsService = async (patientId) => {
    try {
        return await Appointment.find({
            patientId,
        }).sort({ startTime: 1 })
        .populate('doctorId', 'firstName lastName'); // Sort by ascending order of appointment start time

    } catch (error) {
        throw new Error(error.message);
    }
};

/**
 * Retrieves all appointments for a specific doctor.
 * @param {string} doctorId - ID of the doctor whose appointments are to be retrieved.
 * @returns {Promise<Array>} - A promise that resolves to an array of appointments.
 */
exports.getAppointmentsForDoctor = async (doctorId) => {
    try {
        const appointments = await Appointment.find({ doctorId }).populate("patientId");
        return appointments;
    } catch (error) {
        throw new Error("Failed to retrieve appointments: " + error.message);
    }
};