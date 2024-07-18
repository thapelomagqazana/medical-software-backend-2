const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Patient = require('../src/models/patient.model');
const bcrypt = require("bcrypt");

describe('Patient Registration', () => {
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
        await Patient.deleteMany({});
    });

    it('should register a new patient', async () => {
        const response = await request(app)
            .post('/api/patients/register')
            .send({
                firstName: 'John',
                lastName: "Doe",
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
            })
            .expect(201);
        expect(response.body).toHaveProperty('_id');
        expect(response.body).toHaveProperty('firstName', 'John');
        expect(response.body).toHaveProperty('lastName', 'Doe');
        expect(response.body).toHaveProperty('email', 'john.doe@example.com');

        const patient = await Patient.findOne({ email: 'john.doe@example.com' });
        expect(patient).not.toBeNull();
        const isPasswordCorrect = await bcrypt.compare('password123', patient.password);
        expect(isPasswordCorrect).toBe(true);
    });

    it('should return 400 if email already exists', async () => {
        await new Patient({
            firstName: 'Existing',
            lastName: "User",
            email: 'existing.email@example.com',
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
        }).save();

        const response = await request(app)
            .post('/api/patients/register')
            .send({
                firstName: 'New',
                lastName: "User",
                email: 'existing.email@example.com',
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
                firstName: 'John',
                lastName: "Doe",
                email: 'invalid-email',
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
            })
            .expect(400);

        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors[0]).toHaveProperty('msg', 'Invalid email address');
    });

    it('should return 400 if password is too short', async () => {
        const response = await request(app)
            .post('/api/patients/register')
            .send({
                firstName: 'John',
                lastName: "Doe",
                email: 'john.doe@example.com',
                password: '123',
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
            })
            .expect(400);

        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors[0]).toHaveProperty('msg', 'Password must be at least 6 characters long');
    });
});