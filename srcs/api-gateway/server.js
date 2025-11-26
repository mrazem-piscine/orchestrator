// server.js
require('dotenv').config();
const express = require('express');
const setupProxy = require('./proxy.js');
const routes = require('./route.js');
const logger = require('./logger');

const app = express();

setupProxy(app);
app.use(express.json());
app.use(routes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.API_PORT || 3000;
app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
});