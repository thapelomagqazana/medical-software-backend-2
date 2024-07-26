const {
    getAllAppointmentsService,
    getAppointmentByIdService,
    createAppointmentService,
    updateAppointmentService,
    deleteAppointmentService,
    getUpcomingAppointmentsByPatientService,
    getPatientAppointmentsService,
    getAppointmentsForDoctor,

} = require ("../services/appointment.service");

const { validationResult } = require("express-validator");

/**
 * @desc    Get all appointments
 * @route   GET /api/appointments/all
 * @access  Public
 */
exports.getAppointments = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const appointments = await getAllAppointmentsService();
        res.json(appointments);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
};

/**
 * @desc    Delete appointment
 * @route   DELETE /api/appointments/:id
 * @access  Public
 */
exports.deleteAppointment = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    try {
      const result = await deleteAppointmentService(req.params.id);
      res.json(result);
    } catch (err) {
      console.error(err.message);
      if (err.message === 'Appointment not found') {
        return res.status(404).json({ msg: err.message });
      }
      res.status(500).send('Server Error');
    }
};

/** 
 * @desc    Get single appointment by ID
 * @route   GET /api/appointments/:id
 * @access  Public
 */
exports.getAppointmentById = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const appointment = await getAppointmentByIdService(req.params.id);
        res.json(appointment);
    } catch (error) {
        if (error.message === 'Appointment not found') {
            return res.status(404).json({ msg: error.message });
        }
        res.status(500).send('Server Error');
    }
};

/**
 * @desc    Create new appointment
 * @route   POST /api/appointments
 * @access  Public
 */
exports.bookAppointment = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    try {
      const patientId = req.params.id;
      const appointmentData = { ...req.body, patientId };
      const appointment = await createAppointmentService(appointmentData);
      res.status(201).json(appointment);
    } catch (err) {
      // console.error(err.message);
      if (err.message === 'Doctor is already booked during this time') {
        return res.status(403).json({ message: err.message });
      }
      else if (err.message === 'Patient already has an appointment during this time'){
        return res.status(403).json({ message: err.message });
      }
      res.status(500).json({ message: err.message });
    }
};

/**
 * @desc    Update appointment
 * @route   PUT /api/appointments/:id
 * @access  Public
 */
exports.updateAppointment = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { appointmentId, id } = req.params;
      console.log(req.params);
      const updateData = req.body;
      const appointment = await updateAppointmentService(appointmentId, id, updateData);
      res.status(200).json(appointment);

    } catch (err) {
      console.error(err.message);
      if (err.message === 'Appointment not found') {
        return res.status(404).json({ msg: err.message });
      }
      else if (err.message === 'Doctor is already booked during this time') {
        return res.status(403).json({ msg: err.message });
      }
      else if (err.message === 'Patient already has an appointment during this time'){
        return res.status(403).json({ msg: err.message });
      }
      res.status(500).json({ message: err.message });
    }
};

/**
 * @desc Retrieves a list of upcoming appointments for the logged-in patient
 * @route GET /api/patient/upcoming-appointments
 * @access Private
 */
exports.getUpcomingAppointmentsByPatient = async (req, res) => {
  try {
    const patientId = req.user.id;
    const upcomingAppointments = await getUpcomingAppointmentsByPatientService(patientId);

    res.json(upcomingAppointments);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

/** 
 * @desc    Get all appointments by patientID
 * @route GET /api/patient/appointments
 * @access Private
 */
exports.getPatientAppointments = async (req, res) => {
  try {
    const patientId = req.user.id;
    const appointments = await getPatientAppointmentsService(patientId);

    res.status(200).json(appointments);
  } catch (error) {
    // console.error(error.message);
    res.status(500).send({ message: error.message });
  }
};

/**
 * Controller to retrieve appointments assigned to the logged-in doctor.
 * @param {Object} req - The request object, assuming doctorId is available in req.user.id.
 * @param {Object} res - The response object.
 */
exports.getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const appointments = await getAppointmentsForDoctor(doctorId);
    res.json(appointments);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: error.message });
  }
};