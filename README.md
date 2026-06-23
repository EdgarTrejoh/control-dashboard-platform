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

## Nota tecnica sobre Next/SWC en Windows

Los scripts `dev` y `build` usan temporalmente `scripts/with-next-wasm.mjs`.

Este wrapper existe porque en el entorno local Windows con Node 24 se detecto un fallo al cargar el binario nativo SWC de Next.js 15.

La solucion objetivo es normalizar el proyecto a Node 22 LTS y eliminar el wrapper si `next dev` y `next build` funcionan con SWC nativo.

Ver:

```text
docs/nota_tecnica_next_swc_windows.md
```

## Descargas en Fase 1

Las descargas Markdown/JSON estan permitidas solo en entorno local/controlado durante Fase 1.

No se deben exponer publicamente sin autenticacion y capabilities/permisos. Antes de cualquier despliegue publico debe existir un gate de autorizacion server-side para descargas.

Esta restriccion no bloquea Fase 1 local, pero si bloquea una exposicion publica futura.

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
