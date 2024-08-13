// tests/appointment.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Patient = require('../src/models/patient.model');
const Doctor = require('../src/models/doctor.model');
const Appointment = require('../src/models/appointment.model');
const bcrypt = require('bcrypt');
// const { startServer, stopServer } = require("../src/server");

const connectToDatabase = async () => {
    if (mongoose.connection.readyState === 0) {
        const url = `mongodb://127.0.0.1/test_database`;
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    }
};

const clearDatabase = async () => {
    await Patient.deleteMany({});
    await Doctor.deleteMany({});
    await Appointment.deleteMany({});
};

const disconnectFromDatabase = async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.db.dropDatabase();
        await mongoose.disconnect();
    }
};

const createPatient = async (patientData) => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(patientData.password, saltRounds);
    const patient = new Patient({ ...patientData, password: hashedPassword });
    await patient.save();
    return patient;
};

const createDoctor = async (doctorData) => {
    const doctor = new Doctor(doctorData);
    await doctor.save();
    return doctor;
};

const patientData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    phone: '1234567890',
    address: '123 Main St',
    dateOfBirth: '1980-01-01',
    insuranceDetails: 'Insurance XYZ',
    emergencyContacts: [
        {
            name: 'Jane Doe',
            phone: '0987654321',
        },
    ],
};

const doctorData = {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    password: 'password123',
    phone: '1234567890',
    specialty: 'Cardiology',
    licenseNumber: '12345',
};

