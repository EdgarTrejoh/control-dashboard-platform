# Matriz de controles futuros

## Contexto

`control-dashboard-platform` es una plataforma reusable de reporteria economica y tableros analiticos.

Fase 1 esta cerrada para entorno local/controlado con el primer modulo conectado: INFONAVIT read-only.

El proyecto ya cuenta con:

- consumo server-side de la API INFONAVIT;
- `X-API-Key` limitada al servidor Next.js;
- rutas internas `/api/infonavit/*`;
- checklist post-build cerrado;
- pruebas reforzadas;
- CI en GitHub Actions;
- decision documentada sobre descargas Markdown/JSON y capabilities;
- headers minimos de seguridad implementados.

El proyecto no esta listo para produccion publica. No existe auth real, sesion real, capabilities server-side, descargas server-side, politica productiva de secretos ni validacion de seguridad sobre un entorno desplegado.

## Controles ya implementados

| Control | Estado |
| ------- | ------ |
| `poweredByHeader: false` | Implementado |
| `X-Content-Type-Options: nosniff` | Implementado |
| `Referrer-Policy: strict-origin-when-cross-origin` | Implementado |
| `X-Frame-Options: DENY` | Implementado |
| CSP minima: `frame-ancestors 'none'; object-src 'none'; base-uri 'self'` | Implementado |
| `Permissions-Policy` conservadora | Implementado |
| Consumo API server-side | Implementado |
| No exposicion de `X-API-Key` al navegador | Implementado y validado por pruebas estaticas |
| CI con lint, typecheck, test y build | Implementado |
| Documentacion de descargas/capabilities | Implementada |

## Controles pendientes

Pendientes bloqueantes para exposicion publica:

- auth real;
- sesion real;
- capabilities server-side;
- rutas server-side de descarga;
- politica de secretos productivos;
- Secret Manager o equivalente;
- validacion de seguridad en entorno desplegado.

Pendientes recomendados antes de evolucion funcional:

- logging/observabilidad;
- monitoreo de errores;
- rate limiting;
- CSP completa;
- HSTS para HTTPS productivo;
- politica de actualizacion de dependencias;
- revision periodica de `npm audit`;
- estrategia formal de staging;
- politica de despliegue.

## Clasificacion por ambiente

### Local/controlado

Objetivo: desarrollo y validacion funcional de Fase 1.

Controles requeridos:

- variables privadas en `.env.local`;
- no usar `NEXT_PUBLIC_INFONAVIT_API_KEY`;
- no exponer app publicamente;
- descargas Markdown/JSON permitidas solo local/controladas;
- validaciones locales y CI.

Riesgo aceptado:

- JSON/Markdown vive en el navegador;
- descargas con `data:` URI;
- sin auth real.

### Staging

Objetivo: validar comportamiento similar a produccion sin exposicion amplia.

Controles minimos antes de habilitar staging:

- auth real;
- sesion real;
- capabilities server-side;
- secretos en Secret Manager o equivalente;
- rutas server-side de descarga si se habilitan descargas;
- headers de seguridad activos;
- logging y monitoreo basico;
- validacion manual de Network tab;
- politica clara de acceso.

### Produccion publica

Objetivo: exposicion controlada a usuarios autorizados.

Controles minimos obligatorios:

- auth real;
- sesion server-side;
- capabilities server-side;
- control real de descargas;
- politica de secretos productivos;
- Secret Manager o equivalente;
- HSTS sobre HTTPS estable;
- revision de CORS si aplica;
- logging, monitoreo y auditoria;
- revision de datos descargables;
- validacion de seguridad en entorno desplegado.

## Matriz de recomendaciones

