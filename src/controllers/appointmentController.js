const {
    getAllAppointmentsService,
    getAppointmentByIdService,
    createAppointmentService,
    updateAppointmentService,
    deleteAppointmentService,
    getAppointmentsByPatientService,

} = require ("../services/appointmentService");

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
        return res.status(404).json({ msg: 'Appointment not found' });
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
            return res.status(404).json({ msg: 'Appointment not found' });
        }
        res.status(500).send('Server Error');
    }
};

/**
 * @desc    Create new appointment
 * @route   POST /api/appointments
 * @access  Public
 */
exports.createAppointment = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    try {
      const appointment = await createAppointmentService(req.body);
      res.json(appointment);
    } catch (err) {
      console.error(err.message);
      if (err.message === 'Doctor is already booked during this time') {
        return res.status(403).json({ msg: 'Doctor is already booked during this time' });
      }
      else if (err.message === 'Patient already has an appointment during this time'){
        return res.status(403).json({ msg: 'Patient already has an appointment during this time' });
      }
      res.status(500).send('Server Error');
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
      const appointment = await updateAppointmentService(req.params.id, req.body);
      res.json(appointment);
    } catch (err) {
      console.error(err.message);
      if (err.message === 'Appointment not found') {
        return res.status(404).json({ msg: 'Appointment not found' });
      }
      else if (err.message === 'Doctor is already booked during this time') {
        return res.status(403).json({ msg: 'Doctor is already booked during this time' });
      }
      else if (err.message === 'Patient already has an appointment during this time'){
        return res.status(403).json({ msg: 'Patient already has an appointment during this time' });
      }
      res.status(500).send('Server Error');
    }
};

/**
 * @desc Retrieves a list of upcoming appointments for the logged-in patient
 * @route GET /api/patient/appointments
 * @access Private
 */
exports.getAppointmentsByPatient = async (req, res) => {
  try {
    const patientId = req.user.id;
    const upcomingAppointments = await getAppointmentsByPatientService(patientId);

    res.json(upcomingAppointments);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};