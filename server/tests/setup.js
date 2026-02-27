const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

module.exports = {
  async connect() {
    mongoServer = await MongoMemoryServer.create();
    process.env.JWT_SECRET = 'test-secret-key';
    await mongoose.connect(mongoServer.getUri());
  },

  async disconnect() {
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  },

  async clear() {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  },
};
