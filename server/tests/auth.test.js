const request = require('supertest');
const db = require('./setup');
const app = require('../src/app');

beforeAll(() => db.connect());
afterAll(() => db.disconnect());
afterEach(() => db.clear());

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', displayName: 'Test User', password: 'password123' });

      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.username).toBe('testuser');
      expect(res.body.user.displayName).toBe('Test User');
      expect(res.body.user.password).toBeUndefined();
    });

    it('should normalize username to lowercase', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'TestUser', password: 'password123' });

      expect(res.status).toBe(201);
      expect(res.body.user.username).toBe('testuser');
    });

    it('should use username as displayName if not provided', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'noname', password: 'password123' });

      expect(res.status).toBe(201);
      expect(res.body.user.displayName).toBe('noname');
    });

    it('should reject duplicate username', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ username: 'taken', password: 'password123' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'taken', password: 'password456' });

      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/already taken/i);
    });

    it('should reject invalid username (too short)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'ab', password: 'password123' });

      expect(res.status).toBe(400);
    });

    it('should reject invalid username (special chars)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'user@name', password: 'password123' });

      expect(res.status).toBe(400);
    });

    it('should reject short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: '123' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/6 characters/i);
    });

    it('should reject missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ username: 'loginuser', password: 'password123' });
    });

    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'loginuser', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.username).toBe('loginuser');
    });

    it('should reject wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'loginuser', password: 'wrongpassword' });

      expect(res.status).toBe(401);
    });

    it('should reject non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'nobody', password: 'password123' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user when authenticated', async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send({ username: 'meuser', displayName: 'Me', password: 'password123' });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${reg.body.token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.username).toBe('meuser');
    });

    it('should reject requests without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('should reject invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken');

      expect(res.status).toBe(401);
    });
  });
});
