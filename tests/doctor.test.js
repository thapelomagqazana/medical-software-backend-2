const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');

describe('Doctor API Tests', () => {
    let userAuthToken;
    let userId;

    beforeAll(async () => {
        // Connect to MongoDB
        const url = `mongodb://127.0.0.1/test_database`;
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Register and login user
        await request(app)
            .post('/api/auth/register')
            .send({
                email: 'testuser@example.com',
                password: 'password',
                confirmPassword: 'password',
                role: 'patient',
                firstName: 'Test',
                lastName: 'User',
        });
        const userLoginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'testuser@example.com',
                password: 'password',
            });
        const user = await User.findOne({ email: 'testuser@example.com' });
        userId = user.id;
        userAuthToken = userLoginResponse.body.token;
    });

    afterAll(async () => {
        // Disconnect MongoDB connection
        await mongoose.disconnect();
    });

    beforeEach(async () => {
        // Clear the Doctor collection before each test
        await User.deleteMany({});
    });

    it('should fetch all doctors', async () => {
        // Insert sample doctors into the database
        await User.create([
            { firstName: 'John', lastName: 'Doe', email: 'john@example.com', password: 'password1', role: "doctor" },
            { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', password: 'password2', role: "doctor" },
        ]);

        // Make a request to fetch doctors
        const res = await request(app)
            .get('/api/doctors')
            .set('Authorization', userAuthToken);;

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
    });

    // Add more test cases as needed: edge cases, error handling, etc.
});
