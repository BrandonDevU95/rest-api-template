require('dotenv').config();

const requiredDatabaseVariables = ['DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_HOST', 'DB_PORT'];

for (const variableName of requiredDatabaseVariables) {
  if (!process.env[variableName]) {
    throw new Error(`Missing required environment variable: ${variableName}`);
  }
}

const dbPort = Number(process.env.DB_PORT);

if (Number.isNaN(dbPort)) {
  throw new Error('DB_PORT must be a valid number');
}

const sharedConfig = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: dbPort,
  dialect: 'mysql',
};

module.exports = {
  development: sharedConfig,
  test: sharedConfig,
  production: sharedConfig,
};
