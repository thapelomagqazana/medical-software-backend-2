const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Doctor = require('../src/models/doctor.model');
const bcrypt = require("bcrypt");

describe('Doctor Registration', () => {
    beforeAll(async () => {
        // Connect to MongoDB
        const url = `mongodb://127.0.0.1/test_database`;
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });

    afterAll(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await Doctor.deleteMany({});
    });

    it('should register a new doctor', async () => {
        const response = await request(app)
            .post('/api/doctors/register')
            .send({
                firstName: 'Jane',
                lastName: "Smith",
                email: 'jane.smith@example.com',
                password: 'password123',
                phone: '1234567890',
                specialty: 'Cardiology',
                licenseNumber: '12345',
            })
            .expect(201);

        expect(response.body).toHaveProperty('_id');
        expect(response.body).toHaveProperty('firstName', 'Jane');
        expect(response.body).toHaveProperty('lastName', 'Smith');
        expect(response.body).toHaveProperty('email', 'jane.smith@example.com');

        const doctor = await Doctor.findOne({ email: 'jane.smith@example.com' });
        expect(doctor).not.toBeNull();
        const isPasswordCorrect = await bcrypt.compare('password123', doctor.password);
        expect(isPasswordCorrect).toBe(true);
    });

    it('should return 400 if email already exists', async () => {
        await new Doctor({
            firstName: 'Existing',
            lastName: "Doctor",
            email: 'existing.email@example.com',
            password: 'password123',
            phone: '1234567890',
            specialty: 'Cardiology',
            licenseNumber: '12345',
        }).save();

        const response = await request(app)
            .post('/api/doctors/register')
            .send({
                firstName: 'New',
                lastName: "User",
                email: 'existing.email@example.com',
                password: 'password123',
                phone: '1234567890',
                specialty: 'Cardiology',
                licenseNumber: '123456',
            })
            .expect(400);

        expect(response.body).toHaveProperty('message', 'Email already exists');
    });

    it('should return 400 if license number already exists', async () => {
        await new Doctor({
            firstName: 'Existing',
            lastName: "Doctor",
            email: 'existing1.email@example.com',
            password: 'password123',
            phone: '1234567890',
            specialty: 'Cardiology',
            licenseNumber: '123456',
        }).save();

        const response = await request(app)
            .post('/api/doctors/register')
            .send({
                firstName: 'New',
                lastName: "User",
                email: 'existing.email@example.com',
                password: 'password123',
                phone: '1234567890',
                specialty: 'Cardiology',
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
                firstName: 'Jane',
                lastName: "Smith",
                email: 'invalid-email',
                password: 'password123',
                phone: '1234567890',
                specialty: 'Cardiology',
                licenseNumber: '12345',
            })
            .expect(400);

        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors[0]).toHaveProperty('msg', 'Invalid email address');
    });

    it('should return 400 if password is too short', async () => {
        const response = await request(app)
            .post('/api/doctors/register')
            .send({
                firstName: 'Jane',
                lastName: "Smith",
                email: 'jane.smith@example.com',
                password: '123',
                phone: '1234567890',
                specialty: 'Cardiology',
                licenseNumber: '12345',
            })
            .expect(400);

        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors[0]).toHaveProperty('msg', 'Password must be at least 6 characters long');
    });
});