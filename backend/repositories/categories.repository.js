'use strict';

const db = require('../db/connection');

async function listCategories() {
  const result = await db.query(`
    select id, name, slug, color, icon, parent_id as "parentId", is_system as "isSystem",
           created_at as "createdAt", updated_at as "updatedAt"
    from categories
    order by is_system desc, name asc
  `);
  return result.rows;
}

async function findByName(name) {
  if (!name) return null;
  const result = await db.query('select * from categories where lower(name) = lower($1) limit 1', [name]);
  return result.rows[0] || null;
}

async function createCategory(category) {
  const result = await db.query(`
    insert into categories (name, slug, color, icon, parent_id, is_system)
    values ($1, $2, coalesce($3, '#64748b'), coalesce($4, 'tag'), $5, false)
    returning id, name, slug, color, icon, parent_id as "parentId", is_system as "isSystem",
              created_at as "createdAt", updated_at as "updatedAt"
  `, [category.name, category.slug, category.color, category.icon, category.parentId || null]);
  return result.rows[0];
}

async function updateCategory(id, category) {
  const result = await db.query(`
    update categories
    set name = coalesce($2, name),
        slug = coalesce($3, slug),
        color = coalesce($4, color),
        icon = coalesce($5, icon),
        parent_id = coalesce($6, parent_id),
        updated_at = now()
    where id = $1
    returning id, name, slug, color, icon, parent_id as "parentId", is_system as "isSystem",
              created_at as "createdAt", updated_at as "updatedAt"
  `, [id, category.name, category.slug, category.color, category.icon, category.parentId]);
  return result.rows[0] || null;
}

async function deleteCategory(id) {
  const result = await db.query('delete from categories where id = $1 and is_system = false returning id', [id]);
  return result.rowCount > 0;
}

module.exports = { listCategories, findByName, createCategory, updateCategory, deleteCategory };
