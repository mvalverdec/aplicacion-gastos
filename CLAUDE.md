# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

CLI que normaliza gastos desde texto, imágenes y PDFs. Usa la API de Gemini para procesamiento visual. Entry point: `cli.js`.

## Commands

```bash
node cli.js <comando> <args>   # Ejecutar la CLI
node --test                    # Correr los tests
```

## Environment

Requiere un archivo `.env` en la raíz del proyecto (no en control de versiones):

```
GEMINI_API_KEY=your_key_here
```

## API

Se usa Gemini para procesar imágenes y PDFs. El cliente se inicializa con `GEMINI_API_KEY` cargado desde `.env`. Nunca hardcodear la API key en el código.

## Structure

```
cli.js            # Entry point
insumos/          # Datos de entrada (PDFs, imágenes) — no modificar
.env              # API keys (en .gitignore, nunca commitear)
package.json
```

## Conventions

- JavaScript con CommonJS (`require` / `module.exports`), no ESM
- Archivos pequeños y con una sola responsabilidad
- Dependencias externas solo cuando sean necesarias (ej: SDK de Gemini para visión)
- Commits en español, pequeños y descriptivos
- No crear archivos fuera del proyecto
- No modificar `insumos/` — son datos de entrada de solo lectura
- Remote: `origin` → https://github.com/mvalverdec/aplicacion-gastos
