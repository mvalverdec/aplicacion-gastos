'use strict';

const categoriesRepository = require('../repositories/categories.repository');

async function listCategories(_req, res, next) {
  try {
    res.json(await categoriesRepository.listCategories());
  } catch (err) {
    next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    res.status(201).json(await categoriesRepository.createCategory(req.body));
  } catch (err) {
    next(err);
  }
}

async function updateCategory(req, res, next) {
  try {
    const category = await categoriesRepository.updateCategory(req.params.id, req.body);
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada.' });
    return res.json(category);
  } catch (err) {
    return next(err);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const deleted = await categoriesRepository.deleteCategory(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Categoría no encontrada o de sistema.' });
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
