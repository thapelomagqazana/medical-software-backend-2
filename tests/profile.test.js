const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const User = require("../src/models/User");
const path = require('path');

const testDatabaseUrl = `mongodb://127.0.0.1/test_database`;

describe("Profile API Tests", () => {
    let userAuthToken, adminAuthToken;
    let userId, adminId;

    beforeAll(async () => {
        await mongoose.connect(testDatabaseUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        await User.deleteMany({});

        userId = await registerUser('testuser@example.com', 'password', 'patient');
        userAuthToken = await loginUser('testuser@example.com', 'password');
        
        adminId = await registerUser('testadmin@example.com', 'password1', 'admin');
        adminAuthToken = await loginUser('testadmin@example.com', 'password1');
    });

    afterAll(async () => {
        await User.deleteMany({});
        await mongoose.disconnect();
    });

    it('should get current user profile', async () => {
        const res = await getUserProfile(userId, userAuthToken);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('firstName', 'Test');
    });

    it('should update user profile', async () => {
        const updatedProfile = { firstName: 'Updated', lastName: 'User' };
        const res = await updateUserProfile(userId, updatedProfile, userAuthToken);
        expect(res.status).toBe(200);
        expect(res.body.firstName).toEqual('Updated');
    });

    // it('should upload a profile picture and update patient profile', async () => {
    //     const res = await request(app)
    //         .post('/api/profile/picture')
    //         .set('Authorization', userAuthToken) // Assuming validToken is set correctly
    //         .attach('picture', path.resolve(__dirname, 'testPic.jpg'));
    //     console.log(res);
    //     expect(res.status).toBe(200);
    //     // expect(res.body).toHaveProperty('msg', 'Profile picture updated successfully');
    //     // expect(res.body.data).toHaveProperty('profilePicture');
    // });

    it('should return 400 for invalid user ID format in profile fetch', async () => {
        const res = await getUserProfile('invalidUserID', userAuthToken);
        expect(res.status).toBe(400);
        expect(res.body.errors[0].msg).toBe('Invalid user ID format');
    });

    it('should delete user profile', async () => {
        const res = await deleteUserProfile(userId, adminAuthToken);
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('User deleted successfully');
    });

    it('should return 404 for getting deleted user profile', async () => {
        const res = await getUserProfile(userId, userAuthToken);
        expect(res.status).toBe(404);
    });



    // Helper functions
    async function registerUser(email, password, role) {
        await request(app).post('/api/auth/register').send({
            email, password, confirmPassword: password, role,
            firstName: 'Test', lastName: 'User'
        });
        const user = await User.findOne({ email });
        return user.id;
    }

    async function loginUser(email, password) {
        const response = await request(app)
            .post('/api/auth/login')
            .send({ email, password });
        return response.body.token;
    }

    async function getUserProfile(userId, authToken) {
        return request(app)
            .get(`/api/profile/me/${userId}`)
            .set('Authorization', `Bearer ${authToken}`);
    }

    async function updateUserProfile(userId, profileData, authToken) {
        return request(app)
            .put(`/api/profile/edit/${userId}`)
            .send(profileData)
            .set('Authorization', `Bearer ${authToken}`);
    }

    async function deleteUserProfile(userId, authToken) {
        return request(app)
            .delete(`/api/profile/delete/${userId}`)
            .set('Authorization', `Bearer ${authToken}`);
    }
});
