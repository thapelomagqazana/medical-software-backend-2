const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Patient = require('../src/models/patient.model');
const bcrypt = require("bcrypt");

const connectToDatabase = async () => {
    const url = `mongodb://127.0.0.1/test_database`;
    await mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
};

const clearDatabase = async () => {
    await Patient.deleteMany({});
};

const disconnectFromDatabase = async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
};

const createPatient = async (patientData) => {
    const patient = new Patient(patientData);
    await patient.save();
    return patient;
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

describe('Patient Registration and Login', () => {
    beforeAll(connectToDatabase);

    afterAll(disconnectFromDatabase);

    beforeEach(clearDatabase);

    it('should register a new patient and hash the password', async () => {
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
        await request(app)
            .post('/api/patients/register')
            .send(patientData);
        
        const response = await request(app)
                            .post("/api/patients/login")
                            .send({ 
                                email: patientData.email,
                                password: patientData.password
                             }).expect(200);

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
        await createPatient({
            ...patientData,
            email: 'existing.email@example.com',
        });

        const response = await request(app)
            .post('/api/patients/register')
            .send({
                ...patientData,
                email: 'existing.email@example.com',
            })
            .expect(400);

        expect(response.body).toHaveProperty('message', 'Email already exists');
    });

    it('should return 400 if required fields are missing', async () => {
        const response = await request(app)
            .post('/api/patients/register')
            .send({
                email: 'john.doe@example.com',
                password: 'password123',
            })
            .expect(400);

        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors).toBeInstanceOf(Array);
    });

    it('should return 400 if email is invalid', async () => {
        const response = await request(app)
            .post('/api/patients/register')
            .send({
                ...patientData,
                email: 'invalid-email',
            })
            .expect(400);

        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors[0]).toHaveProperty('msg', 'Invalid email address');
    });

    it('should return 400 if password is too short', async () => {
        const response = await request(app)
            .post('/api/patients/register')
            .send({
                ...patientData,
                password: '123',
            })
            .expect(400);

        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors[0]).toHaveProperty('msg', 'Password must be at least 6 characters long');
    });


    // it('should return 401 if no token is provided', async () => {
    //     const patient = await createPatient(patientData);

    //     const response = await request(app)
    //         .get(`/api/patients/${patient._id}/profile`)
    //         .expect(401);

    //     expect(response.body).toHaveProperty('message', 'Authorization header missing');
    // });


});

describe('Patient Profile Retrieval with Authentication', () => {
    beforeAll(connectToDatabase);

    afterAll(disconnectFromDatabase);

    beforeEach(clearDatabase);
    it('should register and login a patient, then retrieve the patient profile', async () => {
        await request(app)
            .post('/api/patients/register')
            .send(patientData);

        const loginResponse = await request(app)
            .post('/api/patients/login')
            .send({
                email: patientData.email,
                password: patientData.password,
            });
        
        const token = loginResponse.body.token;
        const patient = await Patient.findOne({ email: patientData.email });

        const profileResponse = await request(app)
            .get(`/api/patients/${patient._id}/profile`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(profileResponse.body).toHaveProperty('_id', patient._id.toString());
        expect(profileResponse.body).toHaveProperty('firstName', patientData.firstName);
        expect(profileResponse.body).toHaveProperty('lastName', patientData.lastName);
        expect(profileResponse.body).toHaveProperty('email', patientData.email);
        expect(profileResponse.body).toHaveProperty('phone', patientData.phone);
        expect(profileResponse.body).toHaveProperty('address', patientData.address);
        expect(profileResponse.body).toHaveProperty('dateOfBirth');
        expect(profileResponse.body).toHaveProperty('insuranceDetails', patientData.insuranceDetails);
        expect(profileResponse.body.emergencyContacts[0]).toHaveProperty('name', patientData.emergencyContacts[0].name);
        expect(profileResponse.body.emergencyContacts[0]).toHaveProperty('phone', patientData.emergencyContacts[0].phone);
    });

    it('should return 404 if patient is not found', async () => {
        await request(app)
            .post('/api/patients/register')
            .send(patientData);

        const loginResponse = await request(app)
            .post('/api/patients/login')
            .send({
                email: patientData.email,
                password: patientData.password,
            });
        
        const token = loginResponse.body.token;

        const nonExistentId = new mongoose.Types.ObjectId();
        const response = await request(app)
            .get(`/api/patients/${nonExistentId}/profile`)
            .set('Authorization', `Bearer ${token}`)
            .expect(404);

        expect(response.body).toHaveProperty('message', 'Patient not found');
    });

    it('should return 401 if token is invalid', async () => {
        await request(app)
            .post('/api/patients/register')
            .send(patientData);

        await request(app)
            .post('/api/patients/login')
            .send({
                email: patientData.email,
                password: patientData.password,
            });

        const patient = await Patient.findOne({ email: patientData.email });

        const response = await request(app)
            .get(`/api/patients/${patient._id}/profile`)
            .set('Authorization', 'Bearer invalidtoken')
            .expect(401);

        expect(response.body).toHaveProperty('message', 'Authorization denied, invalid token');
    });
});
