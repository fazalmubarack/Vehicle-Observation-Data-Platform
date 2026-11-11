const path = require('path');
const os = require('os');
const fs = require('fs');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const localCachedBinary = path.join(
  os.homedir(),
  '.cache',
  'mongodb-binaries',
  'mongod-x64-win32-7.0.24.exe'
);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    binary: fs.existsSync(localCachedBinary)
      ? { systemBinary: localCachedBinary }
      : undefined,
    instance: {
      storageEngine: 'wiredTiger',
    },
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}, 60000);

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

afterEach(async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});
