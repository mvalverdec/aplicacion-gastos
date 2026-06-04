'use strict';

const express = require('express');
const controller = require('../controllers/health.controller');

const router = express.Router();

router.get('/health', controller.appHealth);
router.get('/health/postgres', controller.postgresHealth);

module.exports = router;
