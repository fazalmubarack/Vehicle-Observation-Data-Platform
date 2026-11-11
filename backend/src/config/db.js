const mongoose = require('mongoose');

const connectDB = async (uri) => {
  try {
    const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vehicle_observation_platform';
    const conn = await mongoose.connect(mongoUri);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('[Database] MongoDB connection closed');
  } catch (error) {
    console.error(`[Database Error] Disconnection error: ${error.message}`);
  }
};

module.exports = { connectDB, disconnectDB };
