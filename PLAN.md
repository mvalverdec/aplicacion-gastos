# Plan de Aplicacion de Gastos

## Objetivo

Convertir la CLI actual en una web app local para importar gastos desde texto, imagenes y PDFs, procesarlos con Gemini desde el backend, guardarlos en PostgreSQL local y visualizarlos en tablas y dashboards.

## Arquitectura

Flujo principal:

```text
Navegador React
  -> Backend Node/Express
    -> Gemini API
    -> PostgreSQL local
  -> Frontend muestra gastos y dashboards
```

Decisiones tomadas:

- Gemini se invoca desde el backend para proteger `GEMINI_API_KEY`.
- PostgreSQL local es la fuente de verdad de la web app.
- La CLI legacy se mantiene funcionando y reutiliza `src/parse.js`.
- El backend sigue en CommonJS para respetar el estilo actual.
- El frontend usa React + TypeScript con Vite.

## Estado Actual

Ya se implemento una primera vertical funcional:

- Dependencias instaladas: `express`, `pg`, `multer`, `cors`, `react`, `react-dom`, `vite`, `typescript`.
- Scripts agregados en `package.json`.
- Backend Express creado en `backend/`.
- Conexion PostgreSQL creada en `backend/db/connection.js`.
- Migracion inicial creada en `backend/db/migrate.js`.
- Base local `aplicacion_gastos` creada y migrada.
- Repositorios para categorias, importaciones y gastos.
- Servicio de Gemini en backend reutilizando `parseExpenses`.
- Endpoint `POST /api/imports` para procesar archivo o texto y guardar gastos.
- Endpoints de gastos, categorias, health y dashboard.
- Frontend React + TypeScript inicial en `frontend/`.
- Pantallas iniciales: dashboard, tabla de gastos e importacion.
- Pantalla de revision editable para gastos con `needsReview`.
- Importacion de multiples archivos en una sola carga.
- Soporte multimoneda para mostrar montos originales y equivalentes en CRC/USD.
- Conversion USD/CRC con tipo de cambio de venta BCCR via web service, portada publica o respaldo por `.env`.
- Build de frontend verificado.
- Endpoints locales verificados contra PostgreSQL.

## Estructura Actual

```text
aplicacion-gastos/
  cli.js
  src/
    parse.js
    ledger.js
    report.js

  backend/
    app.js
    server.js
    db/
      connection.js
      migrate.js
    routes/
    controllers/
    services/
    repositories/

  frontend/
    index.html
    vite.config.ts
    tsconfig.json
    src/
      App.tsx
      main.tsx
      pages/
      components/
      services/
      types/

  insumos/
  PLAN.md
  AGENTS.md
  package.json
```

## Endpoints Implementados

Health:

```text
GET /api/health
GET /api/health/postgres
```

Importaciones:

```text
POST   /api/imports
GET    /api/imports
GET    /api/imports/:id
DELETE /api/imports/:id
```

Gastos:

```text
GET    /api/expenses
GET    /api/expenses/:id
POST   /api/expenses
PATCH  /api/expenses/:id
DELETE /api/expenses/:id
```

Categorias:

```text
GET    /api/categories
POST   /api/categories
PATCH  /api/categories/:id
DELETE /api/categories/:id
```

Dashboard:

```text
GET /api/dashboard
GET /api/dashboard/summary
GET /api/dashboard/by-category
GET /api/dashboard/by-month
GET /api/dashboard/by-merchant
GET /api/dashboard/payment-methods
```

## Modelo De Datos

Tablas creadas:

```text
categories
imports
expenses
```

`categories` guarda categorias del sistema y futuras categorias personalizadas.

`imports` guarda cada procesamiento hecho con Gemini, incluyendo tipo de fuente, nombre del archivo, estado, modelo y resultado crudo.

`expenses` guarda los gastos normalizados con fecha, comercio, descripcion, monto, moneda, categoria, estado de revision y `raw_item`.

## Como Acceder A La Aplicacion En Local

Prerequisitos:

- PostgreSQL local encendido.
- Base `aplicacion_gastos` creada.
- `.env` en la raiz con `GEMINI_API_KEY`.

Config opcional en `.env`:

```text
DATABASE_URL=postgres://localhost:5432/aplicacion_gastos
PORT=3000
FRONTEND_ORIGIN=http://127.0.0.1:5173
BCCR_EMAIL=correo_suscrito_bccr
BCCR_TOKEN=token_bccr
BCCR_USD_SELL_RATE=463.66
EUR_USD_RATE=1.163
```

Arranque:

```bash
npm run db:migrate
npm run backend:dev
npm run frontend:dev
```

URLs:

```text
Web app: http://127.0.0.1:5173
API:     http://127.0.0.1:3000/api
Health:  http://127.0.0.1:3000/api/health
DB:      http://127.0.0.1:3000/api/health/postgres
```

La aplicacion quedo en este proyecto local:

```text
/Users/mvalverdec/Projects/aplicacion-gastos
```

## Verificaciones Realizadas

```bash
npm test
npm run frontend:build
npm run db:migrate
curl -s http://127.0.0.1:3000/api/health
curl -s http://127.0.0.1:3000/api/health/postgres
curl -s http://127.0.0.1:3000/api/dashboard
curl -s http://127.0.0.1:5173/api/dashboard
```

Resultado:

- Backend responde.
- PostgreSQL responde.
- Dashboard responde con datos vacios.
- Frontend compila.
- Proxy de Vite hacia `/api` funciona.
- `npm test` pasa, pero todavia no hay tests reales.

## Recomendaciones Y Proximos Pasos

1. Agregar tests reales del backend.
   - Health endpoints.
   - Normalizacion de gastos.
   - Repositorios con base de test o mocks.

2. Mejorar validacion de datos.
   - Validar payloads de `POST /api/expenses` y `PATCH /api/expenses/:id`.
   - Validar salida de Gemini antes de guardar.
   - Rechazar montos invalidos, fechas mal formadas y monedas no soportadas.

3. Mejorar importacion.
   - Mostrar progreso y errores por archivo.
   - Evitar duplicados por archivo o hash.

4. Mejorar dashboards.
   - Filtros por rango de fechas, categoria y comercio.
   - Graficos con una libreria dedicada si los graficos simples no alcanzan.
   - Historial de tipos de cambio por fecha del gasto.

5. Unificar CLI y web app.
   - Hacer que la CLI pueda guardar en PostgreSQL.
   - Mantener `expenses.json` solo como modo legacy o de exportacion.

6. Seguridad y configuracion.
   - No devolver secretos en endpoints.
   - Mantener `.env` fuera de git.
   - Documentar instalacion de PostgreSQL segun Homebrew, Postgres.app o Docker.

7. Experiencia de instalacion local.
   - Agregar README actualizado.
   - Agregar script `npm run dev` que arranque backend y frontend juntos si se decide agregar una dependencia como `concurrently`.
   - Agregar script de chequeo de PostgreSQL.

## Riesgos Pendientes

- La salida de Gemini puede variar y romper el guardado si no se valida con un schema.
- No hay autenticacion porque la app esta pensada local-first.
- No hay tests reales todavia.
- Si PostgreSQL esta apagado, el backend responde error; falta una pantalla dedicada con instrucciones.
