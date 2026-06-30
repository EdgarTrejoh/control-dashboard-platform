# Estado Actual Closed Alpha

Fecha de baseline: 2026-06-30

Este documento es la fuente de verdad vigente para entender el estado actual de
`control-dashboard-platform` despues de Fase 1, Fase 2A.1, Closed Alpha 1,
Closed Alpha 2, Closed Alpha 3, hardening inicial y la integracion visual
analitica con Recharts.

Los documentos previos siguen siendo evidencia historica de decisiones,
criterios y validaciones, pero no deben leerse como el estado operativo vigente
si contradicen este baseline.

## 1. Estado actual del proyecto

`control-dashboard-platform` es una plataforma visual reusable para reporteria
economica, tableros analiticos y consumo seguro de APIs analiticas. INFONAVIT
es el primer modulo conectado, no el limite arquitectonico de la plataforma.

El estado actual corresponde a una Closed Alpha controlada:

- Aprobada solo para entorno local/controlado o Closed Alpha controlada.
- No aprobada para exposicion publica abierta.
- Acceso por Google login mediante Auth.js.
- Acceso limitado por allowlist server-side de maximo 5 usuarios invitados.
- Capacidades modeladas server-side.
- Endpoints principales de reporte protegidos server-side.
- Observabilidad alpha minima mediante logs estructurados.
- Visualizaciones ejecutivas con Recharts alimentadas por datos reales
  disponibles en endpoints internos.

Auth.js, Google login y allowlist son controles de Closed Alpha. No equivalen
todavia a un modelo productivo definitivo de autenticacion, sesion,
autorizacion y administracion de usuarios.

La aplicacion sigue siendo read-only respecto al backend INFONAVIT. No ejecuta
ETL, migraciones, escritura de datos ni acceso directo a Supabase.

## 2. Alcance implementado en Closed Alpha

### Acceso y sesion

- Google login con Auth.js.
- Allowlist server-side mediante `ALPHA_ALLOWED_EMAILS`.
- Maximo de usuarios invitados controlado por `ALPHA_MAX_INVITED_USERS`, con
  limite objetivo de 5.
- Super admin definido por `ALPHA_SUPER_ADMIN_EMAIL`.
- Validacion server-side de email invitado.
- Validacion de email verificado cuando Google entrega el dato.
- Seleccion de cuenta Google mediante `prompt=select_account`.
- Duracion corta de sesion alpha.
- Cierre de sesion y cierre por inactividad.

### Capabilities

Capabilities reconocidas por la plataforma:

- `view_report`
- `download_markdown`
- `download_json`
- `use_ai`
- `download_pdf`
- `admin_users`

Modelo alpha actual:

- `alpha_tester`: `view_report`, `download_markdown`, `download_json`,
  `download_pdf`, `use_ai`.
- `super_admin`: capabilities de `alpha_tester` mas `admin_users`.

`download_pdf` y `use_ai` existen solo como capabilities futuras. No implican
que PDF o IA esten implementados.

Antes de crear rutas reales de PDF o IA, estas capabilities deben reevaluarse
para evitar habilitacion automatica no revisada por el simple hecho de existir
en el perfil alpha actual.

### Modulo INFONAVIT

Implementado:

- Health basico de API.
- Health de DB protegido para super admin.
- Selector de periodo: anio actual, anio previo y mes de corte.
- Consumo server-side del reporte extendido JSON.
- Consumo server-side del reporte extendido Markdown.
- Consumo server-side de analytics mensual.
- Vista de resumen ejecutivo.
- Vista Markdown.
- Copiar Markdown.
- Descargas Markdown/JSON en contexto local/controlado.
- Pestana de analisis.
- Visualizaciones con Recharts.
- Fallbacks cuando el backend no entrega datos suficientes.
- Notas metodologicas cuando el backend entrega warnings.

### Visualizaciones actuales

La capa visual vigente usa Recharts y datos reales disponibles del backend
actual:

- Evolucion mensual del numero de creditos usando `series[]`.
- Evolucion mensual del monto usando `series[]`.
- Evolucion mensual del ticket promedio usando `series[]`.
- Matriz BCG usando `bcg[]`.
- Comparativo nominal vs real usando campos nominales y deflactados cuando
  estan disponibles.

No se inventan series mensuales. Si `series[]`, `bcg[]` o campos reales no
estan disponibles, la UI debe mostrar fallback claro.

## 3. Alcance no implementado

No esta implementado en el estado actual:

