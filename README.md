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

## Runtime Node

El runtime objetivo del proyecto es Node 22 LTS.

El repositorio declara:

```text
.nvmrc -> 22
package.json -> "node": ">=22 <23"
```

## Nota tecnica sobre Next/SWC en Windows

Los scripts `dev` y `build` usan el flujo estandar de Next.js:

```text
next dev
next build
```

Durante Fase 1 existio un workaround temporal para SWC/WASM en Windows, pero ya fue eliminado. El build estandar fue validado correctamente.

Node 22 LTS ya quedo fijado como runtime del proyecto mediante `.nvmrc` y `engines.node`.

Ver:

```text
docs/nota_tecnica_next_swc_windows.md
```

## Audit de dependencias

`npm audit` puede reportar un hallazgo moderado de `postcss <8.5.10` como dependencia transitiva de Next.js.

No ejecutar:

```text
npm audit fix --force
```

porque npm propone degradar Next.js a una version incompatible.

Ver:

```text
docs/nota_tecnica_audit_dependencias.md
```

## Descargas en Fase 1

Las descargas Markdown/JSON estan permitidas solo en entorno local/controlado durante Fase 1.

No se deben exponer publicamente sin autenticacion y capabilities/permisos. Antes de cualquier despliegue publico debe existir un gate de autorizacion server-side para descargas.

Esta restriccion no bloquea Fase 1 local, pero si bloquea una exposicion publica futura.

La decision arquitectonica y sus limitaciones estan documentadas en:

```text
docs/nota_tecnica_descargas_capabilities.md
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

La matriz de controles futuros y bloqueantes para exposicion publica esta documentada en:

```text
docs/matriz_controles_futuros.md
```
