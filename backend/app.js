'use strict';

const express = require('express');
const cors = require('cors');

const healthRoutes = require('./routes/health.routes');
const importsRoutes = require('./routes/imports.routes');
const expensesRoutes = require('./routes/expenses.routes');
const categoriesRoutes = require('./routes/categories.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://127.0.0.1:5173' }));
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use('/api', healthRoutes);
  app.use('/api', importsRoutes);
  app.use('/api', expensesRoutes);
  app.use('/api', categoriesRoutes);
  app.use('/api', dashboardRoutes);

  app.use((_req, res) => {
    res.status(404).json({ error: 'Endpoint no encontrado.' });
  });

  app.use((err, _req, res, _next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      error: err.message || 'Error interno.',
      postgresHint: statusCode === 503 ? 'Verifica que PostgreSQL local esté encendido y que DATABASE_URL sea correcto.' : undefined,
    });
  });

  return app;
}

module.exports = { createApp };