describe('Appointment API', () => {
    let userAuthToken;
    let patientId;
    let doctorId;

    // beforeAll(async () => {
    //     await startServer();
    // });
    
    // afterAll(async () => {
    //     await stopServer();
    // });

    beforeEach(async () => {
        // Connect to MongoDB
        await connectToDatabase();

        // Clear collections before tests
        await clearDatabase();

        // Create patient and doctor
        const patient = await createPatient(patientData);
        patientId = patient._id;
        const doctor = await createDoctor(doctorData);
        doctorId = doctor._id;

        // Login patient and get token
        userAuthToken = await loginUser(patientData.email, patientData.password);
    });

    afterEach(async () => {
        // Disconnect MongoDB connection
        await clearDatabase();
        await disconnectFromDatabase();
        mongoose.connection.close();
    });

    it('should view patient appointments', async () => {
        // Create sample appointments
        await Appointment.create([
            { patientId, doctorId, startTime: new Date(), endTime: new Date(new Date().getTime() + 60 * 60 * 1000), reason: 'Checkup' },
            { patientId, doctorId, startTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), endTime: new Date(new Date().getTime() + 3 * 60 * 60 * 1000), reason: 'Follow-up' }
        ]);


        const response = await request(app)
            .get(`/api/patients/${patientId}/appointments`)
            .set('Authorization', `Bearer ${userAuthToken}`)
            .expect(200);

        expect(response.body.length).toBe(2);
    });

    it('should view patient upcoming appointments', async () => {
        // Create sample appointments
        await Appointment.create([
            { patientId, doctorId, startTime: new Date(), endTime: new Date(new Date().getTime() + 60 * 60 * 1000), reason: 'Checkup' },
            { patientId, doctorId, startTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), endTime: new Date(new Date().getTime() + 3 * 60 * 60 * 1000), reason: 'Follow-up' }
        ]);


        const response = await request(app)
            .get(`/api/patients/${patientId}/appointments/upcoming`)
            .set('Authorization', `Bearer ${userAuthToken}`)
            .expect(200);

        expect(response.body.length).toBe(1);
    });

    it('should book a new appointment', async () => {
        const appointmentData = {
            doctorId,
            startTime: new Date(new Date().getTime() + 4 * 60 * 60 * 1000),
            endTime: new Date(new Date().getTime() + 5 * 60 * 60 * 1000),
            reason: 'Consultation',
        };

        const response = await request(app)
            .post(`/api/patients/${patientId}/appointments`)
            .set('Authorization', `Bearer ${userAuthToken}`)
            .send(appointmentData)
            .expect(201);

        expect(response.body).toHaveProperty('_id');
        expect(response.body).toHaveProperty('patientId', patientId.toString());
        expect(response.body).toHaveProperty('doctorId', doctorId.toString());
        expect(response.body).toHaveProperty('startTime');
        expect(response.body).toHaveProperty('endTime');
        expect(response.body).toHaveProperty('reason', appointmentData.reason);
    });

    it('should return 400 if double booking within time range', async () => {
        const appointmentData1 = {
            doctorId,
            startTime: new Date(new Date().getTime() + 6 * 60 * 60 * 1000),
            endTime: new Date(new Date().getTime() + 7 * 60 * 60 * 1000),
            reason: 'Consultation',
        };

        const appointmentData2 = {
            doctorId,
            startTime: new Date(new Date().getTime() + 6 * 60 * 60 * 1000 + 30 * 60 * 1000),
            endTime: new Date(new Date().getTime() + 7 * 60 * 60 * 1000 + 30 * 60 * 1000),
            reason: 'Follow-up',
        };

        await request(app)
            .post(`/api/patients/${patientId}/appointments`)
            .set('Authorization', `Bearer ${userAuthToken}`)
            .send(appointmentData1)
            .expect(201);

        const response = await request(app)
            .post(`/api/patients/${patientId}/appointments`)
            .set('Authorization', `Bearer ${userAuthToken}`)
            .send(appointmentData2)
            .expect(403);

        expect(response.body).toHaveProperty('message', 'Doctor is already booked during this time');
    });

    it('should return 400 if validation fails', async () => {
        const invalidAppointmentData = {
            doctorId: 'invalid-id',
            startTime: 'invalid-date',
            endTime: 'invalid-date',
            reason: '',
        };

        const response = await request(app)
            .post(`/api/patients/${patientId}/appointments`)
            .set('Authorization', `Bearer ${userAuthToken}`)
            .send(invalidAppointmentData)
            .expect(400);

        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors).toBeInstanceOf(Array);
    });

    it('should reschedule an appointment', async () => {
        const appointmentData = {
            doctorId,
            startTime: new Date(new Date().getTime() + 6 * 60 * 60 * 1000),
            endTime: new Date(new Date().getTime() + 7 * 60 * 60 * 1000),
            reason: 'Consultation',
        };

        const response1 = await request(app)
            .post(`/api/patients/${patientId}/appointments`)
            .set('Authorization', `Bearer ${userAuthToken}`)
            .send(appointmentData);
        
        const updatedData = {
            startTime: new Date(new Date().getTime() + 10 * 60 * 60 * 1000),
            endTime: new Date(new Date().getTime() + 11 * 60 * 60 * 1000),
            reason: 'Rescheduled Consultation'
        };

        const appointmentId = response1.body._id;

        const response = await request(app)
            .put(`/api/patients/${patientId}/appointments/${appointmentId}`)
            .set('Authorization', `Bearer ${userAuthToken}`)
            .send(updatedData)
            .expect(200);

        expect(response.body).toHaveProperty('_id', appointmentId);
        expect(response.body).toHaveProperty('startTime');
        expect(response.body).toHaveProperty('endTime');
        expect(response.body).toHaveProperty('reason', updatedData.reason);
    });

    it('should cancel an appointment', async () => {
        const appointmentData = {
            doctorId,
            startTime: new Date(new Date().getTime() + 6 * 60 * 60 * 1000),
            endTime: new Date(new Date().getTime() + 7 * 60 * 60 * 1000),
            reason: 'Consultation',
        };

        const response1 = await request(app)
            .post(`/api/patients/${patientId}/appointments`)
            .set('Authorization', `Bearer ${userAuthToken}`)
            .send(appointmentData);
        
        const updatedData = {
            status: "cancelled"
        };

        const appointmentId = response1.body._id;

        const response = await request(app)
            .put(`/api/patients/${patientId}/appointments/${appointmentId}`)
            .set('Authorization', `Bearer ${userAuthToken}`)
            .send(updatedData)
            .expect(200);

        expect(response.body).toHaveProperty('status', updatedData.status);
    });

    // Helper functions
    async function loginUser(email, password) {
        const response = await request(app)
            .post('/api/patients/login')
            .send({ email, password })
            .expect(200);

        return response.body.token;
    }
});
