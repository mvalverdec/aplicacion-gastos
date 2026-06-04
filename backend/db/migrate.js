'use strict';

require('dotenv').config();
const { pool } = require('./connection');

async function migrate() {
  await pool.query(`
    create table if not exists categories (
      id bigserial primary key,
      name text not null unique,
      slug text not null unique,
      color text not null default '#64748b',
      icon text not null default 'tag',
      parent_id bigint references categories(id) on delete set null,
      is_system boolean not null default false,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create table if not exists imports (
      id bigserial primary key,
      source_type text not null check (source_type in ('text', 'image', 'pdf')),
      source_name text not null,
      status text not null default 'processed' check (status in ('pending', 'processed', 'failed', 'reviewed')),
      gemini_model text,
      gemini_raw_result jsonb,
      error_message text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create table if not exists expenses (
      id bigserial primary key,
      import_id bigint references imports(id) on delete set null,
      category_id bigint references categories(id) on delete set null,
      expense_date date,
      merchant text,
      description text not null,
      amount numeric(14, 2) not null default 0,
      currency text not null default 'EUR',
      payment_method text,
      document_number text,
      confidence numeric(5, 4),
      needs_review boolean not null default false,
      raw_item jsonb,
      notes text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create index if not exists expenses_expense_date_idx on expenses(expense_date);
    create index if not exists expenses_category_id_idx on expenses(category_id);
    create index if not exists expenses_import_id_idx on expenses(import_id);
  `);

  await pool.query(`
    insert into categories (name, slug, color, icon, is_system)
    values
      ('alimentación', 'alimentacion', '#16a34a', 'utensils', true),
      ('transporte', 'transporte', '#2563eb', 'car', true),
      ('alojamiento', 'alojamiento', '#9333ea', 'hotel', true),
      ('material', 'material', '#ca8a04', 'package', true),
      ('servicios', 'servicios', '#0891b2', 'receipt', true),
      ('otros', 'otros', '#64748b', 'tag', true)
    on conflict (slug) do nothing;
  `);
}

migrate()
  .then(() => {
    console.log('Migraciones aplicadas.');
  })
  .catch(err => {
    console.error(err.stack || err.message || err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
