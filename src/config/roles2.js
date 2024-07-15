module.exports = {
    roles: {
        admin: [
            'viewAllUsers', 'createUser', 'editUserDetails', 'deleteUser',
            'viewAllAppointments', 'manageAppointments', 'cancelAppointment',
            'viewBillingRecords', 'manageBillingRecords', 'submitInsuranceClaims',
            'viewInventory', 'addInventoryItem', 'updateInventoryItem', 'deleteInventoryItem',
            'viewReports', 'generateReports'
        ],
        patient: [
            'viewProfile', 'editProfile',
            'viewAppointments', 'scheduleAppointment', 'rescheduleAppointment', 'cancelAppointment',
            'viewMedicalRecords', 'requestPrescriptionRefill', 'communicateWithDoctors'
        ],
        doctor: [
            'viewProfile', 'editProfile',
            'viewPatients', 'viewPatientMedicalRecords',
            'manageAppointments', 'updateAppointmentStatus',
            'writePrescriptions', 'communicateWithPatients', 'viewLabResults'
        ],
    },
};
