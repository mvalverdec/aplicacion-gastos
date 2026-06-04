'use strict';

const express = require('express');
const controller = require('../controllers/dashboard.controller');

const router = express.Router();

router.get('/dashboard', controller.getDashboard);
router.get('/dashboard/summary', controller.getSummary);
router.get('/dashboard/by-category', controller.getByCategory);
router.get('/dashboard/by-month', controller.getByMonth);
router.get('/dashboard/by-merchant', controller.getByMerchant);
router.get('/dashboard/payment-methods', controller.getPaymentMethods);

module.exports = router;
