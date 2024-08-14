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
    let medication;
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

        // Login patient and get token
        userAuthToken = await loginUser(patientData.email, patientData.password);

    });

    beforeEach(async () => {
        // Create mock medication data
        medication = await Medication.create({
            patientId: patientId,
            name: "Aspirin",
            dosage: "100mg",
            frequency: "Daily",
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            prescribedBy: doctorId,
        });
        medicationId = medication._id;
    });

    afterEach(async () => {
        await Medication.deleteMany({});
    });

    afterAll(async () => {
        // Disconnect MongoDB connection
        await clearDatabase();
        await disconnectFromDatabase();
    });

    it('should view patient medications', async () => {

        const response = await request(app)
            .get(`/api/patients/${patientId}/medications`)
            .set('Authorization', `Bearer ${userAuthToken}`)
            .expect(200);

        expect(response.body.length).toBe(1);
        expect(response.body[0]).toHaveProperty("name", "Aspirin");
    });

    it("should return 404 if no medications found", async () => {
        await Medication.deleteMany({});

        const res = await request(app)
            .get(`/api/patients/${patientId}/medications`)
            .set('Authorization', `Bearer ${userAuthToken}`);

        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty("message", "No medications found for this patient.");
    });

    it("should return 400 if patientId is invalid", async () => {
        const res = await request(app)
            .get(`/api/patients/invalidId/medications`)
            .set('Authorization', `Bearer ${userAuthToken}`);

        expect(res.statusCode).toEqual(400);
        expect(res.body.errors[0]).toHaveProperty("msg", "Patient ID must be a valid MongoDB ObjectID");
    });

    it("should update a medication", async () => {
        const response = await request(app)
            .put(`/api/patients/${patientId}/medications/${medicationId}`)
            .send({
                dosage: "150mg",
                frequency: "Twice Daily",
            })
            .set('Authorization', `Bearer ${userAuthToken}`);
        
        // console.log(response);
        expect(response.status).toBe(200);
        expect(response.body.dosage).toBe("150mg");
        expect(response.body.frequency).toBe("Twice Daily");
    });

    it("should return 400 if validation fails", async () => {
        const response = await request(app)
            .put(`/api/patients/${patientId}/medications/${medicationId}`)
            .send({
                dosage: 150, // Invalid: should be a string
            })
            .set('Authorization', `Bearer ${userAuthToken}`);
        
        expect(response.status).toBe(400);
        expect(response.body.errors[0].msg).toBe("Dosage must be a string");
    });

    it("should return 404 if the medication does not exist", async () => {
        const invalidMedicationId = new mongoose.Types.ObjectId();
        const response = await request(app)
            .put(`/api/patients/${patientId}/medications/${invalidMedicationId}`)
            .send({
                dosage: "150mg",
                frequency: "Twice Daily",
            })
            .set('Authorization', `Bearer ${userAuthToken}`);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Medication not found or does not belong to this patient");
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
