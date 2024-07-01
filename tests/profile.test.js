const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const User = require("../src/models/User");

describe("Profile API Tests", () => {
    let authToken;

    // Register a user
    beforeAll(async () => {
        // Connect to MongoDB
        const url = `mongodb://127.0.0.1/test_database`;
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        await request(app)
            .post('/api/auth/register')
            .send({ email: 'testuser@example.com',
                password: 'password',
                role: 'patient',
                firstName: 'Test',
                lastName: 'User', 
             });

        // Login with registered user
        const res1 = await request(app)
            .post('/api/auth/login')
            .send({
            email: 'testuser@example.com',
            password: 'password',
            });
        
        authToken = res1.body.token;
    });

    afterAll(async () => {
        // Disconnect MongoDB connection
        await User.deleteMany({});
        await mongoose.disconnect();
    });

    it('should get current user profile', async () => {
        const res = await request(app)
          .get('/api/profile/me')
          .set('Authorization', authToken);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('firstName', 'Test');
        expect(res.body).toHaveProperty('lastName', 'User');
        expect(res.body).toHaveProperty('email', 'testuser@example.com');
        expect(res.body).not.toHaveProperty('password');
    });

    it('should update user profile', async () => {
        const updatedProfile = {
          firstName: 'Updated',
          lastName: 'User',
        };
        const res = await request(app)
            .put(`/api/profile/edit`)
            .send(updatedProfile)
            .set('Authorization', authToken);
        
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('firstName', 'Updated');
    });
    


});