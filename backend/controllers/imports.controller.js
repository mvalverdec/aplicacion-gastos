'use strict';

const importsService = require('../services/imports.service');
const importsRepository = require('../repositories/imports.repository');

async function createImport(req, res, next) {
  try {
    const result = await importsService.processImport({
      file: req.file,
      text: req.body.text,
      sourceName: req.body.sourceName,
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function listImports(_req, res, next) {
  try {
    res.json(await importsRepository.listImports());
  } catch (err) {
    next(err);
  }
}

async function getImport(req, res, next) {
  try {
    const importRecord = await importsRepository.getImport(req.params.id);
    if (!importRecord) return res.status(404).json({ error: 'Importación no encontrada.' });
    return res.json(importRecord);
  } catch (err) {
    return next(err);
  }
}

async function deleteImport(req, res, next) {
  try {
    const deleted = await importsRepository.deleteImport(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Importación no encontrada.' });
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = { createImport, listImports, getImport, deleteImport };
