'use strict';

const express = require('express');
const controller = require('../controllers/categories.controller');

const router = express.Router();

router.get('/categories', controller.listCategories);
router.post('/categories', controller.createCategory);
router.patch('/categories/:id', controller.updateCategory);
router.delete('/categories/:id', controller.deleteCategory);

module.exports = router;
