# Control Dashboard Platform

Plataforma reusable de reportería económica y tableros analíticos.

Fase 1 implementa únicamente el primer módulo conectado: INFONAVIT read-only.

## Alcance de Fase 1

Incluye:

- health check de API;
- health check de DB;
- selector de periodo;
- consumo server-side del reporte extendido JSON;
- consumo server-side del reporte extendido Markdown;
- render inicial;
- vista Markdown;
- copiar Markdown;
- descarga Markdown/JSON en entorno local/controlado;
- manejo seguro de errores.

No incluye:

- IA;
- PDF;
- auth real;
- ETL;
- migraciones;
- acceso directo a Supabase;
- cambios al backend.

## Variables de entorno

Crear un `.env.local` local a partir de `.env.example`:

```text
INFONAVIT_API_BASE_URL=
INFONAVIT_API_KEY=
```

Ambas variables son privadas server-side. No deben usar prefijo `NEXT_PUBLIC_`.

## Ejecución local

```text
npm install
npm run dev
```

Validaciones esperadas:

```text
npm run lint
npm run typecheck
npm run build
npm run test
```

## Seguridad

El navegador solo llama rutas internas:

```text
/api/infonavit/health
/api/infonavit/db-health
/api/infonavit/extended/json
/api/infonavit/extended/markdown
```

La API key solo se agrega dentro del cliente server-side INFONAVIT.

Arquitectura permitida:

```text
Browser -> Next.js server-side -> Cloud Run FastAPI
```

Arquitectura prohibida:

```text
Browser -> Cloud Run FastAPI con X-API-Key
```
