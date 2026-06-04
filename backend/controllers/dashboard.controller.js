'use strict';

const dashboardService = require('../services/dashboard.service');

async function getDashboard(req, res, next) {
  try {
    res.json(await dashboardService.dashboard(req.query));
  } catch (err) {
    next(err);
  }
}

async function getSummary(req, res, next) {
  try {
    res.json(await dashboardService.summary(req.query));
  } catch (err) {
    next(err);
  }
}

async function getByCategory(req, res, next) {
  try {
    res.json(await dashboardService.byCategory(req.query));
  } catch (err) {
    next(err);
  }
}

async function getByMonth(req, res, next) {
  try {
    res.json(await dashboardService.byMonth(req.query));
  } catch (err) {
    next(err);
  }
}

async function getByMerchant(req, res, next) {
  try {
    res.json(await dashboardService.byMerchant(req.query));
  } catch (err) {
    next(err);
  }
}

async function getPaymentMethods(req, res, next) {
  try {
    res.json(await dashboardService.paymentMethods(req.query));
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard, getSummary, getByCategory, getByMonth, getByMerchant, getPaymentMethods };