| Control | Estado actual | Prioridad | Ambiente donde aplica | Fase recomendada | Bloquea exposicion publica | Riesgo si se omite | Accion recomendada |
| ------- | ------------- | --------- | --------------------- | ---------------- | -------------------------- | ------------------ | ------------------ |
| Auth real | No implementado | Alta | Staging, produccion | Antes de staging publico | Si | Acceso no autorizado a reportes | Definir proveedor y flujo de autenticacion. |
| Sesion real | No implementada | Alta | Staging, produccion | Antes de staging publico | Si | No hay identidad verificable para permisos | Implementar sesion server-side compatible con Next.js. |
| Capabilities server-side | Placeholder documental/codigo base | Alta | Staging, produccion | Antes de exposicion publica | Si | Permisos solo UX, sin seguridad real | Evaluar capabilities en servidor para `view_report`, `download_markdown`, `download_json`, `use_ai`, `download_pdf`. |
| Rutas server-side de descarga | No implementadas | Alta | Staging, produccion | Antes de descargas publicas | Si | Descargas cliente no controlan distribucion | Migrar descargas Markdown/JSON a rutas server-side con auth y capability gate. |
| Auditoria de descargas | No implementada | Media | Staging, produccion | Antes de descargas publicas | Si, si hay descargas publicas | Sin trazabilidad de distribucion | Registrar usuario, capability, modulo, periodo, tipo de archivo y timestamp. |
| Rate limiting | No implementado | Media | Staging, produccion | Antes de produccion publica | No, salvo exposicion amplia | Abuso de rutas internas y costos upstream | Implementar en capa de hosting, middleware o gateway. |
| Revision de `npm audit` | Documentada, no bloqueante local | Media | Local, CI, staging, produccion | Antes de produccion publica | No, salvo politica estricta | Vulnerabilidades transitivas sin seguimiento | Revisar periodicamente y evitar `npm audit fix --force` sin analisis. |
| Politica de actualizacion de dependencias | No formalizada | Media | Todos | Antes de crecimiento de modulos | No | Drift tecnico y parches tardios | Definir cadencia de updates y validacion por CI. |
| HSTS para HTTPS productivo | No implementado | Alta en produccion | Produccion | En despliegue HTTPS estable | Si para produccion publica | Downgrade/misconfiguracion HTTPS | Agregar `Strict-Transport-Security` solo cuando HTTPS este validado. |
| CSP completa | No implementada | Media | Staging, produccion | Despues de estabilizar UI y descargas | No inicialmente | XSS mitigado parcialmente | Expandir CSP con `default-src`, `script-src`, `style-src`, `connect-src` tras pruebas. |
| Politica de secretos productivos | No formalizada | Alta | Staging, produccion | Antes de cualquier deploy | Si | Secretos mal gestionados o expuestos | Definir origen, rotacion, permisos y responsables. |
| Secret Manager o equivalente | No implementado | Alta | Staging, produccion | Antes de deploy publico | Si | Secretos en archivos, variables no gobernadas o CI | Usar GCP Secret Manager u opcion equivalente del hosting final. |
| Logging/observabilidad | Basico por plataforma local | Media | Staging, produccion | Antes de staging | No, pero recomendado | Dificil diagnosticar errores o abuso | Definir logs estructurados sin secretos. |
| Monitoreo de errores | No implementado | Media | Staging, produccion | Antes de produccion | No | Fallas silenciosas | Integrar monitoreo de errores compatible con privacidad. |
| Validacion manual de Network tab | Documentada | Alta | Local, staging, produccion | Cada cierre de fase y deploy | Si para salida publica | Exposicion accidental de headers o secretos | Validar rutas internas, ausencia de `X-API-Key`, payloads esperados y CSP. |
| Proteccion contra exposicion accidental de reportes | Parcial/documental | Alta | Staging, produccion | Antes de exposicion publica | Si | Reportes disponibles sin autorizacion | Agregar auth, `view_report` server-side y politicas de acceso. |
| Estrategia de staging | No formalizada | Media | Staging | Antes de primer deploy controlado | No, pero recomendado | Probar en entorno improvisado o inseguro | Definir URL, acceso, secretos, datos y politicas de uso. |
| Politica de despliegue | No formalizada | Media | Staging, produccion | Antes de deploy | No, pero recomendado | Deploys manuales sin trazabilidad | Definir ramas, aprobaciones, CI, rollback y responsables. |
| Revision CORS si aplica | No requerida actualmente | Media | Staging, produccion | Antes de integrar origenes externos | No | Origenes amplios o inconsistentes | Revisar si se exponen APIs a otros dominios; mantener rutas internas por defecto. |
| Revision de datos descargables | Documentada como pendiente | Alta | Staging, produccion | Antes de descargas publicas | Si | Distribucion de datos sensibles o no autorizados | Clasificar contenido, permisos y retencion de archivos. |
| Control de costos para IA futura | No implementado | Alta para IA | Staging, produccion | Antes de IA | No para Fase 1; si para IA | Costos no controlados por uso o abuso | Definir cuotas, rate limits, budgets y monitoreo por usuario/modulo. |
| Auditoria de uso de IA futura | No implementada | Alta para IA | Staging, produccion | Antes de IA publica | No para Fase 1; si para IA | Uso no trazable de prompts, respuestas o costos | Registrar uso, usuario, modulo, modelo, costo estimado y errores sin exponer datos sensibles. |

