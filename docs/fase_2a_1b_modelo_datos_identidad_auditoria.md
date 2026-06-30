# Fase 2A.1B - Modelo de datos de identidad, auditoria y uso

> **Nota de vigencia documental**
>
> Este documento se conserva como evidencia historica de la fase o decision que describe.
> El estado operativo vigente del proyecto se documenta en
> `docs/ESTADO_ACTUAL_CLOSED_ALPHA.md`.
> Si existe diferencia entre este documento y el baseline vigente, prevalece el baseline.

## Resumen ejecutivo

Fase 2A.1B define el modelo conceptual de almacenamiento para identidad, usuarios, roles, capabilities, auditoria de seguridad, metricas de uso, preferencias y secretos de `control-dashboard-platform`.

Esta fase es documental. No crea tablas reales, no crea migraciones, no implementa proveedor auth, no implementa Google login, no implementa Auth.js y no habilita exposicion publica.

La decision principal es separar responsabilidades:

- el proveedor auth autentica usuarios;
- la aplicacion decide capabilities internas;
- PostgreSQL operacional almacena usuarios, roles, capabilities y preferencias;
- BigQuery se usa para analitica historica y reporting, no para autorizacion;
- Cloud Logging se usa para observabilidad y eventos de corto plazo;
- Secret Manager almacena secretos;
- los datos analiticos/reportes siguen detras de APIs autorizadas.

## Decision recomendada de almacenamiento

La recomendacion productiva es usar Cloud SQL PostgreSQL como base operacional para:

- usuarios;
- roles;
- capabilities;
- asignaciones usuario/rol;
- asignaciones rol/capability;
- overrides usuario/capability;
- preferencias de usuario;
- metadatos operacionales de autorizacion.

Supabase Postgres puede ser alternativa tactica solo si se accede server-side y sin acceso directo desde navegador.

BigQuery no debe ser fuente de verdad para permisos. Puede usarse para analitica historica, eventos de uso, costos futuros de IA y reporting.

Secret Manager debe usarse para secretos, API keys, OAuth client secrets y credenciales.

Cloud Logging debe usarse para observabilidad, eventos tecnicos y seguridad de corto plazo.

El proveedor auth debe autenticar, pero la app debe decidir capabilities internas.

## Matriz comparativa de opciones

| Opcion | Complejidad | Costo operativo | Compatibilidad Next.js | Compatibilidad Cloud Run/GCP | Seguridad | Decision |
| ------ | ----------- | --------------- | ---------------------- | ---------------------------- | --------- | -------- |
| Cloud SQL PostgreSQL | Media | Medio | Alta desde server-side | Muy alta | Alta con IAM y Secret Manager | Objetivo productivo recomendado |
| Supabase Postgres server-side | Baja/media | Bajo/medio | Alta desde server-side | Media | Buena si no hay acceso browser | Alternativa tactica |
| Firestore | Media | Medio | Alta | Alta | Buena | No preferida para RBAC relacional |
| Archivo/config temporal local | Baja | Bajo | Alta | No productivo | Baja | Solo desarrollo/controlado |
| BigQuery como permisos | Alta/inadecuada | Variable | Baja para runtime auth | Alta para analytics | Riesgosa para autorizacion | No recomendado |

## Arquitectura de almacenamiento propuesta

```text
Proveedor Auth
  -> autenticacion, identidad externa, email verificado, MFA si aplica

PostgreSQL operacional
  -> users, roles, capabilities, user_roles, role_capabilities,
     user_capabilities, user_preferences

Cloud Logging
  -> eventos tecnicos, seguridad de corto plazo, errores, correlation ids

BigQuery
  -> analitica historica, eventos agregados, reporting, costos IA futuros

Secret Manager
  -> API keys, OAuth client secrets, credenciales, secretos de integraciones

Backends analiticos
  -> reportes y datos economicos detras de APIs autorizadas
```

## Modelo conceptual de datos

### users

Fuente operacional para usuarios internos de la plataforma.

| Campo | Descripcion |
| ----- | ----------- |
| `id` | Identificador interno estable |
| `auth_provider` | Proveedor externo: google, authjs, auth0, clerk, etc. |
| `auth_subject` | Subject/ID externo del proveedor |
| `email` | Email normalizado, si aplica |
| `display_name` | Nombre visible |
| `status` | `active`, `disabled`, `pending` |
| `is_super_user` | Bandera excepcional, auditable |
| `created_at` | Fecha de alta |
| `updated_at` | Ultima modificacion |
| `last_login_at` | Ultimo login exitoso |

### roles

Agrupadores administrativos de capabilities.

| Campo | Descripcion |
| ----- | ----------- |
| `id` | Identificador del rol |
| `key` | Clave estable: `admin`, `analyst`, `viewer` |
| `name` | Nombre visible |
| `description` | Descripcion |
| `is_system` | Rol protegido del sistema |
| `created_at` | Fecha de alta |
| `updated_at` | Ultima modificacion |

