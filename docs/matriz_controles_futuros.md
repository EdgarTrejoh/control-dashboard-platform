# Matriz de controles futuros

## Contexto

`control-dashboard-platform` es una plataforma reusable de reporteria
economica, tableros analiticos y consumo seguro de APIs analiticas.

El estado vigente ya no es solo Fase 1 local/controlada. Fase 1 queda como
antecedente historico. El estado operativo actual es una Closed Alpha
controlada.

La fuente de verdad vigente es:

```text
docs/ESTADO_ACTUAL_CLOSED_ALPHA.md
```

Documentos complementarios relevantes:

```text
README.md
docs/closed_alpha_analytics_series_recharts.md
docs/closed_alpha_db_health_hardening.md
```

La Closed Alpha esta aprobada solo para entorno local/controlado o acceso
controlado por invitacion. El proyecto no esta aprobado para exposicion publica.

## Leyenda de estados

| Estado | Significado |
| ------ | ----------- |
| Implementado Closed Alpha | Existe en la Closed Alpha actual, con alcance controlado y no productivo. |
| Parcial | Existe una parte del control, pero falta cobertura productiva, persistencia, auditoria o aplicacion a todos los flujos. |
| Pendiente productivo | Debe resolverse antes de despliegue publico o uso operativo sostenido. |
| Bloqueante para exposicion publica | Sin este control no debe habilitarse exposicion publica. |
| Futuro funcional | Pertenece a una capacidad futura del producto; no esta implementado hoy. |

## Controles implementados en Closed Alpha

| Control | Estado actual | Notas |
| ------- | ------------- | ----- |
| Consumo API INFONAVIT server-side | Implementado Closed Alpha | El navegador consume rutas internas Next.js. |
| No exposicion de `X-API-Key` al navegador | Implementado Closed Alpha | `X-API-Key` solo viaja server-side. |
| Auth.js / Google login | Implementado Closed Alpha | Control alpha; no modelo productivo definitivo. |
| Allowlist server-side maximo 5 usuarios | Implementado Closed Alpha | Basado en variables de entorno alpha. |
| Sesion Auth.js/JWT alpha | Implementado Closed Alpha | Sesion alpha; no sesion productiva definitiva. |
| Modelo de capabilities | Implementado Closed Alpha | Capabilities base existentes. |
| Gate `view_report` para reportes extendidos | Implementado Closed Alpha | Protege JSON y Markdown extendidos. |
| Gate `view_report` para analytics mensual | Implementado Closed Alpha | Protege `/api/infonavit/analytics/series`. |
| Gate `admin_users` para DB health | Implementado Closed Alpha | DB health queda solo para super admin. |
| Observabilidad alpha con logs estructurados | Implementado Closed Alpha | Medicion minima; no auditoria persistente. |
| Analytics mensual INFONAVIT | Implementado Closed Alpha | Usa `series[]`, `bcg[]` y `metadata.warnings[]`. |
| Recharts como capa visual actual | Implementado Closed Alpha | Visualizaciones ejecutivas del modulo INFONAVIT. |
| CI con lint, typecheck, test y build | Implementado Closed Alpha | Validacion automatica base. |
| Headers minimos de seguridad | Implementado Closed Alpha | Incluye `nosniff`, referrer policy, frame deny, CSP minima y permissions policy. |
| `poweredByHeader: false` | Implementado Closed Alpha | Configuracion vigente. |
| Documentacion de descargas/capabilities | Implementado Closed Alpha | La limitacion de descargas cliente esta documentada. |

## Controles pendientes o parciales

Pendientes bloqueantes para exposicion publica:

- modelo productivo de autenticacion;
- sesion productiva;
- autorizacion/capabilities productivas;
- persistencia operacional de usuarios y permisos;
- rutas server-side de descarga Markdown/JSON;
- auditoria persistente de descargas;
- politica productiva de secretos;
- Secret Manager o equivalente;
- staging formal;
- validacion de seguridad en entorno desplegado;
- validacion manual de Network tab en entorno desplegado.

Pendientes recomendados antes de exposicion amplia:

- rate limiting;
- monitoreo de errores;
- CSP completa;
- HSTS para HTTPS productivo;
- revision vigente de `npm audit`;
- politica de actualizacion de dependencias;
- politica formal de despliegue;
- revision de CORS si aplica.

Futuro funcional:

- PDF;
- IA;
- chatbot;
- segundo modulo analitico;
- BigQuery como futuro analitico, no como fuente de permisos.

## Clasificacion por ambiente

### Local/controlado

Objetivo: desarrollo, validacion funcional y uso controlado de Closed Alpha.

Controles aceptados:

