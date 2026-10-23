# test-manager-library-3239137-tool

Utilidades de **Manager Library**: sembrador de datos de demostración.

> El sembrador usa **solo la API**. Nunca escribe SQL directo
> (data-model.md §9 y tasks.md T-21).

## Requisitos

- Node.js 18+
- Backend (api) corriendo y con migraciones aplicadas
- Credenciales de admin válidas

## Arranque rápido

1. Instalar: npm install
2. Copiar entorno: cp .env.example .env
3. Ajustar API_BASE_URL, ADMIN_USERNAME y ADMIN_PASSWORD
4. Ejecutar: npm run seed

## Qué siembra (T-21)

| Dato | Cantidad mínima |
|------|-----------------|
| Libros | ≥ 40 |
| Socios | 10 |
| Préstamos | 15 |
| Líneas vencidas | 3 |

Después de correrlo:

- GET /loans/overdue debe devolver al menos 3 líneas
- El reporte de más prestados debe tener filas

## Variables de entorno

| Variable | Uso |
|----------|-----|
| API_BASE_URL | Base de la API (ej. http://localhost:8000/api/v1) |
| ADMIN_USERNAME | Usuario admin |
| ADMIN_PASSWORD | Clave admin |

## Relación con el spec

| Documento | Cómo se aplica |
|-----------|----------------|
| data-model.md §9 | Semilla de demo por API, no por SQL |
| tasks.md T-21 | Cantidades mínimas y evidencia |
| api-contract.md | Todas las llamadas respetan el contrato |
