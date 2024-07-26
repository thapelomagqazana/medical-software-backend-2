const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Patient = require('../src/models/patient.model');
const Doctor = require('../src/models/doctor.model');
const Medication = require('../src/models/medication.model');
const Reminder = require('../src/models/reminder.model');
const bcrypt = require('bcrypt');

const connectToDatabase = async () => {
    const url = `mongodb://127.0.0.1/test_database`;
    await mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
};

const clearDatabase = async () => {
    await Patient.deleteMany({});
    await Doctor.deleteMany({});
    await Medication.deleteMany({});
    await Reminder.deleteMany({});
};

const disconnectFromDatabase = async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
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

const createMedication = async (medicationData) => {
    const medication = new Medication(medicationData);
    await medication.save();
    return medication;
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

const medicationData = {
    name: 'Medication 1',
    dosage: '10mg',
    frequency: 'Once a day',
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
};

describe('Reminder API', () => {
    let userAuthToken;
    let patientId;
    let doctorId;
    let medicationId;

    beforeAll(async () => {
        // Connect to MongoDB
        await connectToDatabase();

        // Clear collections before tests
        await clearDatabase();

        // Create patient and doctor
        const patient = await createPatient(patientData);
        patientId = patient._id;
        const doctor = await createDoctor(doctorData);
        doctorId = doctor._id;

        // Create medication
        const medication = await createMedication({ ...medicationData, patientId, prescribedBy: doctorId });
        medicationId = medication._id;

        // Login patient and get token
        userAuthToken = await loginUser(patientData.email, patientData.password);
    });

    afterAll(async () => {
        // Disconnect MongoDB connection
        await clearDatabase();
        await disconnectFromDatabase();
    });

    it('should set a medication reminder', async () => {
        const reminderData = {
            medicationId,
            reminderTime: new Date(new Date().getTime() + 1 * 60 * 60 * 1000),
            repeat: 'daily',
            notes: 'Take with food',
        };

        const response = await request(app)
            .post(`/api/patients/${patientId}/medications/reminders`)
            .set('Authorization', `Bearer ${userAuthToken}`)
            .send(reminderData)
            .expect(201);

        expect(response.body).toHaveProperty('_id');
        expect(response.body).toHaveProperty('patientId', patientId.toString());
        expect(response.body).toHaveProperty('medicationId', medicationId.toString());
        expect(response.body).toHaveProperty('reminderTime');
        expect(response.body).toHaveProperty('repeat', reminderData.repeat);
        expect(response.body).toHaveProperty('notes', reminderData.notes);
    });

    it('should return 400 if validation fails', async () => {
        const invalidReminderData = {
            medicationId: 'invalid-id',
            reminderTime: 'invalid-date',
            repeat: 'invalid-repeat',
            notes: 123,
        };

        const response = await request(app)
            .post(`/api/patients/${patientId}/medications/reminders`)
            .set('Authorization', `Bearer ${userAuthToken}`)
            .send(invalidReminderData)
            .expect(400);

        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors).toBeInstanceOf(Array);
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