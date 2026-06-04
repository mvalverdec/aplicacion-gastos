'use strict';

const db = require('../db/connection');

async function createImport(importRecord) {
  const result = await db.query(`
    insert into imports (source_type, source_name, status, gemini_model, gemini_raw_result, error_message)
    values ($1, $2, $3, $4, $5::jsonb, $6)
    returning id, source_type as "sourceType", source_name as "sourceName", status,
              gemini_model as "geminiModel", gemini_raw_result as "geminiRawResult",
              error_message as "errorMessage", created_at as "createdAt", updated_at as "updatedAt"
  `, [
    importRecord.sourceType,
    importRecord.sourceName,
    importRecord.status || 'processed',
    importRecord.geminiModel || null,
    JSON.stringify(importRecord.geminiRawResult || null),
    importRecord.errorMessage || null,
  ]);
  return result.rows[0];
}

async function listImports() {
  const result = await db.query(`
    select id, source_type as "sourceType", source_name as "sourceName", status,
           gemini_model as "geminiModel", error_message as "errorMessage",
           created_at as "createdAt", updated_at as "updatedAt"
    from imports
    order by created_at desc
    limit 100
  `);
  return result.rows;
}

async function getImport(id) {
  const result = await db.query(`
    select id, source_type as "sourceType", source_name as "sourceName", status,
           gemini_model as "geminiModel", gemini_raw_result as "geminiRawResult",
           error_message as "errorMessage", created_at as "createdAt", updated_at as "updatedAt"
    from imports
    where id = $1
  `, [id]);
  return result.rows[0] || null;
}

async function deleteImport(id) {
  const result = await db.query('delete from imports where id = $1 returning id', [id]);
  return result.rowCount > 0;
}

module.exports = { createImport, listImports, getImport, deleteImport };
