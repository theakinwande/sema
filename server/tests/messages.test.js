const request = require('supertest');
const db = require('./setup');
const app = require('../src/app');

beforeAll(() => db.connect());
afterAll(() => db.disconnect());
afterEach(() => db.clear());

describe('Messages API', () => {
  let token;
  const username = 'msguser';

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username, displayName: 'Msg User', password: 'password123' });
    token = res.body.token;
  });

  describe('POST /api/messages/:username', () => {
    it('should send an anonymous message', async () => {
      const res = await request(app)
        .post(`/api/messages/${username}`)
        .send({ content: 'Hello anonymously!', prompt: 'ask me anything 🎤' });

      expect(res.status).toBe(201);
    });

    it('should not require auth to send', async () => {
      const res = await request(app)
        .post(`/api/messages/${username}`)
        .send({ content: 'No auth needed' });

      expect(res.status).toBe(201);
    });

    it('should reject empty content', async () => {
      const res = await request(app)
        .post(`/api/messages/${username}`)
        .send({ content: '' });

      expect(res.status).toBe(400);
    });

    it('should reject content over 500 chars', async () => {
      const res = await request(app)
        .post(`/api/messages/${username}`)
        .send({ content: 'a'.repeat(501) });

      expect(res.status).toBe(400);
    });

    it('should 404 for non-existent recipient', async () => {
      const res = await request(app)
        .post('/api/messages/nobody')
        .send({ content: 'Hello' });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/messages/inbox', () => {
    beforeEach(async () => {
      for (let i = 1; i <= 3; i++) {
        await request(app)
          .post(`/api/messages/${username}`)
          .send({ content: `Message ${i}` });
      }
    });

    it('should return inbox messages', async () => {
      const res = await request(app)
        .get('/api/messages/inbox')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.messages).toHaveLength(3);
    });

    it('should return newest first', async () => {
      const res = await request(app)
        .get('/api/messages/inbox')
        .set('Authorization', `Bearer ${token}`);

      const times = res.body.messages.map((m) => new Date(m.createdAt).getTime());
      expect(times).toEqual([...times].sort((a, b) => b - a));
    });

    it('should reject without auth', async () => {
      const res = await request(app).get('/api/messages/inbox');
      expect(res.status).toBe(401);
    });

    it('should not show messages for other users', async () => {
      const other = await request(app)
        .post('/api/auth/register')
        .send({ username: 'other', password: 'password123' });

      const res = await request(app)
        .get('/api/messages/inbox')
        .set('Authorization', `Bearer ${other.body.token}`);

      expect(res.body.messages).toHaveLength(0);
    });
  });

  describe('GET /api/messages/unread-count', () => {
    it('should return correct unread count', async () => {
      await request(app).post(`/api/messages/${username}`).send({ content: 'Msg 1' });
      await request(app).post(`/api/messages/${username}`).send({ content: 'Msg 2' });

      const res = await request(app)
        .get('/api/messages/unread-count')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);
    });
  });

  describe('PATCH /api/messages/:id/read', () => {
    it('should mark as read and decrease unread count', async () => {
      await request(app).post(`/api/messages/${username}`).send({ content: 'Read me' });

      const inbox = await request(app)
        .get('/api/messages/inbox')
        .set('Authorization', `Bearer ${token}`);

      const msgId = inbox.body.messages[0]._id;

      const res = await request(app)
        .patch(`/api/messages/${msgId}/read`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message.isRead).toBe(true);

      const unread = await request(app)
        .get('/api/messages/unread-count')
        .set('Authorization', `Bearer ${token}`);

      expect(unread.body.count).toBe(0);
    });
  });

  describe('PATCH /api/messages/:id/favorite', () => {
    it('should toggle favorite on and off', async () => {
      await request(app).post(`/api/messages/${username}`).send({ content: 'Fav me' });

      const inbox = await request(app)
        .get('/api/messages/inbox')
        .set('Authorization', `Bearer ${token}`);

      const msgId = inbox.body.messages[0]._id;

      const on = await request(app)
        .patch(`/api/messages/${msgId}/favorite`)
        .set('Authorization', `Bearer ${token}`);
      expect(on.body.message.isFavorite).toBe(true);

      const off = await request(app)
        .patch(`/api/messages/${msgId}/favorite`)
        .set('Authorization', `Bearer ${token}`);
      expect(off.body.message.isFavorite).toBe(false);
    });
  });

  describe('DELETE /api/messages/:id', () => {
    it('should delete a message', async () => {
      await request(app).post(`/api/messages/${username}`).send({ content: 'Delete me' });

      const inbox = await request(app)
        .get('/api/messages/inbox')
        .set('Authorization', `Bearer ${token}`);

      const msgId = inbox.body.messages[0]._id;

      const res = await request(app)
        .delete(`/api/messages/${msgId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);

      const after = await request(app)
        .get('/api/messages/inbox')
        .set('Authorization', `Bearer ${token}`);

      expect(after.body.messages).toHaveLength(0);
    });

    it('should not delete another user\'s message', async () => {
      await request(app).post(`/api/messages/${username}`).send({ content: 'Mine' });

      const inbox = await request(app)
        .get('/api/messages/inbox')
        .set('Authorization', `Bearer ${token}`);

      const msgId = inbox.body.messages[0]._id;

      const other = await request(app)
        .post('/api/auth/register')
        .send({ username: 'attacker', password: 'password123' });

      const res = await request(app)
        .delete(`/api/messages/${msgId}`)
        .set('Authorization', `Bearer ${other.body.token}`);

      expect(res.status).toBe(404);

      const check = await request(app)
        .get('/api/messages/inbox')
        .set('Authorization', `Bearer ${token}`);

      expect(check.body.messages).toHaveLength(1);
    });
  });

  describe('GET /api/health', () => {
    it('should return ok', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });
});
