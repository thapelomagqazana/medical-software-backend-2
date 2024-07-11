const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const Appointment = require("../src/models/Appointment");
const User = require("../src/models/User");

describe("Appointment API Tests", () => {
    let userAuthToken;
    let doctorAuthToken;
    let userId;
    let doctorId;
    let appointmentId;

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

        // Register and login doctor
        await request(app)
            .post('/api/auth/register')
            .send({
                email: 'testdoctor@example.com',
                password: 'password1',
                confirmPassword: 'password1',
                role: 'doctor',
                firstName: 'Doctor',
                lastName: 'User',
            });
        const doctorLoginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'testdoctor@example.com',
                password: 'password1',
            });
        const doctor = await User.findOne({ email: 'testdoctor@example.com' });
        doctorId = doctor.id;
        doctorAuthToken = doctorLoginResponse.body.token;

        // Create a sample appointment
        const newAppointment = {
            patientId: userId,
            doctorId: doctorId,
            startTime: new Date(new Date().getTime() + 30 * 60 * 1000),
            endTime: new Date(new Date().getTime() + 60 * 60 * 1000), // 1 hour later
        };
        const appointmentResponse = await request(app)
            .post('/api/appointments')
            .send(newAppointment)
            .set('Authorization', userAuthToken);
        appointmentId = appointmentResponse.body._id;
    });

    afterAll(async () => {
        // Disconnect MongoDB connection
        await Appointment.deleteMany({});
        await mongoose.disconnect();
    });

    it('should fetch all appointments', async () => {
        const res = await request(app)
            .get('/api/appointments/all')
            .set('Authorization', doctorAuthToken);
        
        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('should get upcoming appointments for the logged-in patient', async () => {
        const res = await request(app)
            .get('/api/patient/upcoming-appointments')
            .set('Authorization', userAuthToken);

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0]).toHaveProperty('patientId', userId);
        expect(res.body[0]).toHaveProperty('startTime');
        // Convert startTime string to Date object
        const startTime = new Date(res.body[0].startTime);
        expect(startTime).toBeInstanceOf(Date);
    });

    it('should get all appointments for the logged-in patient', async () => {
        const res = await request(app)
            .get('/api/patient/appointments')
            .set('Authorization', userAuthToken);

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0]).toHaveProperty('patientId', userId);
        expect(res.body[0]).toHaveProperty('startTime');
        // Convert startTime string to Date object
        const startTime = new Date(res.body[0].startTime);
        expect(startTime).toBeInstanceOf(Date);
    });

    it('should fetch a single appointment by ID', async () => {
        const res = await request(app)
            .get(`/api/appointments/${appointmentId}`)
            .set('Authorization', userAuthToken);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('_id', appointmentId);
    });

    it('should return 404 for fetching non-existent appointment', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .get(`/api/appointments/${nonExistentId}`)
            .set('Authorization', userAuthToken);

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('msg', 'Appointment not found');
    });

    it('should create a new appointment', async () => {
        const newAppointment = {
            patientId: userId,
            doctorId: doctorId,
            startTime: new Date('2024-07-15T09:00:00Z'),
            endTime: new Date('2024-07-15T10:00:00Z'),
        };
        const res = await request(app)
            .post('/api/appointments')
            .send(newAppointment)
            .set('Authorization', userAuthToken);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('patientId', userId);
        expect(res.body).toHaveProperty('doctorId', doctorId);
    });

    it('should not allow double booking for the doctor', async () => {
        const newAppointmentData = {
            patientId: userId,
            doctorId: doctorId,
            startTime: new Date('2024-07-15T09:30:00Z'),
            endTime: new Date('2024-07-15T10:30:00Z'),
        };

        const res = await request(app)
            .post('/api/appointments')
            .send(newAppointmentData)
            .set('Authorization', userAuthToken);

        expect(res.status).toBe(403);
        expect(res.body).toHaveProperty('msg', 'Doctor is already booked during this time');
    });

    // it('should not allow double booking for the patient', async () => {
    //     const newAppointmentData = {
    //         patientId: userId,
    //         doctorId: doctorId,
    //         startTime: new Date('2024-07-15T09:00:00Z'),
    //         endTime: new Date('2024-07-15T10:00:00Z'),
    //     };

    //     const res = await request(app)
    //         .post('/api/appointments')
    //         .send(newAppointmentData)
    //         .set('Authorization', userAuthToken);

    //     expect(res.status).toBe(403);
    //     expect(res.body).toHaveProperty('msg', 'Patient already has an appointment during this time');
    // });

    it('should update an existing appointment', async () => {
        const updatedAppointment = {
            patientId: userId,
            doctorId: doctorId,
            startTime: new Date(),
            endTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // 2 hours later
        };
        const res = await request(app)
            .put(`/api/appointments/${appointmentId}`)
            .send(updatedAppointment)
            .set('Authorization', doctorAuthToken);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('_id', appointmentId);
        expect(new Date(res.body.startTime).toISOString()).toEqual(updatedAppointment.startTime.toISOString());
        expect(new Date(res.body.endTime).toISOString()).toEqual(updatedAppointment.endTime.toISOString());
    });

    it('should delete an appointment', async () => {
        const res = await request(app)
            .delete(`/api/appointments/${appointmentId}`)
            .set('Authorization', doctorAuthToken);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('msg', 'Appointment removed');

        const deletedAppointment = await Appointment.findById(appointmentId);
        expect(deletedAppointment).toBeNull();
    });

    it('should return 404 for deleting non-existent appointment', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .delete(`/api/appointments/${nonExistentId}`)
            .set('Authorization', doctorAuthToken);

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('msg', 'Appointment not found');
    });

    it('should return 400 for invalid appointment ID format', async () => {
        const res = await request(app)
            .get(`/api/appointments/invalidAppointmentID`)
            .set('Authorization', doctorAuthToken);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('errors');
        expect(res.body.errors[0].msg).toBe('Invalid appointment ID format');
    });

    it('should return 400 for missing patientId in create appointment request', async () => {
        const newAppointment = {
            doctorId: doctorId,
            startTime: new Date(),
            endTime: new Date(new Date().getTime() + 60 * 60 * 1000), // 1 hour later
        };
        const res = await request(app)
            .post('/api/appointments')
            .send(newAppointment)
            .set('Authorization', doctorAuthToken);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('errors');
        expect(res.body.errors[0].msg).toBe('Invalid value');
    });

    it('should return 400 for missing doctorId in create appointment request', async () => {
        const newAppointment = {
            patientId: userId,
            startTime: new Date(),
            endTime: new Date(new Date().getTime() + 60 * 60 * 1000), // 1 hour later
        };
        const res = await request(app)
            .post('/api/appointments')
            .send(newAppointment)
            .set('Authorization', doctorAuthToken);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('errors');
        expect(res.body.errors[0].msg).toBe('Invalid value');
    });

    it('should return 400 for missing startTime in create appointment request', async () => {
        const newAppointment = {
            patientId: userId,
            doctorId: doctorId,
            endTime: new Date(new Date().getTime() + 60 * 60 * 1000), // 1 hour later
        };
        const res = await request(app)
            .post('/api/appointments')
            .send(newAppointment)
            .set('Authorization', doctorAuthToken);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('errors');
        expect(res.body.errors[0].msg).toBe('Invalid value');
    });

    it('should return 400 for missing endTime in create appointment request', async () => {
        const newAppointment = {
            patientId: userId,
            doctorId: doctorId,
            startTime: new Date(),
        };
        const res = await request(app)
            .post('/api/appointments')
            .send(newAppointment)
            .set('Authorization', doctorAuthToken);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('errors');
        expect(res.body.errors[0].msg).toBe('Invalid value');
    });

    it('should return 400 for invalid startTime format in update appointment request', async () => {
        const updatedAppointment = {
            startTime: 'invalidStartTime',
        };
        const res = await request(app)
            .put(`/api/appointments/${appointmentId}`)
            .send(updatedAppointment)
            .set('Authorization', doctorAuthToken);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('errors');
        expect(res.body.errors[0].msg).toBe('Invalid value');
    });

    it('should return 400 for invalid endTime format in update appointment request', async () => {
        const updatedAppointment = {
            endTime: 'invalidEndTime',
        };
        const res = await request(app)
            .put(`/api/appointments/${appointmentId}`)
            .send(updatedAppointment)
            .set('Authorization', doctorAuthToken);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('errors');
        expect(res.body.errors[0].msg).toBe('Invalid value');
    });

    it('should return 404 for updating non-existent appointment', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const updatedAppointment = {
            startTime: new Date(),
            endTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // 2 hours later
        };
        const res = await request(app)
            .put(`/api/appointments/${nonExistentId}`)
            .send(updatedAppointment)
            .set('Authorization', doctorAuthToken);

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('msg', 'Appointment not found');
    });

    it('should return 404 for deleting non-existent appointment', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .delete(`/api/appointments/${nonExistentId}`)
            .set('Authorization', doctorAuthToken);

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('msg', 'Appointment not found');
    });

});
