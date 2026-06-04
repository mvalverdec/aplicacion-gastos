# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project

Aplicación de gastos local-first. Actualmente combina:

- CLI legacy que normaliza gastos desde texto, imágenes y PDFs. Entry point: `cli.js`.
- Backend Node.js/Express que invoca Gemini, guarda gastos en PostgreSQL local y expone endpoints `/api`.
- Frontend React + TypeScript con Vite para importar documentos, revisar gastos y ver dashboards.

Gemini se invoca desde el backend, no desde el navegador, para no exponer `GEMINI_API_KEY`.

## Commands

```bash
node cli.js <comando> <args>   # Ejecutar la CLI legacy
npm run db:migrate             # Crear/actualizar tablas en PostgreSQL local
npm run backend:dev            # Levantar API en http://127.0.0.1:3000
npm run frontend:dev           # Levantar web app en http://127.0.0.1:5173
npm run frontend:build         # Compilar frontend
npm test                       # Correr tests con node --test
```

## Environment

Requiere un archivo `.env` en la raíz del proyecto (no en control de versiones):

```
GEMINI_API_KEY=your_key_here
DATABASE_URL=postgres://localhost:5432/aplicacion_gastos
BCCR_EMAIL=correo_suscrito_bccr
BCCR_TOKEN=token_bccr
BCCR_USD_SELL_RATE=463.66
EUR_USD_RATE=1.163
```

`DATABASE_URL` es opcional si se usa la base local por defecto `aplicacion_gastos`.
`BCCR_EMAIL` y `BCCR_TOKEN` son opcionales, pero permiten consultar el web service del BCCR. `BCCR_USD_SELL_RATE` sirve como respaldo local para el tipo de cambio de venta USD/CRC. `EUR_USD_RATE` es necesario si se importan gastos en euros y se quieren mostrar en dólares/colones.

## API

Se usa Gemini para procesar texto, imágenes y PDFs. El cliente se inicializa con `GEMINI_API_KEY` cargado desde `.env`. Nunca hardcodear la API key en el código ni enviarla al frontend.

Endpoints principales:

```text
GET    /api/health
GET    /api/health/postgres
POST   /api/imports
GET    /api/imports
GET    /api/expenses
POST   /api/expenses
PATCH  /api/expenses/:id
DELETE /api/expenses/:id
GET    /api/categories
GET    /api/dashboard
```

## Structure

```
cli.js              # Entry point CLI legacy
src/                # Lógica legacy reusable de parseo, ledger y reportes
backend/            # API Express, PostgreSQL, Gemini, repositorios y servicios
frontend/           # React + TypeScript + Vite
shared/             # Espacio reservado para schemas/constantes compartidas
tests/              # Tests
insumos/            # Datos de entrada (PDFs, imágenes) — no modificar
.env                # API keys y config local, nunca commitear
package.json
PLAN.md             # Plan, estado actual y próximos pasos
```

## Conventions

- Backend y CLI en JavaScript CommonJS (`require` / `module.exports`), no ESM
- Frontend en React + TypeScript con Vite
- Archivos pequeños y con una sola responsabilidad
- Dependencias externas solo cuando sean necesarias (ej: SDK de Gemini para visión)
- Commits en español, pequeños y descriptivos
- No crear archivos fuera del proyecto
- No modificar `insumos/` — son datos de entrada de solo lectura
- No exponer secretos en endpoints, logs o frontend
- Mantener PostgreSQL local como fuente de verdad para la web app
- Remote: `origin` → https://github.com/mvalverdec/aplicacion-gastos
