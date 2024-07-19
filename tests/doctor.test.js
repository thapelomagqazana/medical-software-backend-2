const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Doctor = require('../src/models/doctor.model');
const bcrypt = require('bcrypt');

const connectToDatabase = async () => {
    const url = `mongodb://127.0.0.1/test_database`;
    await mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
};

const clearDatabase = async () => {
    await Doctor.deleteMany({});
};

const disconnectFromDatabase = async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
};

const createDoctor = async (doctorData) => {
    const doctor = new Doctor(doctorData);
    await doctor.save();
    return doctor;
};

const doctorData = {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    password: 'password123',
    phone: '1234567890',
    specialty: 'Cardiology',
    licenseNumber: '12345',
};

describe('Doctor Registration', () => {
    beforeAll(connectToDatabase);

    afterAll(disconnectFromDatabase);

    beforeEach(clearDatabase);

    it('should register a new doctor and hash the password', async () => {
        const response = await request(app)
            .post('/api/doctors/register')
            .send(doctorData)
            .expect(201);

        expect(response.body).toHaveProperty('_id');
        expect(response.body).toHaveProperty('firstName', doctorData.firstName);
        expect(response.body).toHaveProperty('lastName', doctorData.lastName);
        expect(response.body).toHaveProperty('email', doctorData.email);

        const doctor = await Doctor.findOne({ email: doctorData.email });
        expect(doctor).not.toBeNull();
        const isPasswordCorrect = await bcrypt.compare(doctorData.password, doctor.password);
        expect(isPasswordCorrect).toBe(true);
    });

    it('should return 400 if email already exists', async () => {
        await createDoctor({
            ...doctorData,
            email: 'existing.email@example.com',
        });

        const response = await request(app)
            .post('/api/doctors/register')
            .send({
                ...doctorData,
                email: 'existing.email@example.com',
            })
            .expect(400);

        expect(response.body).toHaveProperty('message', 'Email already exists');
    });

    it('should return 400 if license number already exists', async () => {
        await createDoctor({
            ...doctorData,
            licenseNumber: '123456',
        });

        const response = await request(app)
            .post('/api/doctors/register')
            .send({
                ...doctorData,
                email: "john.smith@example.com",
                licenseNumber: '123456',
            })
            .expect(400);

        expect(response.body).toHaveProperty('message', 'License Number already exists');
    });

    it('should return 400 if required fields are missing', async () => {
        const response = await request(app)
            .post('/api/doctors/register')
            .send({
                email: 'jane.smith@example.com',
                password: 'password123',
            })
            .expect(400);

        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors).toBeInstanceOf(Array);
    });

    it('should return 400 if email is invalid', async () => {
        const response = await request(app)
            .post('/api/doctors/register')
            .send({
                ...doctorData,
                email: 'invalid-email',
            })
            .expect(400);

        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors[0]).toHaveProperty('msg', 'Invalid email address');
    });

    it('should return 400 if password is too short', async () => {
        const response = await request(app)
            .post('/api/doctors/register')
            .send({
                ...doctorData,
                password: '123',
            })
            .expect(400);

        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors[0]).toHaveProperty('msg', 'Password must be at least 6 characters long');
    });
});
