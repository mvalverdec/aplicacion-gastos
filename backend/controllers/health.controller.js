'use strict';

const db = require('../db/connection');

function appHealth(_req, res) {
  res.json({ status: 'ok' });
}

async function postgresHealth(_req, res, next) {
  try {
    const result = await db.ping();
    res.json({ status: 'ok', database: 'postgres', checkedAt: result.now });
  } catch (err) {
    err.statusCode = 503;
    next(err);
  }
}

module.exports = { appHealth, postgresHealth };
