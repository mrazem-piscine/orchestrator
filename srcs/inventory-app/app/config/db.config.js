require('dotenv').config();

module.exports = {
  HOST: process.env.INVENTORY_DB_HOST,
  USER: process.env.INVENTORY_DB_USER || 'postgres',
  PASSWORD: process.env.INVENTORY_DB_PASS || 'postgres',
  DB: process.env.INVENTORY_DB_NAME || 'movies',
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
