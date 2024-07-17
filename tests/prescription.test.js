const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const User = require("../src/models/User");
const Prescription = require("../src/models/Prescription");

describe('Patients API', () => {
    let userAuthToken;
    let patientId;
    let doctorId;

    beforeAll(async () => {
        // Connect to MongoDB
        const url = `mongodb://127.0.0.1/test_database`;
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Clear users and medical history collections before tests
        await User.deleteMany({});
        await Prescription.deleteMany({});

        patientId = await registerUser('testuser@example.com', 'password', "patient");
        doctorId = await registerUser('testdoctor@example.com', 'password', "doctor")
        userAuthToken = await loginUser('testuser@example.com', 'password');
    });

    afterAll(async () => {
        // Disconnect MongoDB connection
        await User.deleteMany({});
        await Prescription.deleteMany({});
        await mongoose.disconnect();
    });

    it('should GET all the prescriptions for a specific patient', async () => {
        // Setup: Insert sample prescriptions for the patient
        await Prescription.create([
            { patientId: patientId, medications: [{ name: "Med1", dose: "1mg", frequency: "Daily", duration: "1 week" }], prescribedBy: doctorId },
            { patientId: patientId, medications: [{ name: "Med2", dose: "2mg", frequency: "Twice a day", duration: "2 weeks" }], prescribedBy: doctorId }
        ]);

        // Execute: Make a request to get the prescriptions
        const res = await request(app)
            .get(`/api/patient/${patientId}/prescriptions`)
            .set('Authorization', `Bearer ${userAuthToken}`);

        // Assert: Check the response status and data
        expect(res.status).toBe(200); // Ensure the status code is correct
        expect(res.body.length).toBe(2); // Ensure two prescriptions are returned
    });


    // Helper functions
    async function registerUser(email, password, role) {
        await request(app)
            .post('/api/auth/register')
            .send({ email, password, confirmPassword: password, role, firstName: 'Test', lastName: 'User' });
        const user = await User.findOne({ email });
        return user.id;
    }

    async function loginUser(email, password) {
        const response = await request(app)
            .post('/api/auth/login')
            .send({ email, password });
        return response.body.token;
    }
});
