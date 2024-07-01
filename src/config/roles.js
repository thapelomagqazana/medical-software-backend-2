module.exports = {
    roles: {
        admin: ['manageUsers', 'manageAppointments', 'viewAppointments', 'viewProfile', 'updateProfile', 'deleteProfile'],
        patient: ['scheduleAppointment', 'viewAppointments', 'viewProfile', 'updateProfile'],
        doctor: ['manageAppointments', 'viewAppointments', 'viewProfile', 'updateProfile'],
    },
};