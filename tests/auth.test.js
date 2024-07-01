const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User');

beforeAll(async () => {
  // Connect to MongoDB
  const url = `mongodb://127.0.0.1/test_database`;
  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterEach(async () => {
    await User.deleteMany();
});

afterAll(async () => {
    await User.deleteMany();
  // Disconnect MongoDB connection
    await mongoose.disconnect();
});

describe('POST /api/auth/register', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'testuser@example.com',
        password: 'password',
        role: 'patient',
        firstName: 'Test',
        lastName: 'User',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('msg', 'User registered successfully');

  });

  it('should return 400 with error message for duplicate user registration', async () => {
    // Register a user first
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'duplicate@example.com',
        password: 'password',
        role: 'patient',
        firstName: 'Duplicate',
        lastName: 'User',
      });

    // Attempt to register the same user again
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'duplicate@example.com',
        password: 'password',
        role: 'patient',
        firstName: 'Duplicate',
        lastName: 'User',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('msg', 'User already exists');
  });
});

describe('POST /api/auth/login', () => {
  it('should authenticate and return a JWT token', async () => {
    // Register a user first
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'loginuser@example.com',
        password: 'password',
        role: 'patient',
        firstName: 'Login',
        lastName: 'User',
      });

    // Login with registered user
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'loginuser@example.com',
        password: 'password',
      });


    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should return 400 with error message for invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistentuser@example.com',
        password: 'password',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('msg', 'Invalid credentials');
  });
});