- variables privadas en `.env.local`;
- Auth.js/Google login para alpha;
- allowlist server-side;
- capabilities alpha;
- rutas internas protegidas para reportes;
- DB health protegido con `admin_users`;
- descargas Markdown/JSON solo cliente/local-controladas;
- observabilidad alpha con logs estructurados;
- validaciones locales y CI.

Riesgo aceptado:

- descargas con `data:` URI;
- JSON/Markdown puede vivir en el navegador despues de consulta autorizada;
- no hay persistencia operacional de usuarios/permisos;
- no hay Secret Manager productivo;
- no hay auditoria persistente.

### Staging controlado

Objetivo: validar comportamiento similar a produccion sin exposicion abierta.

Controles minimos antes de habilitar staging:

- politica productiva de secretos;
- Secret Manager o equivalente;
- configuracion de Auth.js/Google segura para entorno desplegado;
- validacion de allowlist;
- validacion de gates `view_report` y `admin_users`;
- validacion manual de Network tab;
- logging y monitoreo basico;
- politica clara de acceso;
- decision sobre descargas server-side si se habilitan descargas en staging.

### Produccion publica

Objetivo: exposicion controlada a usuarios autorizados.

Controles minimos obligatorios:

- modelo productivo de autenticacion;
- sesion productiva verificable server-side;
- autorizacion/capabilities productivas;
- persistencia operacional de usuarios y permisos;
- control real de descargas Markdown/JSON;
- auditoria persistente de descargas;
- politica productiva de secretos;
- Secret Manager o equivalente;
- HSTS sobre HTTPS estable;
- CSP completa validada;
- revision de CORS si aplica;
- logging, monitoreo y auditoria;
- revision de datos descargables;
- validacion de seguridad en entorno desplegado.

## Matriz de recomendaciones

