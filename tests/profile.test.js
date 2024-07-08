const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const User = require("../src/models/User");

describe("Profile API Tests", () => {
    let userAuthToken;
    let adminAuthToken;
    let userId;
    let adminId;

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

        // Register and login admin
        await request(app)
            .post('/api/auth/register')
            .send({
                email: 'testadmin@example.com',
                password: 'password1',
                confirmPassword: 'password1',
                role: 'admin',
                firstName: 'Admin',
                lastName: 'User',
            });
        const adminLoginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'testadmin@example.com',
                password: 'password1',
            });
        const admin = await User.findOne({ email: 'testadmin@example.com' });
        adminId = admin.id;
        adminAuthToken = adminLoginResponse.body.token;
    });

    afterAll(async () => {
        // Disconnect MongoDB connection
        await User.deleteMany({});
        await mongoose.disconnect();
    });

    it('should get current user profile', async () => {
        const res = await request(app)
            .get(`/api/profile/me/${userId}`)
            .set('Authorization', userAuthToken);
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
            .put(`/api/profile/edit/${userId}`)
            .send(updatedProfile)
            .set('Authorization', userAuthToken);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('firstName', 'Updated');
        expect(res.body).toHaveProperty('lastName', 'User');
    });

    it('should return 400 for invalid user ID format', async () => {
        const res = await request(app)
            .get(`/api/profile/me/invalidUserID`)
            .set('Authorization', userAuthToken);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('errors');
        expect(res.body.errors[0].msg).toBe('Invalid user ID format');
    });

    it('should return 400 for missing first name in update profile request', async () => {
        const updatedProfile = {
            lastName: 'User',
        };
        const res = await request(app)
            .put(`/api/profile/edit/${userId}`)
            .send(updatedProfile)
            .set('Authorization', userAuthToken);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('errors');
        expect(res.body.errors[0].msg).toBe('Invalid value');
    });

    it('should return 400 for missing last name in update profile request', async () => {
        const updatedProfile = {
            firstName: 'Updated',
        };
        const res = await request(app)
            .put(`/api/profile/edit/${userId}`)
            .send(updatedProfile)
            .set('Authorization', userAuthToken);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('errors');
        expect(res.body.errors[0].msg).toBe('Invalid value');
    });

    it('should delete user profile', async () => {
        const res = await request(app)
            .delete(`/api/profile/delete/${userId}`)
            .set('Authorization', adminAuthToken);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'User deleted successfully');

        const deletedUser = await User.findById(userId);
        expect(deletedUser).toBeNull();
    });

    it('should return 404 for getting deleted user profile', async () => {
        const res = await request(app)
            .get(`/api/profile/me/${userId}`)
            .set('Authorization', userAuthToken);

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('message', 'User not found');
    });

    it('should return 404 for updating deleted user profile', async () => {
        const updatedProfile = {
            firstName: 'Nonexistent',
            lastName: 'User',
        };
        const res = await request(app)
            .put(`/api/profile/edit/${userId}`)
            .send(updatedProfile)
            .set('Authorization', userAuthToken);

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('message', 'User not found');
    });

    it('should return 404 for deleting already deleted user profile', async () => {
        const res = await request(app)
            .delete(`/api/profile/delete/${userId}`)
            .set('Authorization', adminAuthToken);
        
        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('message', 'User not found');
    });


});
