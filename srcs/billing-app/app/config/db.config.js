require('dotenv').config();

module.exports = {
  HOST: process.env.BILLING_DB_HOST ,
  USER: process.env.BILLING_DB_USER || 'postgres',
  PASSWORD: process.env.BILLING_DB_PASS || 'postgres',
  DB: process.env.BILLING_DB_NAME || 'orders',
  dialect: 'postgres',
    pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};