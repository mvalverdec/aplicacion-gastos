'use strict';

require('dotenv').config();
const { createApp } = require('./app');

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '127.0.0.1';
const app = createApp();

const server = app.listen(port, host, () => {
  console.log(`API escuchando en http://${host}:${port}`);
});

server.on('error', err => {
  console.error(err.stack || err.message || err);
  process.exit(1);
});
