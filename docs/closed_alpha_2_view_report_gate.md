# Closed Alpha 2 - Gate server-side `view_report`

## Contexto

Closed Alpha 2 protege server-side los endpoints de reporte INFONAVIT con `requireCapability(..., "view_report")`.

Esta fase depende del modelo de sesion/capabilities de Fase 2A.1 y de la integracion Auth.js/allowlist de Closed Alpha 1.

## Endpoints protegidos

```text
GET /api/infonavit/extended/json
GET /api/infonavit/extended/markdown
```

Ambos endpoints validan sesion server-side antes de validar parametros o llamar al backend INFONAVIT.

## Modelo de error

Sin sesion valida:

```text
AUTH_REQUIRED
401
```

Sesion sin `view_report`:

```text
FORBIDDEN
403
```

Las respuestas se serializan con el normalizador existente y no incluyen stack traces, headers internos ni secretos.

## Alcance

Incluye:

- gate server-side `view_report`;
- rechazo 401 sin sesion;
- rechazo 403 sin capability;
- pruebas de 401, 403 y flujo permitido;
- health endpoints sin cambios.

No incluye:

- observabilidad real;
- PDF;
- IA;
- descargas server-side;
- dashboard admin;
- roles editables por UI;
- tablas reales;
- migraciones;
- cambios al backend INFONAVIT;
- cambios a Supabase;
- deploy.

## Health checks

Se mantienen sin cambios en esta fase:

```text
GET /api/infonavit/health
GET /api/infonavit/db-health
```

La decision de proteger o separar health basico vs DB health queda para una fase posterior de staging/deploy controlado.

## Riesgos residuales

- No hay observabilidad minima real todavia.
- Las descargas Markdown/JSON siguen siendo cliente/local-controladas.
- No existen rutas server-side de descarga.
- No hay dashboard admin ni gestion persistente de usuarios.
- No hay control de usuarios activos concurrentes; el limite actual es maximo 5 emails invitados.

## Siguiente paso recomendado

Closed Alpha 3 debe implementar observabilidad minima:

- login exitoso;
- login denegado;
- reporte visto;
- capability denegada;
- error mostrado;
- logout.

