const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Patient = require('../src/models/patient.model');
const Doctor = require('../src/models/doctor.model');
const Medication = require('../src/models/medication.model');
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

describe('Medication API', () => {
    let userAuthToken;
    let patientId;
    let doctorId;

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

        // Login patient and get token
        userAuthToken = await loginUser(patientData.email, patientData.password);
    });

    afterAll(async () => {
        // Disconnect MongoDB connection
        await clearDatabase();
        await disconnectFromDatabase();
    });

    it('should view patient medications', async () => {
        // Create sample medications
        await Medication.create([
            {
                patientId,
                name: 'Medication 1',
                dosage: '10mg',
                frequency: 'Once a day',
                startDate: new Date(),
                endDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
                prescribedBy: doctorId,
                notes: 'Take with food',
            },
            {
                patientId,
                name: 'Medication 2',
                dosage: '20mg',
                frequency: 'Twice a day',
                startDate: new Date(),
                endDate: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000),
                prescribedBy: doctorId,
                notes: 'Avoid alcohol',
            },
        ]);

        const response = await request(app)
            .get(`/api/patients/${patientId}/medications`)
            .set('Authorization', `Bearer ${userAuthToken}`)
            .expect(200);

        expect(response.body.length).toBe(2);
        expect(response.body[0]).toHaveProperty("name");
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
