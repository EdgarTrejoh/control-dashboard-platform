# Control Dashboard Platform

Plataforma reusable para reporteria economica, tableros analiticos y consumo
seguro de APIs analiticas.

## Estado actual

Estado vigente: **Closed Alpha controlada**.

INFONAVIT es el primer modulo conectado, pero no es el limite arquitectonico de
la plataforma.

Fase 1 queda como antecedente historico: implemento la base read-only inicial
para consumir el reporte extendido INFONAVIT via server-side Next.js.

La fuente de verdad vigente para el estado operativo actual es:

```text
docs/ESTADO_ACTUAL_CLOSED_ALPHA.md
```

El proyecto esta aprobado solo para entorno local/controlado o Closed Alpha
controlada. **No esta aprobado para exposicion publica.**

## Alcance actual

Implementado actualmente:

- INFONAVIT como primer modulo conectado.
- Next.js App Router con TypeScript.
- Auth.js con Google login.
- Allowlist server-side de maximo 5 usuarios invitados.
- Modelo server-side de capabilities.
- Gates server-side para reportes con `view_report`.
- DB health protegido para super admin con `admin_users`.
- Observabilidad alpha mediante logs estructurados.
- Recharts para visualizaciones ejecutivas.
- Analytics mensual INFONAVIT mediante ruta interna protegida.
- Reporte extendido JSON y Markdown via server-side Next.js.
- Selector de periodo: anio actual, anio previo y mes de corte.
- Descargas Markdown/JSON solo cliente/local-controladas.

No implementado actualmente:

- PDF.
- IA.
- Chatbot.
- Descargas server-side.
- Dashboard admin.
- Persistencia operacional de usuarios/permisos.
- Secret Manager productivo.
- Produccion publica.
- ETL.
- Migraciones.
- Acceso directo a Supabase desde frontend.
- Cambios al backend INFONAVIT.

Las descargas cliente no son un control de seguridad fuerte. Antes de cualquier
exposicion publica deben existir auth/capabilities productivas y rutas
server-side de descarga con gate real.

## Variables de entorno

Crear un `.env.local` local a partir de `.env.example`:

```text
INFONAVIT_API_BASE_URL=
INFONAVIT_API_KEY=
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
ALPHA_ALLOWED_EMAILS=
ALPHA_SUPER_ADMIN_EMAIL=
ALPHA_MAX_INVITED_USERS=5
```

Reglas:

- Ninguna variable secreta debe usar prefijo `NEXT_PUBLIC_`.
- `INFONAVIT_API_KEY` solo debe usarse server-side.
- `AUTH_SECRET` y `AUTH_GOOGLE_SECRET` solo deben usarse server-side.
- No guardar secretos en navegador, `localStorage`, `sessionStorage`, HTML
  renderizado ni data attributes.

## Rutas internas actuales

Rutas internas Next.js vigentes:

```text
/api/auth/[...nextauth]
/api/alpha/events
/api/infonavit/health
/api/infonavit/db-health
/api/infonavit/extended/json
/api/infonavit/extended/markdown
/api/infonavit/analytics/series
```

Resumen de proteccion:

- `/api/infonavit/health`: health basico sin detalles sensibles.
- `/api/infonavit/db-health`: requiere `admin_users`.
- `/api/infonavit/extended/json`: requiere `view_report`.
- `/api/infonavit/extended/markdown`: requiere `view_report`.
- `/api/infonavit/analytics/series`: requiere `view_report`.
- `/api/alpha/events`: requiere sesion para aceptar eventos cliente
  permitidos.

## Seguridad

Arquitectura permitida:

```text
Browser -> Next.js server-side -> Cloud Run FastAPI
```

Arquitectura prohibida:

```text
Browser -> Cloud Run FastAPI con X-API-Key
```

Controles vigentes:

- `X-API-Key` solo se envia desde server-side Next.js.
- No usar secretos con prefijo `NEXT_PUBLIC_`.
- Auth.js, Google login y allowlist son controles de Closed Alpha.
- Auth.js/login/allowlist no equivalen todavia a un modelo productivo
  definitivo de autenticacion, sesion, autorizacion y administracion de
  usuarios.
- La exposicion publica sigue bloqueada.

Bloqueantes principales para exposicion publica:

- Modelo productivo de autenticacion.
- Sesion productiva.
- Autorizacion/capabilities productivas.
- Persistencia operacional de usuarios y permisos.
- Secret Manager o equivalente.
- Descargas server-side protegidas.
- Validacion de seguridad en entorno desplegado.

## Ejecucion local

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

## Audit de dependencias

`npm audit` puede reportar deuda conocida asociada a dependencias transitivas
de Next.js.

No ejecutar:

```text
npm audit fix --force
```

sin analisis, porque puede proponer cambios incompatibles con el stack actual.

Ver:

```text
docs/nota_tecnica_audit_dependencias.md
```

## Documentos relevantes

- `docs/ESTADO_ACTUAL_CLOSED_ALPHA.md`
- `docs/matriz_controles_futuros.md`
- `docs/nota_tecnica_descargas_capabilities.md`
- `docs/closed_alpha_1_auth_allowlist.md`
- `docs/closed_alpha_2_view_report_gate.md`
- `docs/closed_alpha_3_observabilidad_minima.md`
- `docs/closed_alpha_auth_ux_hardening.md`
- `docs/fase_1_definicion_cerrada.md`
- `docs/fase_1_checklist_post_build.md`