### capabilities

Permisos atomicos evaluados por la aplicacion.

| Campo | Descripcion |
| ----- | ----------- |
| `id` | Identificador |
| `key` | `view_report`, `download_json`, etc. |
| `description` | Descripcion |
| `scope` | `platform`, `module`, `future` |
| `is_sensitive` | Marca permisos criticos |
| `created_at` | Fecha de alta |

Capabilities base:

```text
view_report
download_markdown
download_json
download_pdf
use_ai
admin_users
```

### user_roles

Asignacion de roles a usuarios.

| Campo | Descripcion |
| ----- | ----------- |
| `user_id` | Usuario |
| `role_id` | Rol |
| `assigned_by` | Usuario/sistema que asigno |
| `assigned_at` | Fecha de asignacion |
| `expires_at` | Expiracion opcional |

### role_capabilities

Asignacion de capabilities a roles.

| Campo | Descripcion |
| ----- | ----------- |
| `role_id` | Rol |
| `capability_id` | Capability |
| `created_at` | Fecha de alta |

### user_capabilities

Overrides directos por usuario. Deben usarse con moderacion.

| Campo | Descripcion |
| ----- | ----------- |
| `user_id` | Usuario |
| `capability_id` | Capability |
| `effect` | `allow` o `deny` |
| `reason` | Justificacion |
| `assigned_by` | Usuario/sistema que asigno |
| `assigned_at` | Fecha de asignacion |
| `expires_at` | Expiracion opcional |

### auth_audit_events

Eventos minimos de auditoria de autenticacion y autorizacion.

| Evento | Datos minimos |
| ------ | ------------- |
| Login exitoso | `user_id`, `provider`, `timestamp`, `correlation_id` |
| Login fallido | `provider`, `reason_code`, `timestamp`, `correlation_id` |
| Usuario no autorizado | `email_hash` opcional, `reason_code`, `timestamp` |
| Sesion expirada | `user_id`, `timestamp`, `correlation_id` |
| Capability denegada | `user_id`, `capability`, `route`, `module`, `timestamp` |
| Logout | `user_id`, `timestamp`, `correlation_id` |
| Error de proveedor auth | `provider`, `reason_code`, `correlation_id`, `timestamp` |

La IP cruda no debe guardarse por defecto. Si se requiere, debe existir justificacion, retencion corta y preferentemente hashing o truncamiento.

### usage_events

Eventos minimos de uso de producto.

| Evento | Datos minimos |
| ------ | ------------- |
| Reporte visto | `user_id`, `module`, `report_type`, `period`, `timestamp` |
| Markdown copiado | `user_id`, `module`, `period`, `timestamp` |
| JSON descargado | `user_id`, `module`, `period`, `timestamp` |
| Markdown descargado | `user_id`, `module`, `period`, `timestamp` |
| Filtros cambiados | `user_id`, `module`, `filter_keys`, `timestamp` |
| Error mostrado | `user_id` opcional, `error_code`, `module`, `timestamp` |
| Futura ejecucion IA | `user_id`, `module`, `model`, `cost_estimate`, `timestamp` |
| Futura descarga PDF | `user_id`, `module`, `period`, `timestamp` |

No se deben guardar payloads completos de reportes en eventos de uso.

### user_preferences

Preferencias de usuario separadas por origen.

| Campo | Descripcion |
| ----- | ----------- |
| `user_id` | Usuario |
| `preference_key` | Clave: tema, modulo default, periodo default, etc. |
| `preference_value` | Valor JSON controlado |
| `source` | `user`, `admin`, `inferred` |
| `updated_at` | Ultima modificacion |
| `expires_at` | Expiracion opcional |

Tipos:

- preferencias declaradas por el usuario;
- preferencias asignadas por admin;
- inferencias automaticas de comportamiento.

Las inferencias automaticas deben tratarse como sensibles y no deben implementarse sin politica de privacidad clara.

## Que vive en proveedor auth

Debe vivir en el proveedor auth:

- autenticacion;
- identidad externa;
- email verificado;
- subject/issuer;
- MFA si aplica;
- ciclo basico de cuenta externa;
- tokens temporales manejados por el proveedor.

No debe delegarse exclusivamente al proveedor auth la logica interna de capabilities complejas. La aplicacion debe mapear identidad externa a usuario interno y decidir capabilities.

## Que vive en PostgreSQL operacional

Debe vivir en PostgreSQL operacional:

- usuarios internos;
- mapping `auth_provider` + `auth_subject`;
- estado de usuario;
- roles;
- capabilities;
- asignaciones usuario/rol;
- asignaciones rol/capability;
- overrides usuario/capability;
- preferencias;
- metadatos operacionales de autorizacion.

Esta base es la fuente de verdad recomendada para permisos.

## Que vive en BigQuery

Debe vivir en BigQuery:

