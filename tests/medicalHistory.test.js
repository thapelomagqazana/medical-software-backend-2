const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const User = require("../src/models/User");
const MedicalHistory = require("../src/models/MedicalHistory");

describe("Medical History Tracking API Tests", () => {
    let userAuthToken;
    let userId;
    let recordId;

    beforeAll(async () => {
        // Connect to MongoDB
        const url = `mongodb://127.0.0.1/test_database`;
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Clear users and medical history collections before tests
        await User.deleteMany({});
        await MedicalHistory.deleteMany({});

        // Register and login user
        await request(app)
            .post('/api/auth/register')
            .send({
                email: 'testuser@example.com',
                password: 'password',
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

        // Create a test medical record
        const newRecord = new MedicalHistory({
            userId,
            condition: 'Hypertension',
            diagnosisDate: new Date(),
        });
        const savedRecord = await newRecord.save();
        recordId = savedRecord._id;
    });

    afterAll(async () => {
        // Disconnect MongoDB connection
        await User.deleteMany({});
        await MedicalHistory.deleteMany({});
        await mongoose.disconnect();
    });

    it('should get medical history for a user', async () => {
        const res = await request(app)
            .get(`/api/medical-history/${userId}`)
            .set('Authorization', userAuthToken);
        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBe(1);
        expect(res.body[0].condition).toBe('Hypertension');
    });

    it('should add a new medical record', async () => {
        const newRecordData = {
            condition: 'Diabetes',
            diagnosisDate: new Date(),
        };
        const res = await request(app)
            .post(`/api/medical-history/${userId}`)
            .send(newRecordData)
            .set('Authorization', userAuthToken);
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.condition).toBe('Diabetes');
    });

    it('should update an existing medical record', async () => {
        const updatedRecordData = {
            condition: 'Updated Condition',
        };
        const res = await request(app)
            .put(`/api/medical-history/${recordId}`)
            .send(updatedRecordData)
            .set('Authorization', userAuthToken);
        expect(res.status).toBe(200);
        expect(res.body.condition).toBe('Updated Condition');
    });

    it('should delete an existing medical record', async () => {
        const res = await request(app)
            .delete(`/api/medical-history/${recordId}`)
            .set('Authorization', userAuthToken);
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Medical record deleted successfully');

        const deletedRecord = await MedicalHistory.findById(recordId);
        expect(deletedRecord).toBeNull();
    });

    it('should handle invalid user ID format for GET', async () => {
        const res = await request(app)
            .get('/api/medical-history/invalidUserId')
            .set('Authorization', userAuthToken);
        expect(res.status).toBe(400);
        expect(res.body.errors[0].msg).toBe('Invalid user ID format');
    });

    it('should handle invalid user ID format for POST', async () => {
        const newRecordData = {
            condition: 'Sample Condition',
            diagnosisDate: new Date(),
        };
        const res = await request(app)
            .post('/api/medical-history/invalidUserId')
            .send(newRecordData)
            .set('Authorization', userAuthToken);
        expect(res.status).toBe(400);
        expect(res.body.errors[0].msg).toBe('Invalid user ID format');
    });

    it('should handle invalid record ID format for PUT', async () => {
        const updatedRecordData = {
            condition: 'Updated Condition',
        };
        const res = await request(app)
            .put('/api/medical-history/invalidRecordId')
            .send(updatedRecordData)
            .set('Authorization', userAuthToken);
        expect(res.status).toBe(400);
        expect(res.body.errors[0].msg).toBe('Invalid record ID format');
    });

    it('should handle invalid record ID format for DELETE', async () => {
        const res = await request(app)
            .delete('/api/medical-history/invalidRecordId')
            .set('Authorization', userAuthToken);
        expect(res.status).toBe(400);
        expect(res.body.errors[0].msg).toBe('Invalid record ID format');
    });

    it('should handle medical record not found error for PUT', async () => {
        const updatedRecordData = {
            condition: 'Updated Condition',
        };
        const res = await request(app)
            .put(`/api/medical-history/${new mongoose.Types.ObjectId()}`)
            .send(updatedRecordData)
            .set('Authorization', userAuthToken);
        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Medical record not found');
    });

    it('should handle medical record not found error for DELETE', async () => {
        const res = await request(app)
            .delete(`/api/medical-history/${new mongoose.Types.ObjectId()}`)
            .set('Authorization', userAuthToken);
        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Medical record not found');
    });
});
