const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app'); // Assuming your Express app is exported from src/app.js
const Appointment = require('../src/models/Appointment');
const User = require('../src/models/User');

// Constants for test credentials and URLs
const TEST_DB_URL = 'mongodb://127.0.0.1/test_database';
const DOCTOR_EMAIL = 'testdoctor@example.com';
const PATIENT_EMAIL = 'testuser@example.com';
const PATIENT_EMAIL_1 = 'testuser1@example.com';
const PASSWORD = 'password1';

describe('Doctor Patients API Tests', () => {
    let doctorAuthToken;
    let doctorId;
    let patientId;
    let patientId1;

    beforeAll(async () => {
        await mongoose.connect(TEST_DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Register and login doctor
        await registerUser(DOCTOR_EMAIL, 'doctor');
        const doctorLoginResponse = await loginUser(DOCTOR_EMAIL);
        doctorId = (await User.findOne({ email: DOCTOR_EMAIL })).id;
        doctorAuthToken = doctorLoginResponse.body.token;

        // Register patients
        await registerUser(PATIENT_EMAIL, 'patient');
        await registerUser(PATIENT_EMAIL_1, 'patient');
        patientId = (await User.findOne({ email: PATIENT_EMAIL })).id;
        patientId1 = (await User.findOne({ email: PATIENT_EMAIL_1 })).id;

        // Create sample appointments
        await createSampleAppointments([patientId, patientId1], doctorId);
    });

    afterAll(async () => {
        await Appointment.deleteMany({});
        await User.deleteMany({});
        await mongoose.disconnect();
    });

    it('should fetch patients assigned to the doctor', async () => {
        const res = await request(app)
            .get("/api/doctors/patients")
            .set('Authorization', `Bearer ${doctorAuthToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
        expect(res.body[0]).toHaveProperty('firstName');
        expect(res.body[0]).toHaveProperty('lastName');
    });

    it('should retrieve appointments for the doctor', async () => {
        const res = await request(app)
            .get('/api/doctors/appointments')
            .set('Authorization', `Bearer ${doctorAuthToken}`);
        
        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Array);
    });

    // Helper functions for clarity and reuse
    async function registerUser(email, role) {
        await request(app)
            .post('/api/auth/register')
            .send({
                email,
                password: PASSWORD,
                confirmPassword: PASSWORD,
                role,
                firstName: role.charAt(0).toUpperCase() + role.slice(1),
                lastName: 'User',
            });
    }

    async function loginUser(email) {
        return request(app)
            .post('/api/auth/login')
            .send({ email, password: PASSWORD });
    }

    async function createSampleAppointments(patientIds, doctorId) {
        for (const patientId of patientIds) {
            await Appointment.create({
                patientId,
                doctorId,
                startTime: new Date(),
                endTime: new Date(),
            });
        }
    }
});
