'use strict';

const os = require('os');
const path = require('path');
const express = require('express');
const multer = require('multer');
const controller = require('../controllers/imports.controller');

const router = express.Router();
const upload = multer({ dest: path.join(os.tmpdir(), 'aplicacion-gastos-uploads') });

router.post('/imports', upload.single('file'), controller.createImport);
router.get('/imports', controller.listImports);
router.get('/imports/:id', controller.getImport);
router.delete('/imports/:id', controller.deleteImport);

module.exports = router;
