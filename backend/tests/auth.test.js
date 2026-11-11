require('./setup');
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');

describe('Authentication Module (Auth API)', () => {
  const testUser = {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'Password123!',
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully and return JWT', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email.toLowerCase());
      expect(res.body.user.name).toBe(testUser.name);
      expect(res.body.user.password).toBeUndefined(); // Never expose password

      // Verify user was stored with hashed password
      const stored = await User.findOne({ email: testUser.email.toLowerCase() }).select('+password');
      expect(stored).not.toBeNull();
      expect(stored.password).not.toBe(testUser.password);
    });

    it('should reject registration if email is already taken', async () => {
      await request(app).post('/api/auth/register').send(testUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Alice Duplicate',
          email: testUser.email,
          password: 'AnotherPassword456',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('should reject registration if fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Alice No Email' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject registration if password is under 6 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Short Pass',
          email: 'short@example.com',
          password: '123',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/at least 6 characters/i);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(testUser);
    });

    it('should authenticate user with valid credentials and return JWT', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('should reject login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid email or password/i);
    });

    it('should reject login for non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    let token;

    beforeEach(async () => {
      const reg = await request(app).post('/api/auth/register').send(testUser);
      token = reg.body.token;
    });

    it('should return current user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user.password).toBeUndefined();
    });

    it('should reject request without Authorization header', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject request with an invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.payload');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should successfully respond to logout request', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

