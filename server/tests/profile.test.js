const request = require('supertest');
const db = require('./setup');
const app = require('../src/app');

beforeAll(() => db.connect());
afterAll(() => db.disconnect());
afterEach(() => db.clear());

describe('Profile API', () => {
  let token;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'profuser', displayName: 'Profile User', password: 'password123' });
    token = res.body.token;
  });

  describe('GET /api/profile/:username', () => {
    it('should return public profile', async () => {
      const res = await request(app).get('/api/profile/profuser');

      expect(res.status).toBe(200);
      expect(res.body.username).toBe('profuser');
      expect(res.body.displayName).toBe('Profile User');
      expect(res.body.activePrompt).toBeDefined();
      expect(res.body.password).toBeUndefined();
    });

    it('should be case-insensitive', async () => {
      const res = await request(app).get('/api/profile/ProfUser');
      expect(res.status).toBe(200);
      expect(res.body.username).toBe('profuser');
    });

    it('should 404 for non-existent user', async () => {
      const res = await request(app).get('/api/profile/nobody');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/profile/prompt', () => {
    it('should update active prompt', async () => {
      const res = await request(app)
        .put('/api/profile/prompt')
        .set('Authorization', `Bearer ${token}`)
        .send({ prompt: 'tell me a secret 🤐' });

      expect(res.status).toBe(200);
      expect(res.body.user.activePrompt).toBe('tell me a secret 🤐');
    });

    it('should persist the prompt change', async () => {
      await request(app)
        .put('/api/profile/prompt')
        .set('Authorization', `Bearer ${token}`)
        .send({ prompt: 'new prompt' });

      const res = await request(app).get('/api/profile/profuser');
      expect(res.body.activePrompt).toBe('new prompt');
    });

    it('should reject without auth', async () => {
      const res = await request(app)
        .put('/api/profile/prompt')
        .send({ prompt: 'test' });

      expect(res.status).toBe(401);
    });

    it('should reject empty prompt', async () => {
      const res = await request(app)
        .put('/api/profile/prompt')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
    });
  });
});
