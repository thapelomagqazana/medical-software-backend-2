const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User');

const testDatabaseUrl = 'mongodb://127.0.0.1/test_database';

beforeAll(async () => {
  // Connect to MongoDB
  await mongoose.connect(testDatabaseUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
    // Clear users collection before each test to ensure test isolation
    await User.deleteMany();
});

afterAll(async () => {
    // Cleanup database and disconnect after all tests
    await User.deleteMany();
    await mongoose.disconnect();
});

describe('POST /api/auth/register', () => {
  it('should register a new user', async () => {
    const response = await registerUser('testuser@example.com');
    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('msg', 'User registered successfully');
  });

  it('should return 400 with error message for duplicate user registration', async () => {
    await registerUser('duplicate@example.com');
    const response = await registerUser('duplicate@example.com');
    expect(response.statusCode).toEqual(400);
    expect(response.body).toHaveProperty('msg', 'User already exists');
  });
});

describe('POST /api/auth/login', () => {
  it('should authenticate and return a JWT token', async () => {
    await registerUser('loginuser@example.com');
    const response = await loginUser('loginuser@example.com', 'password');
    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('token');
  });

  it('should return 400 with error message for invalid credentials', async () => {
    const response = await loginUser('nonexistentuser@example.com', 'password');
    expect(response.statusCode).toEqual(400);
    expect(response.body).toHaveProperty('msg', 'Invalid credentials');
  });
});

// Helper functions to simplify user registration and login in tests
async function registerUser(email) {
  return request(app)
    .post('/api/auth/register')
    .send({
      email,
      password: 'password',
      confirmPassword: 'password',
      role: 'patient',
      firstName: 'Test',
      lastName: 'User',
    });
}

async function loginUser(email, password) {
  return request(app)
    .post('/api/auth/login')
    .send({ email, password });
}