| Control | Estado actual | Prioridad | Ambiente donde aplica | Fase recomendada | Bloquea exposicion publica | Riesgo si se omite | Accion recomendada |
| ------- | ------------- | --------- | --------------------- | ---------------- | -------------------------- | ------------------ | ------------------ |
| Auth.js / Google login | Implementado Closed Alpha | Alta | Local/controlado, staging controlado | Cerrado para alpha; productivo pendiente | Si, como modelo productivo | Confundir control alpha con auth productiva | Mantener en alpha y definir modelo productivo antes de exposicion publica. |
| Allowlist server-side maximo 5 | Implementado Closed Alpha | Alta | Local/controlado, staging controlado | Cerrado para alpha | Si, si no hay modelo productivo alterno | Acceso no gobernado fuera de alpha | Mantener allowlist; migrar a persistencia operacional antes de crecimiento. |
| Sesion alpha Auth.js/JWT | Implementado Closed Alpha | Alta | Local/controlado, staging controlado | Cerrado para alpha; productivo pendiente | Si, como sesion productiva | Sesion no gobernada para produccion | Definir politica de sesion productiva, expiracion, rotacion y despliegue. |
| Capabilities server-side | Parcial | Alta | Todos | Ampliar antes de exposicion publica | Si | Cobertura incompleta para descargas, PDF, IA o administracion | Mantener `view_report` y `admin_users`; extender a descargas server-side y modelo productivo. |
| Gate `view_report` para reportes extendidos | Implementado Closed Alpha | Alta | Local/controlado, staging controlado | Cerrado para alpha | Si, requiere validacion desplegada | Reportes expuestos si se desactiva o se omite en deploy | Validar en Network tab y pruebas de entorno desplegado. |
| Gate `view_report` para analytics mensual | Implementado Closed Alpha | Alta | Local/controlado, staging controlado | Cerrado para alpha | Si, requiere validacion desplegada | Datos analiticos expuestos sin autorizacion | Mantener protegido y validar en staging. |
| Gate `admin_users` para DB health | Implementado Closed Alpha | Alta | Local/controlado, staging controlado | Cerrado para alpha | Si | Informacion operativa visible para usuarios no admin | Mantener DB health solo admin; validar 401/403 en entorno desplegado. |
| Rutas server-side de descarga Markdown/JSON | Pendiente productivo | Alta | Staging, produccion | Antes de descargas publicas | Si, si hay descargas | Descargas cliente no controlan distribucion | Migrar descargas a rutas internas con auth y capability gate. |
| Auditoria persistente de descargas | Pendiente productivo | Alta | Staging, produccion | Antes de descargas publicas | Si, si hay descargas publicas | Sin trazabilidad de distribucion | Registrar usuario, capability, modulo, periodo, tipo de archivo y timestamp. |
| Observabilidad alpha con logs estructurados | Implementado Closed Alpha | Media | Local/controlado, staging controlado | Cerrado para alpha | No, pero debe evolucionar | Diagnostico limitado si crece el uso | Definir destino persistente y retencion antes de produccion. |
| Monitoreo de errores | Pendiente productivo | Media | Staging, produccion | Antes de produccion | No, recomendado | Fallas silenciosas | Integrar monitoreo compatible con privacidad. |
| Rate limiting | Pendiente productivo | Media | Staging, produccion | Antes de exposicion amplia | No inicialmente | Abuso de rutas internas y costos upstream | Implementar en hosting, middleware o gateway. |
| Revision vigente de `npm audit` | Parcial | Media | Local, CI, staging, produccion | Antes de produccion publica | No, salvo politica estricta | Vulnerabilidades transitivas sin seguimiento | Revisar periodicamente y no usar `npm audit fix --force` sin analisis. |
| Politica de actualizacion de dependencias | Pendiente productivo | Media | Todos | Antes de crecimiento de modulos | No | Drift tecnico y parches tardios | Definir cadencia de updates y validacion por CI. |
| HSTS para HTTPS productivo | Pendiente productivo | Alta en produccion | Produccion | En despliegue HTTPS estable | Si para produccion publica | Downgrade/misconfiguracion HTTPS | Agregar `Strict-Transport-Security` solo con HTTPS validado. |
| CSP completa | Pendiente productivo | Media | Staging, produccion | Despues de estabilizar UI, descargas y hosting | No inicialmente | XSS mitigado parcialmente | Expandir CSP con `default-src`, `script-src`, `style-src`, `connect-src` tras pruebas. |
| Politica productiva de secretos | Pendiente productivo | Alta | Staging, produccion | Antes de cualquier deploy publico | Si | Secretos mal gestionados o expuestos | Definir origen, rotacion, permisos y responsables. |
| Secret Manager o equivalente | Pendiente productivo | Alta | Staging, produccion | Antes de deploy publico | Si | Secretos en archivos, variables no gobernadas o CI | Usar GCP Secret Manager u opcion equivalente del hosting final. |
| Persistencia operacional de usuarios y permisos | Pendiente productivo | Alta | Staging, produccion | Antes de crecimiento de usuarios | Si | Allowlist por env no escala ni audita cambios | Definir base operacional para usuarios, roles, capabilities y preferencias. |
| Dashboard admin | Futuro funcional | Media | Produccion, administracion | Despues de persistencia operacional | No inicialmente | Administracion manual por variables de entorno | Crear solo cuando exista modelo operacional y permisos admin. |
| Analytics mensual INFONAVIT | Implementado Closed Alpha | Media | Local/controlado, staging controlado | Cerrado para alpha | No por si solo | Confundir visualizacion con dato inventado | Mantener regla de no inventar mensualidad y mostrar fallbacks. |
| Recharts como capa visual | Implementado Closed Alpha | Media | Local/controlado | Cerrado para alpha | No | Visualizaciones rotas o sin fallback | Mantener build/tests y fallbacks cuando falten datos. |
| Estrategia de staging | Pendiente productivo | Alta | Staging | Antes de primer deploy controlado | Si para validacion publica | Probar en entorno improvisado o inseguro | Definir URL, acceso, secretos, datos y politicas de uso. |
| Politica de despliegue | Pendiente productivo | Media | Staging, produccion | Antes de deploy | No, recomendado | Deploys manuales sin trazabilidad | Definir ramas, aprobaciones, CI, rollback y responsables. |
| Validacion manual de Network tab desplegada | Pendiente productivo | Alta | Staging, produccion | Cada deploy | Si para salida publica | Exposicion accidental de headers o secretos | Validar rutas internas, ausencia de `X-API-Key`, payloads esperados y CSP. |
| Revision CORS si aplica | Pendiente productivo | Media | Staging, produccion | Antes de integrar origenes externos | No | Origenes amplios o inconsistentes | Revisar si se exponen APIs a otros dominios; mantener rutas internas por defecto. |
| Revision de datos descargables | Pendiente productivo | Alta | Staging, produccion | Antes de descargas publicas | Si | Distribucion de datos sensibles o no autorizados | Clasificar contenido, permisos y retencion de archivos. |
| PDF | Futuro funcional | Alta cuando se active | Staging, produccion | Fase futura | No hoy; si para PDF publico | Descargas o generacion sin control | Implementar server-side con `download_pdf`, auditoria y limites. |
| IA | Futuro funcional | Alta cuando se active | Staging, produccion | Fase futura | No hoy; si para IA publica | Costos, fuga de datos o abuso | Definir politica IA, cuotas, auditoria y costos antes de implementar. |
| Chatbot | Futuro funcional | Media | Staging, produccion | Fase futura | No hoy | UX o datos sensibles sin controles IA | No iniciar hasta cerrar politica IA y auth productiva. |
| Segundo modulo analitico | Futuro funcional | Media | Staging, produccion | Fase futura | No hoy | Acoplamiento o secretos por modulo | Definir contrato modular, permisos por modulo y pruebas de seguridad. |
| BigQuery analitico | Futuro funcional | Media | Produccion, analitica | Fase futura | No hoy | Usarlo como fuente de permisos o almacenar datos excesivos | Usar solo para analitica historica/costos, no como fuente de verdad de permisos. |