- PDF.
- IA.
- Chatbot.
- Descargas server-side.
- Dashboard admin.
- Roles editables por UI.
- Persistencia operacional de usuarios en base de datos.
- Tablas reales para usuarios, roles, capabilities, auditoria o preferencias.
- Migraciones.
- BigQuery.
- Secret Manager productivo.
- Despliegue publico.
- Produccion publica.
- Administracion de Supabase.
- Acceso directo a Supabase desde frontend.
- Cambios al backend INFONAVIT.

## 4. Rutas internas actuales

Rutas internas Next.js vigentes:

- `GET /api/auth/[...nextauth]`
- `POST /api/auth/[...nextauth]`
- `POST /api/alpha/events`
- `GET /api/infonavit/health`
- `GET /api/infonavit/db-health`
- `GET /api/infonavit/extended/json`
- `GET /api/infonavit/extended/markdown`
- `GET /api/infonavit/analytics/series`

Comportamiento esperado:

- `/api/infonavit/health` se mantiene como health basico sin detalles
  sensibles.
- `/api/infonavit/db-health` requiere sesion y capability `admin_users`.
- `/api/infonavit/extended/json` requiere sesion y capability `view_report`.
- `/api/infonavit/extended/markdown` requiere sesion y capability
  `view_report`.
- `/api/infonavit/analytics/series` requiere sesion y capability
  `view_report`.
- `/api/alpha/events` requiere sesion para aceptar eventos cliente permitidos.

Todas las llamadas hacia la API INFONAVIT protegida deben pasar por server-side
Next.js. El navegador no debe llamar directamente al backend protegido ni
recibir `X-API-Key`.

## 5. Variables de entorno actuales

Variables esperadas:

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
- `INFONAVIT_API_KEY` es server-side.
- `AUTH_GOOGLE_SECRET` es server-side.
- `AUTH_SECRET` es server-side.
- `ALPHA_ALLOWED_EMAILS` y `ALPHA_SUPER_ADMIN_EMAIL` deben tratarse como
  configuracion sensible operacional, aunque no sean secretos criptograficos.
- No se deben guardar secretos en navegador, `localStorage`, `sessionStorage`,
  HTML renderizado ni data attributes.

## 6. Controles de seguridad implementados

Controles vigentes:

- `X-API-Key` solo se envia desde server-side Next.js hacia la API INFONAVIT.
- No existe `NEXT_PUBLIC_INFONAVIT_API_KEY`.
- Auth.js con Google Provider.
- Allowlist server-side para Closed Alpha.
- Limite de invitados alpha maximo 5.
- `ALPHA_SUPER_ADMIN_EMAIL` debe pertenecer a la allowlist.
- Modelo server-side de `PlatformSession`.
- Modelo de capabilities.
- `requireCapability` para gates server-side.
- Errores normalizados `AUTH_REQUIRED` / 401 y `FORBIDDEN` / 403.
- Reportes extendidos protegidos con `view_report`.
- Analytics mensual protegido con `view_report`.
- DB health protegido con `admin_users`.
- Headers minimos de seguridad:
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `X-Frame-Options: DENY`
  - CSP minima con `frame-ancestors 'none'; object-src 'none'; base-uri 'self'`
  - `Permissions-Policy` conservadora
- `poweredByHeader: false`.
- Pruebas estaticas contra exposicion de secretos.

Controles intencionalmente no completos todavia:

- No hay CSP completa.
- No hay HSTS productivo.
- No hay Secret Manager productivo.
- No hay rate limiting formal.
- No hay auditoria persistente en base de datos.
- No hay control server-side real de descargas.

## 7. Observabilidad actual

La observabilidad alpha actual usa logs estructurados JSON mediante
`console.info`, pensados como base transitoria compatible con Cloud Logging
futuro.

Eventos modelados o previstos:

- `login_success`
- `login_denied_not_invited`
- `logout`
- `report_viewed`
- `report_period_changed`
- `capability_denied`
- `api_error`
- `markdown_copied`
- `markdown_downloaded`
- `json_downloaded`

`logout` puede estar modelado como evento permitido, pero no debe presentarse
como instrumentado si no existe emision real del evento en el flujo vigente.

Campos permitidos:

- `timestamp`
- `event_type`
- `user_email_hash`
- `module`
- `route`
- `action`
- `result`
- `capability`
- `error_code`
- `correlation_id`
- `current_year`
- `previous_year`
- `month_limit`

Datos que no deben registrarse:

- Email plano en logs.
- IP cruda.
- User-agent completo.
- Tokens OAuth.
- Refresh tokens.
- API keys.
- Secretos.
- Payloads completos de reportes.
- Prompts o respuestas IA futuras.
- Datos personales no necesarios.

