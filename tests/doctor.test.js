const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Doctor = require('../src/models/doctor.model');
const Appointment = require("../src/models/appointment.model");
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
    await Appointment.deleteMany({});
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

describe('Doctor API', () => {
    let userAuthToken;
    let patientId;
    let doctorId;

    beforeAll(connectToDatabase);

    beforeEach(async () => {

        doctorId = await registerDoctor(doctorData);
        // console.log(doctor);

        // Login doctor and get token
        userAuthToken = await loginDoctor(doctorData.email, doctorData.password);
    });

    afterEach(clearDatabase);

    afterAll(disconnectFromDatabase);

    it('should register a new doctor and hash the password', async () => {
        await Doctor.deleteMany({});
        const response = await request(app)
            .post('/api/doctors/register')
            .send({ ...doctorData, confirmPassword: 'password123' })
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

    it('should login an existing doctor', async () => {
        const response = await request(app)
            .post('/api/doctors/login')
            .send({ email: doctorData.email, password: doctorData.password });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
    });

    it('should return 400 if email already exists', async () => {
        await Doctor.deleteMany({});
        await createDoctor({
            ...doctorData,
            email: 'existing.email@example.com',
        });

        const response = await request(app)
            .post('/api/doctors/register')
            .send({
                ...doctorData,
                email: 'existing.email@example.com',
                confirmPassword: "password123",
            })
            .expect(400);

        expect(response.body).toHaveProperty('message', 'Email already exists');
    });

    it('should return 400 if license number already exists', async () => {
        await Doctor.deleteMany({});
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
                confirmPassword: "password123",
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

    it('should fetch slots of a single doctor', async () => {
        await Appointment.create({
            patientId: new mongoose.Types.ObjectId(),
            doctorId: doctorId,
            startTime: new Date('2023-07-01T10:00:00.000Z'),
            endTime: new Date('2023-07-01T11:00:00.000Z'),
            reason: 'Checkup'
        });

        const response = await request(app)
            .get('/api/doctors/slots')
            .set('Authorization', `Bearer ${userAuthToken}`)
            .query({ date: '2023-07-01', doctorId: doctorId.toString() })
            .expect(200);

        expect(response.body.slots).toBeInstanceOf(Array);
        expect(response.body.slots[0]).toHaveProperty('time');
        expect(response.body.slots[0]).toHaveProperty('available');
    });

    it('should fetch all doctors', async () => {
        const response = await request(app)
            .get('/api/doctors')
            .set('Authorization', `Bearer ${userAuthToken}`)
            .expect(200);
            
        expect(response.body).toHaveLength(1);
        expect(response.body).toBeInstanceOf(Array);
    });

    async function registerDoctor(doctorData) {
        const response = await request(app)
            .post('/api/doctors/register')
            .send({ ...doctorData, confirmPassword: 'password123' })
            .expect(201);

        return response.body._id;
    }

    async function loginDoctor(email, password) {
        const response = await request(app)
            .post('/api/doctors/login')
            .send({ email, password })
            .expect(200);

        return response.body.token;
    }
});
