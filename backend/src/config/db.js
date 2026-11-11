const mongoose = require('mongoose');
const path = require('path');
const os = require('os');
const fs = require('fs');

let memoryServerInstance = null;

const connectDB = async (uri) => {
  const mongoUri =
    uri ||
    process.env.MONGODB_URI ||
    'mongodb://127.0.0.1:27017/vehicle_observation_platform';

  try {
    // Attempt connection with quick timeout
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(
      `[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`
    );
    return conn;
  } catch (error) {
    console.warn(
      `[Database] Could not connect to primary MongoDB at ${mongoUri}: ${error.message}`
    );

    // Resilient fallback to local embedded engine for zero-configuration evaluation
    try {
      console.log('[Database] Starting resilient embedded MongoDB engine...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const localCachedBinary = path.join(
        os.homedir(),
        '.cache',
        'mongodb-binaries',
        'mongod-x64-win32-7.0.24.exe'
      );

      memoryServerInstance = await MongoMemoryServer.create({
        binary: fs.existsSync(localCachedBinary)
          ? { systemBinary: localCachedBinary }
          : undefined,
        instance: {
          storageEngine: 'wiredTiger',
        },
      });

      const fallbackUri = memoryServerInstance.getUri();
      const conn = await mongoose.connect(fallbackUri);
      console.log(`[Database] Embedded MongoDB Active: ${fallbackUri}`);
      return conn;
    } catch (fallbackError) {
      console.error(
        `[Database Error] Embedded engine startup failed: ${fallbackError.message}`
      );
      if (process.env.NODE_ENV !== 'test') {
        process.exit(1);
      }
      throw error;
    }
  }
};

const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('[Database] MongoDB connection closed');
    }
    if (memoryServerInstance) {
      await memoryServerInstance.stop();
    }
  } catch (error) {
    console.error(`[Database Error] Disconnection error: ${error.message}`);
  }
};

module.exports = { connectDB, disconnectDB };
