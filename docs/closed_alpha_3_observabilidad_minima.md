# Closed Alpha 3 - Observabilidad minima

## Finalidad

Closed Alpha 3 agrega observabilidad minima server-side para entender si la alpha funciona, detectar errores y verificar controles de acceso.

Principio rector:

```text
Medir uso del sistema, no perfilar personas.
```

Esta fase no implementa analitica avanzada, BigQuery, dashboard admin, IA, PDF, descargas server-side, tablas reales ni migraciones.

## Mecanismo

La observabilidad inicial usa logs estructurados JSON mediante `console.info`.

Este mecanismo es compatible con una migracion posterior hacia Cloud Logging, BigQuery o una capa dedicada de auditoria.

## Eventos instrumentados

Eventos instrumentados server-side:

| Evento | Punto de emision | Proposito |
| ------ | ---------------- | --------- |
| `login_success` | Callback Auth.js `signIn` | Confirmar acceso permitido a usuario invitado |
| `login_denied_not_invited` | Callback Auth.js `signIn` | Detectar intentos de usuarios no invitados o configuracion invalida |
| `capability_denied` | Gate `view_report` de endpoints INFONAVIT | Verificar denegaciones 401/403 |
| `report_viewed` | Endpoint de reporte autorizado | Medir consulta exitosa de reporte |
| `report_period_changed` | Endpoint interno `/api/alpha/events` | Medir cambio de periodo/filtro sin guardar payload |
| `api_error` | Endpoint de reporte con error controlado | Medir errores controlados de API |
| `markdown_copied` | Endpoint interno `/api/alpha/events` | Medir uso de salida Markdown |
| `markdown_downloaded` | Endpoint interno `/api/alpha/events` | Medir descarga Markdown local/controlada |
| `json_downloaded` | Endpoint interno `/api/alpha/events` | Medir descarga JSON local/controlada |

Eventos permitidos pero no instrumentados todavia:

| Evento | Motivo |
| ------ | ------ |
| `logout` | Requiere hook/capa dedicada posterior |

Los eventos originados en cliente se registran por una ruta server-side autenticada. El cliente no envia email, IP, user-agent ni payloads de reporte.

## Alpha Usage Score

El Alpha Usage Score mide activacion minima:

| Score | Condicion |
| ----- | --------- |
| 0 | Invitado, sin uso |
| 1 | `login_success` |
| 2 | `report_viewed` |
| 3 | `report_period_changed` o consulta adicional |
| 4 | `markdown_copied`, `markdown_downloaded` o `json_downloaded` |
| 5 | Feedback enviado |

Usuario activado:

```text
score >= 3
```

Usuario util para feedback:

```text
score >= 4
```

Para calcularlo manualmente con maximo 4 invitados externos:

1. Agrupar logs por `user_email_hash`.
2. Ordenar eventos por `timestamp`.
3. Asignar el score maximo alcanzado por cada usuario.
4. Contar usuarios con score `>= 3`.
5. Contar usuarios con score `>= 4`.

El score 5 queda reservado para una fase posterior con mecanismo de feedback.

## Campos permitidos

Los eventos solo deben contener:

- `timestamp`;
- `event_type`;
- `user_email_hash`;
- `module`;
- `route`;
- `action`;
- `result`;
- `capability`;
- `error_code`;
- `correlation_id`;
- `current_year`;
- `previous_year`;
- `month_limit`.

## Datos que no se recolectan

No se recolectan:

- IP cruda;
- user-agent completo;
- telefono;
- ubicacion;
- edad;
- puesto;
- empresa;
- ingresos;
- intereses personales inferidos;
- payloads completos de reportes;
- tokens OAuth;
- refresh tokens;
- API keys;
- secretos;
- prompts o respuestas IA futuras.

## Hash de email

Cuando se requiere identificar un intento de login sin guardar email plano en logs, se usa hash SHA-256 del email normalizado.

El email se normaliza con:

- trim;
- lowercase.

## Retencion sugerida

Para alpha cerrada:

- logs tecnicos y seguridad: 30 a 90 dias;
- eventos agregados futuros: definir antes de BigQuery;
- eventos con identificador de usuario: retencion minima necesaria.

## Limitaciones

- No hay dashboard de observabilidad.
- No hay BigQuery.
- No hay auditoria persistente operacional.
- No se guarda IP cruda ni user-agent completo.
- No hay trazabilidad de logout todavia.
- No hay mecanismo de feedback para score 5 todavia.

## Requisitos para avanzar

Antes de invitar usuarios reales se recomienda validar manualmente:

- login con usuario invitado;
- rechazo de usuario no invitado;
- acceso a reporte por usuario invitado;
- rechazo directo a endpoint sin sesion;
- ausencia de secretos en Network tab;
- eventos JSON visibles en logs locales o entorno de ejecucion.

## Siguiente paso recomendado

Closed Alpha 4 debe preparar staging/deploy controlado con:

- Secret Manager o equivalente;
- variables privadas reales;
- validacion manual de Network tab;
- revision de logs;
- politica de acceso para maximo 5 usuarios invitados.