La finalidad actual es medir activacion minima y salud de uso de la Closed
Alpha, no perfilar personas.

## 8. Riesgos y deuda pendiente

Riesgos y deuda vigentes:

- Descargas Markdown/JSON siguen siendo cliente/local-controladas.
- `download_markdown` y `download_json` todavia no tienen rutas server-side
  dedicadas con gate real.
- Si el reporte completo vive en el navegador, el usuario puede copiar o
  reconstruir el contenido aunque se oculten botones.
- No existe persistencia operacional para usuarios, roles, capabilities,
  auditoria o preferencias.
- Allowlist por variables de entorno es suficiente para alpha pequena, pero no
  para operacion sostenida.
- No existe dashboard admin.
- No hay Secret Manager productivo configurado.
- No hay staging/despliegue publico aprobado.
- La observabilidad actual depende de logs, no de una base analitica formal.
- La deuda de `npm audit` debe tratarse como deuda conocida; no ejecutar
  `npm audit fix --force` sin analisis.
- Persisten observaciones de calidad documental por encoding/mojibake en
  documentos historicos.
- La matriz de controles futuros requiere rebaseline despues de los avances de
  Closed Alpha.

## 9. Bloqueantes para exposicion publica

La exposicion publica sigue bloqueada hasta resolver como minimo:

- Politica productiva de secretos.
- Secret Manager o equivalente para secretos productivos.
- Modelo productivo de autenticacion.
- Sesion productiva.
- Autorizacion/capabilities productivas.
- Administracion y persistencia operacional de usuarios y permisos.
- Entorno de staging/despliegue controlado validado.
- Validacion de seguridad en entorno desplegado.
- Control server-side real para descargas Markdown/JSON.
- Decision de persistencia operacional para usuarios y permisos.
- Retencion y destino formal de auditoria/observabilidad.
- Revision de CORS si aplica al entorno final.
- Revision completa de headers productivos, incluyendo HSTS para HTTPS.
- Validacion manual de Network tab en entorno desplegado.
- Confirmacion de que no hay secretos en cliente.
- Confirmacion de que no hay llamadas browser -> backend protegido.

La Closed Alpha controlada no equivale a aprobacion para produccion publica.

## 10. Relacion con documentos historicos

Los documentos existentes mantienen valor como evidencia historica:

- `docs/FRONTEND_STRATEGY.md`: estrategia inicial.
- `docs/fase_0_decisiones_arranque.md`: decisiones de arranque.
- `docs/fase_1_definicion_cerrada.md`: definicion cerrada de Fase 1.
- `docs/fase_1_checklist_post_build.md`: evidencia historica post-build de
  Fase 1.
- `docs/fase_2a_1_auth_capabilities.md`: modelo inicial server-side de sesion
  y capabilities.
- `docs/fase_2a_1b_modelo_datos_identidad_auditoria.md`: modelo conceptual de
  datos futuro.
- `docs/closed_alpha_1_auth_allowlist.md`: implementacion de Auth.js,
  Google login y allowlist.
- `docs/closed_alpha_2_view_report_gate.md`: proteccion inicial de reportes
  extendidos con `view_report`.
- `docs/closed_alpha_3_observabilidad_minima.md`: observabilidad alpha minima.
- `docs/closed_alpha_auth_ux_hardening.md`: ajustes de UX/Auth para alpha.
- `docs/nota_tecnica_descargas_capabilities.md`: decision de descargas
  cliente/local-controladas y necesidad futura de descargas server-side.
- `docs/matriz_controles_futuros.md`: controles futuros y deuda de seguridad.
- `docs/nota_tecnica_audit_dependencias.md`: deuda conocida de dependencias.
- `docs/nota_tecnica_next_swc_windows.md`: decision tecnica sobre SWC/Node.

Cuando un documento historico indique que auth, gates, observabilidad o
visualizaciones son futuras, debe interpretarse en el contexto de la fecha de
ese documento. Para el estado vigente, este archivo prevalece.

## 11. Decision final de vigencia

Decision:

- Este documento queda como baseline documental vigente de la Closed Alpha.
- La aplicacion esta aprobada solo para entorno local/controlado o Closed Alpha
  controlada.
- La aplicacion no esta aprobada para exposicion publica.
- Los documentos historicos son evidencia, no fuente de verdad vigente cuando
  contradigan este baseline.
- Cualquier avance hacia exposicion publica, PDF, IA, descargas server-side,
  dashboard admin, persistencia operacional o Secret Manager productivo requiere
  una fase nueva aprobada explicitamente.
