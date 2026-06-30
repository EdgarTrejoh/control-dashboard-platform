# Closed Alpha - Analytics mensual INFONAVIT y Recharts

## Contexto

La Closed Alpha vigente de `control-dashboard-platform` ya incluye
visualizacion analitica mensual para el modulo INFONAVIT.

INFONAVIT es el primer modulo conectado de la plataforma, no el limite
arquitectonico del proyecto. La capa visual actual usa Recharts como libreria
principal para graficas ejecutivas.

La fuente de verdad vigente del estado operativo del proyecto es:

```text
docs/ESTADO_ACTUAL_CLOSED_ALPHA.md
```

## Ruta interna Next.js

La ruta interna vigente para analytics mensual es:

```text
GET /api/infonavit/analytics/series
```

Esta ruta pertenece al frontend Next.js y funciona como proxy server-side hacia
el backend INFONAVIT protegido.

## Endpoint upstream esperado

El endpoint upstream esperado en la API INFONAVIT es:

```text
/mini-report/analytics/series/json
```

La ruta interna reenvia los parametros de periodo requeridos por el modulo:

```text
current_year
previous_year
month_limit
```

## Seguridad

La ruta interna `GET /api/infonavit/analytics/series`:

- requiere sesion;
- requiere capability `view_report`;
- no debe aceptar acceso anonimo;
- no debe exponer secretos al navegador;
- no debe permitir que el navegador llame directo al backend protegido.

Arquitectura permitida:

```text
Browser -> Next.js server-side -> API INFONAVIT protegida
```

Arquitectura prohibida:

```text
Browser -> API INFONAVIT protegida con X-API-Key
```

`X-API-Key` solo viaja server-side desde Next.js hacia la API INFONAVIT.

## Contrato esperado

El contrato esperado para la respuesta de analytics mensual incluye:

- `series[]`
- `bcg[]`
- `metadata.warnings[]`

`series[]` alimenta las visualizaciones mensuales. `bcg[]` alimenta la matriz
tipo BCG. `metadata.warnings[]` conserva advertencias metodologicas del backend.

## Uso visual

La capa visual con Recharts puede usar estos datos para:

- evolucion mensual del numero de creditos;
- evolucion mensual del monto;
- evolucion mensual del ticket promedio;
- matriz BCG;
- comparativo nominal vs real cuando existan campos disponibles.

La UI debe mantener estados claros si alguna serie, punto BCG o campo real no
esta disponible.

## Regla critica

No se debe inventar mensualidad.

Si el backend no entrega `series[]`, `bcg[]` o campos reales suficientes, la UI
debe mostrar fallback claro en lugar de construir datos ficticios.

Cuando existan `metadata.warnings[]`, deben mostrarse o preservarse como notas
metodologicas no alarmistas.

## Fuera de alcance

Esta decision no incluye:

- IA;
- PDF;
- chatbot;
- nuevos endpoints backend;
- ETL;
- migraciones;
- persistencia nueva;
- acceso directo a Supabase;
- BigQuery;
- produccion publica.

## Decision vigente

La integracion mensual INFONAVIT analytics/series + Recharts forma parte del
estado actual de Closed Alpha controlada. No habilita exposicion publica ni
cambia el caracter read-only del frontend.