- metricas historicas de uso;
- eventos agregados;
- auditoria consultable de largo plazo;
- reporting de comportamiento de modulos;
- costos futuros de IA;
- tendencias de reportes consultados.

No debe vivir en BigQuery como fuente runtime:

- permisos;
- sesion;
- secretos;
- tokens;
- decisiones inmediatas de acceso.

## Que vive en Cloud Logging

Debe vivir en Cloud Logging:

- errores controlados;
- intentos de acceso denegado;
- fallos de proveedor auth;
- eventos tecnicos con correlation id;
- warnings de seguridad;
- trazas operativas sin secretos.

Cloud Logging es para observabilidad y respuesta a incidentes, no para ser base operacional de permisos.

## Que vive en Secret Manager

Debe vivir en Secret Manager:

- `INFONAVIT_API_KEY`;
- OAuth client secrets;
- credenciales de conexion;
- API keys de futuros motores analiticos;
- secretos IA futuros;
- claves de firma si aplica.

No deben vivir en base de datos operacional, BigQuery, repositorio, README, `.env.example` con valores reales ni variables `NEXT_PUBLIC_*`.

## Que NO se debe guardar por ahora

No guardar:

- passwords propios;
- tokens OAuth completos si no son necesarios;
- refresh tokens sin necesidad explicita;
- API keys;
- secretos;
- `DATABASE_URL` en cliente;
- IP cruda sin justificacion;
- user-agent completo por defecto si no aporta;
- intereses inferidos invasivos;
- datos personales no necesarios;
- payloads completos de reportes en auditoria;
- prompts/respuestas IA futuras sin politica clara.

## Consideraciones de privacidad

Principios:

- minimizacion: guardar solo lo necesario;
- proposito: cada dato debe tener un uso definido;
- retencion: separar eventos de corto plazo, auditoria y analitica historica;
- trazabilidad: registrar quien asigna permisos y cuando;
- acceso administrativo: auditar cambios de roles/capabilities;
- separacion: operacional en PostgreSQL, analitica en BigQuery, secretos en Secret Manager;
- pseudonimizacion: usar hashes o agregados cuando sea viable;
- inferencias: no inferir intereses sensibles sin politica clara y aprobacion.

## Riesgos

| Riesgo | Impacto | Mitigacion |
| ------ | ------- | ---------- |
| Usar BigQuery como fuente de permisos | Alto | Mantener permisos en PostgreSQL operacional |
| Guardar secretos en base operacional | Alto | Secret Manager obligatorio |
| Mezclar permisos, auditoria y analytics | Medio/alto | Separar almacenes por proposito |
| Implementar inferencias de intereses sin politica | Alto | Diferir inferencias automaticas |
| Crear super users sin auditoria | Alto | Auditar cambios y justificar `is_super_user` |
| Depender solo de claims del proveedor auth | Medio | Mantener mapping interno y capabilities propias |
| Retener eventos indefinidamente | Medio | Definir politica de retencion |
| Guardar payloads completos de reportes | Alto | Registrar metadatos, no contenido completo |

## Criterios de aceptacion

Fase 2A.1B queda aceptada si:

- documenta la decision de almacenamiento;
- declara Cloud SQL PostgreSQL como objetivo productivo recomendado;
- permite Supabase Postgres solo como alternativa tactica server-side;
- declara que BigQuery no es fuente de verdad para permisos;
- separa proveedor auth, base operacional, BigQuery, Cloud Logging y Secret Manager;
- define modelo conceptual de tablas;
- define eventos minimos de auditoria;
- define eventos minimos de uso;
- lista datos que no deben guardarse;
- incluye consideraciones de privacidad;
- mantiene bloqueada la exposicion publica.

## Decision pendiente antes de Fase 2A.2

Si `getCurrentSessionPlaceholder()` sigue devolviendo `null`, proteger endpoints reales con `requireCapability(..., "view_report")` provocaria `401`.

Antes de aplicar gates a endpoints reales se debe decidir:

- opcion A: usar adaptador local/controlado para desarrollo y pruebas no publicas;
- opcion B: cerrar primero proveedor auth real, probablemente Google/Auth.js o Google Identity.

La opcion A permite validar el patron de gates sin exposicion publica. La opcion B reduce retrabajo si el siguiente objetivo es staging con usuarios reales.

## Fases futuras recomendadas

1. 2A.1B: documentacion de modelo de datos.
2. 2A.2: gate server-side para `view_report`.
3. 2A.3: decision proveedor auth.
4. 2A.4: login Google/Auth.js o proveedor elegido.
5. 2A.5: auditoria y metricas reales.
6. 2A.6: descargas server-side.

## Decision final

Esta fase no habilita produccion publica.

La exposicion publica sigue bloqueada hasta contar con auth real, sesion productiva, capabilities server-side, control real de descargas, politica de secretos y validacion de seguridad en entorno desplegado.