## Controles bloqueantes para exposicion publica

La exposicion publica sigue bloqueada hasta implementar y validar:

1. Modelo productivo de autenticacion.
2. Sesion productiva verificable server-side.
3. Autorizacion/capabilities productivas.
4. Persistencia operacional de usuarios y permisos.
5. Control real de descargas Markdown/JSON.
6. Auditoria persistente de descargas, si las descargas se habilitan.
7. Politica productiva de secretos.
8. Secret Manager o equivalente.
9. Staging formal con configuracion controlada.
10. Validacion de seguridad en entorno desplegado.
11. Validacion manual de Network tab en entorno desplegado.
12. Revision de datos descargables.
13. Politica de acceso a reportes.

## Controles recomendados antes de PDF

Antes de implementar PDF se recomienda:

- modelo productivo de autenticacion;
- sesion productiva;
- capabilities productivas con `download_pdf`;
- generacion PDF server-side;
- control de descarga server-side;
- limites de tamano y tiempo de generacion;
- logging de generacion y descarga;
- auditoria persistente;
- monitoreo de errores;
- politica de retencion, si se almacenan archivos;
- validacion de datos incluidos en el PDF.

## Controles recomendados antes de IA

Antes de implementar IA se recomienda:

- modelo productivo de autenticacion;
- sesion productiva;
- capabilities productivas con `use_ai`;
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

| Deuda | Severidad | Estado | Accion recomendada | Bloquea Closed Alpha | Bloquea exposicion publica |
| ----- | --------- | ------ | ------------------ | -------------------- | -------------------------- |
| Auth productiva pendiente; existe Auth.js/Google para Closed Alpha | Alta | Pendiente productivo | Definir modelo productivo de autenticacion antes de exposicion publica. | No | Si |
| Sesion productiva pendiente; existe sesion alpha | Alta | Pendiente productivo | Definir politica de sesion productiva, expiracion, seguridad y despliegue. | No | Si |
| Capabilities productivas y de descargas pendientes; existen gates alpha para `view_report` y `admin_users` | Alta | Parcial | Extender capabilities a descargas server-side y modelo productivo. | No | Si |
| Descargas Markdown/JSON se generan con `data:` URI | Media | Aceptada local/controlada | Migrar a descargas server-side antes de exposicion publica. | No | Si |
| Auditoria persistente de descargas pendiente | Media | Pendiente productivo | Registrar eventos de descarga cuando existan rutas server-side. | No | Si, si hay descargas |
| Persistencia operacional de usuarios/permisos pendiente | Alta | Pendiente productivo | Definir base operacional y modelo administrativo. | No | Si |
| Secret Manager productivo pendiente | Alta | Pendiente productivo | Definir Secret Manager o equivalente antes de deploy publico. | No | Si |
| No hay HSTS productivo | Media | Pendiente productivo | Agregar solo con HTTPS estable. | No | Si para produccion publica |
| CSP no es completa | Media | Pendiente productivo | Ampliar despues de validar UI, descargas y hosting. | No | No inicialmente |
| Monitoreo de errores productivo pendiente | Media | Pendiente productivo | Definir monitoreo antes de produccion. | No | Recomendado |
| Revision vigente de `npm audit` pendiente para publico | Media | Parcial | Revisar antes de despliegue publico. | No | Recomendado |

## Orden sugerido de implementacion

1. Validar y cerrar baseline documental vigente.
2. Definir estrategia de staging controlado.
3. Definir politica productiva de secretos.
4. Implementar Secret Manager o equivalente.
5. Resolver persistencia operacional de usuarios y permisos.
6. Migrar descargas Markdown/JSON a rutas server-side.
7. Definir auditoria persistente de descargas y eventos sensibles.
8. Definir monitoreo de errores productivo.
9. Validar seguridad en entorno desplegado.
10. Ejecutar validacion manual de Network tab en entorno desplegado.
11. Revisar `npm audit` y politica de actualizacion de dependencias.
12. Agregar HSTS cuando exista HTTPS productivo estable.
13. Evaluar y ampliar CSP completa segun entorno.
14. Definir rate limiting antes de exposicion amplia.
15. Solo despues evaluar PDF, IA, chatbot o segundo modulo analitico.

## Decision final

La Closed Alpha controlada permanece aprobada para entorno local/controlado o
acceso estrictamente controlado por invitacion.

El proyecto no debe exponerse publicamente hasta cerrar los controles
productivos bloqueantes indicados en esta matriz.

La existencia de Auth.js, Google login, allowlist, sesion alpha, gates
server-side, observabilidad alpha, Recharts y analytics mensual no equivale a
produccion publica lista.