## Controles bloqueantes para exposicion publica

La exposicion publica sigue bloqueada hasta implementar y validar:

1. Auth real.
2. Sesion real verificable server-side.
3. Capabilities server-side.
4. Control real de descargas Markdown/JSON.
5. Politica de secretos productivos.
6. Secret Manager o equivalente.
7. Validacion de seguridad en entorno desplegado.
8. Revision de datos descargables.
9. Politica de acceso a reportes.

## Controles recomendados antes de PDF

Antes de implementar PDF se recomienda:

- auth real;
- capabilities server-side con `download_pdf`;
- generacion PDF server-side;
- control de descarga server-side;
- limites de tamano y tiempo de generacion;
- logging de generacion y descarga;
- monitoreo de errores;
- politica de retencion, si se almacenan archivos;
- validacion de datos incluidos en el PDF.

## Controles recomendados antes de IA

Antes de implementar IA se recomienda:

- auth real;
- capabilities server-side con `use_ai`;
- no llamar modelos desde navegador;
- politica de consumo IA;
- control de costos;
- auditoria de uso IA;
- proteccion de prompts y respuestas;
- rate limiting;
- monitoreo de errores;
- revision de datos enviados al proveedor IA;
- mecanismo de apagado o degradacion si hay abuso/costo excesivo.

## Controles recomendados antes de segundo modulo analitico

Antes de integrar un segundo modulo analitico se recomienda:

- contrato modular para clientes API;
- permisos por capability y modulo;
- convenciones de rutas internas;
- convenciones de errores normalizados;
- politica de secretos por modulo;
- pruebas de no exposicion de secretos por modulo;
- logging por modulo;
- revision de datos descargables por modulo;
- criterio de UI compartida vs especifica.

## Deuda tecnica

| Deuda | Severidad | Estado | Accion recomendada | Bloquea Fase 1 | Bloquea exposicion publica |
| ----- | --------- | ------ | ------------------ | -------------- | -------------------------- |
| No hay auth real | Alta | Pendiente | Definir e implementar proveedor de auth. | No | Si |
| No hay sesion real | Alta | Pendiente | Implementar sesion server-side. | No | Si |
| Capabilities no se evaluan server-side | Alta | Pendiente | Implementar capability gate real. | No | Si |
| Descargas Markdown/JSON se generan con `data:` URI | Media | Aceptada local/controlada | Migrar a descargas server-side. | No | Si |
| No hay auditoria de descargas | Media | Pendiente | Registrar eventos de descarga en fase publica. | No | Si, si hay descargas |
| No hay HSTS | Media | Pendiente productivo | Agregar solo con HTTPS estable. | No | Si para produccion publica |
| CSP no es completa | Media | Pendiente | Ampliar despues de validar UI, descargas y hosting. | No | No inicialmente |
| Politica de secretos productivos pendiente | Alta | Pendiente | Definir Secret Manager o equivalente. | No | Si |
| Monitoreo/observabilidad pendiente | Media | Pendiente | Definir logging y errores antes de staging. | No | Recomendado |
| Revision de `npm audit` pendiente para publico | Media | Documentada | Revisar antes de despliegue publico. | No | Recomendado |

## Orden sugerido de implementacion

1. Confirmar y commitear hardening minimo de headers.
2. Definir estrategia de staging sin exposicion amplia.
3. Definir proveedor de auth y modelo de sesion.
4. Implementar capabilities server-side.
5. Migrar descargas Markdown/JSON a rutas server-side.
6. Definir politica de secretos productivos y Secret Manager.
7. Agregar logging, monitoreo y auditoria minima.
8. Validar seguridad en entorno desplegado con Network tab.
9. Revisar `npm audit` y politica de actualizacion de dependencias.
10. Agregar HSTS cuando exista HTTPS productivo estable.
11. Evaluar CSP completa.
12. Avanzar a PDF, IA o segundo modulo solo despues de cerrar sus controles especificos.

## Decision final

Fase 1 permanece aprobada para entorno local/controlado.

El proyecto no debe exponerse publicamente hasta cerrar los controles bloqueantes indicados en esta matriz.

