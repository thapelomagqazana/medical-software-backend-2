const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Patient = require('../src/models/patient.model');
const bcrypt = require("bcrypt");

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

const updatedData = {
    firstName: 'John',
    lastName: 'Doe',
    phone: '0987654321',
    address: '456 Another St',
    insuranceDetails: 'Insurance ABC',
    emergencyContacts: [
        {
            name: 'Jane Smith',
            phone: '1234567890'
        }
    ]
};

const createPatient = async (patientData) => {
    const patient = new Patient(patientData);
    await patient.save();
    return patient;
};

describe('Patients API', () => {
    let userAuthToken;
    let patientId;

    beforeAll(async () => {
        // Connect to MongoDB
        const url = `mongodb://127.0.0.1/test_database`;
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });

    beforeEach(async () => {
        // Register and login a patient
        patientId = await registerPatient(patientData);
        userAuthToken = await loginUser(patientData.email, patientData.password);
    });

    afterEach(async () => {
        // Clear patients collection before tests
        await Patient.deleteMany({});
    });

    afterAll(async () => {
        // Disconnect MongoDB connection
        await Patient.deleteMany({});
        await mongoose.connection.db.dropDatabase();
        await mongoose.disconnect();
    });

    describe('Patient Registration and Login', () => {
        it('should register a new patient and hash the password', async () => {
            await Patient.deleteMany({});
            const response = await request(app)
                .post('/api/patients/register')
                .send(patientData)
                .expect(201);
            
            expect(response.body).toHaveProperty('_id');
            expect(response.body).toHaveProperty('firstName', patientData.firstName);
            expect(response.body).toHaveProperty('lastName', patientData.lastName);
            expect(response.body).toHaveProperty('email', patientData.email);

            const patient = await Patient.findOne({ email: patientData.email });
            expect(patient).not.toBeNull();
            const isPasswordCorrect = await bcrypt.compare(patientData.password, patient.password);
            expect(isPasswordCorrect).toBe(true);
        });

        it('should login an existing patient', async () => {
            const response = await request(app)
                .post('/api/patients/login')
                .send({ email: patientData.email, password: patientData.password })
                .expect(200);

            expect(response.body).toHaveProperty('token');
        });

        it('should return 400 for login if required fields are missing', async () => {
            const response = await request(app)
                .post('/api/patients/login')
                .expect(400);

            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors).toBeInstanceOf(Array);
        });

        it('should return 400 if email already exists', async () => {
            await createPatient({ ...patientData, email: 'existing.email@example.com' });

            const response = await request(app)
                .post('/api/patients/register')
                .send({ ...patientData, email: 'existing.email@example.com' })
                .expect(400);

            expect(response.body).toHaveProperty('message', 'Email already exists');
        });

        it('should return 400 if required fields are missing', async () => {
            const response = await request(app)
                .post('/api/patients/register')
                .send({ email: 'john.doe@example.com', password: 'password123' })
                .expect(400);

            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors).toBeInstanceOf(Array);
        });

        it('should return 400 if email is invalid', async () => {
            const response = await request(app)
                .post('/api/patients/register')
                .send({ ...patientData, email: 'invalid-email' })
                .expect(400);

            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors[0]).toHaveProperty('msg', 'Invalid email address');
        });

        it('should return 400 if password is too short', async () => {
            const response = await request(app)
                .post('/api/patients/register')
                .send({ ...patientData, password: '123' })
                .expect(400);

            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors[0]).toHaveProperty('msg', 'Password must be at least 6 characters long');
        });
    });

    describe('Patient Profile Retrieval with Authentication', () => {
        it('should retrieve the patient profile', async () => {
            const response = await request(app)
                .get(`/api/patients/${patientId}/profile`)
                .set('Authorization', `Bearer ${userAuthToken}`);
                // .expect(200);

            expect(response.body).toHaveProperty('_id', patientId);
            expect(response.body).toHaveProperty('firstName', patientData.firstName);
            expect(response.body).toHaveProperty('lastName', patientData.lastName);
            expect(response.body).toHaveProperty('email', patientData.email);
            expect(response.body).toHaveProperty('phone', patientData.phone);
            expect(response.body).toHaveProperty('address', patientData.address);
            expect(response.body).toHaveProperty('dateOfBirth');
            expect(response.body).toHaveProperty('insuranceDetails', patientData.insuranceDetails);
            expect(response.body.emergencyContacts[0]).toHaveProperty('name', patientData.emergencyContacts[0].name);
            expect(response.body.emergencyContacts[0]).toHaveProperty('phone', patientData.emergencyContacts[0].phone);
        });

        it('should return 404 if patient is not found', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .get(`/api/patients/${nonExistentId}/profile`)
                .set('Authorization', `Bearer ${userAuthToken}`)
                .expect(404);

            expect(response.body).toHaveProperty('message', 'Patient not found');
        });

        it('should return 401 if token is invalid', async () => {
            const response = await request(app)
                .get(`/api/patients/${patientId}/profile`)
                .set('Authorization', 'Bearer invalidtoken')
                .expect(401);

            expect(response.body).toHaveProperty('message', 'Authorization denied, invalid token');
        });
    });

    describe('Patient Profile Update with Authentication', () => {
        it('should update a patient profile', async () => {
            const response = await request(app)
                .put(`/api/patients/${patientId}/profile`)
                .set('Authorization', `Bearer ${userAuthToken}`)
                .send(updatedData)
                .expect(200);

            expect(response.body).toHaveProperty('_id', patientId);
            expect(response.body).toHaveProperty('firstName', updatedData.firstName);
            expect(response.body).toHaveProperty('lastName', updatedData.lastName);
            expect(response.body).toHaveProperty('phone', updatedData.phone);
            expect(response.body).toHaveProperty('address', updatedData.address);
            expect(response.body).toHaveProperty('insuranceDetails', updatedData.insuranceDetails);
            expect(response.body.emergencyContacts[0]).toHaveProperty('name', updatedData.emergencyContacts[0].name);
            expect(response.body.emergencyContacts[0]).toHaveProperty('phone', updatedData.emergencyContacts[0].phone);
        });

        it('should return 404 if patient is not found', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .put(`/api/patients/${nonExistentId}/profile`)
                .set('Authorization', `Bearer ${userAuthToken}`)
                .send(updatedData)
                .expect(404);

            expect(response.body).toHaveProperty('message', 'Patient not found');
        });
    });

    // Helper functions
    async function registerPatient(patientData) {
        const response = await request(app)
            .post('/api/patients/register')
            .send(patientData)
            .expect(201);

        return response.body._id;
    }

    async function loginUser(email, password) {
        const response = await request(app)
            .post('/api/patients/login')
            .send({ email, password })
            .expect(200);

        return response.body.token;
    }
});
