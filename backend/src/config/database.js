const mongoose = require('mongoose');
const env = require('./env');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectDatabase = async () => {
  if (!env.mongo.uri) {
    throw new Error('MONGODB_URI is required in environment variables');
  }

  const maxRetries = Number(process.env.MONGODB_CONNECT_RETRIES || 20);
  const retryDelayMs = Number(process.env.MONGODB_CONNECT_RETRY_DELAY_MS || 3000);

  const connectionOptions = {
    dbName: env.mongo.dbName,
    serverSelectionTimeoutMS: Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || 60000),
    family: 4,
    maxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE || 1),
    minPoolSize: Number(process.env.MONGODB_MIN_POOL_SIZE || 1),
    connectTimeoutMS: Number(process.env.MONGODB_CONNECT_TIMEOUT_MS || 10000),
    socketTimeoutMS: Number(process.env.MONGODB_SOCKET_TIMEOUT_MS || 120000)
  };

  if (process.env.MONGODB_TLS_ALLOW_INVALID_CERTS === 'true') {
    connectionOptions.tlsAllowInvalidCertificates = true;
  }

  if (process.env.MONGODB_TLS_ALLOW_INVALID_HOSTS === 'true') {
    connectionOptions.tlsAllowInvalidHostnames = true;
  }

  if (process.env.MONGODB_TLS_INSECURE === 'true') {
    connectionOptions.tlsInsecure = true;
  }

  if (process.env.MONGODB_TLS_V12_ONLY === 'true') {
    connectionOptions.secureProtocol = 'TLSv1_2_method';
  }

  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      await mongoose.connect(env.mongo.uri, connectionOptions);
      console.log(`MongoDB connected (${env.mongo.dbName}) on attempt ${attempt}/${maxRetries}`);
      return;
    } catch (error) {
      lastError = error;
      console.error(`MongoDB connection attempt ${attempt}/${maxRetries} failed: ${error.message}`);
      if (attempt < maxRetries) {
        await sleep(retryDelayMs);
      }
    }
  }

  throw lastError;
};

module.exports = {
  connectDatabase,
  mongoose
};
