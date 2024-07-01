module.exports = {
    roles: {
        admin: ['manageUsers', 'manageAppointments', 'viewAppointments', 'viewProfile'],
        patient: ['scheduleAppointment', 'viewAppointments', 'viewProfile'],
        doctor: ['manageAppointments', 'viewAppointments', 'viewProfile'],
    },
};