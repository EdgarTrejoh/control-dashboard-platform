# Closed Alpha - Hardening de DB health

## Contexto

`/api/infonavit/health` y `/api/infonavit/db-health` no tienen el mismo nivel
de sensibilidad.

El health basico puede mantenerse reducido para validar disponibilidad general.
El DB health puede revelar estado operativo mas sensible y no debe estar
disponible para cualquier usuario alpha.

La fuente de verdad vigente del estado operativo del proyecto es:

```text
docs/ESTADO_ACTUAL_CLOSED_ALPHA.md
```

## Decision vigente

`/api/infonavit/db-health` requiere:

- sesion;
- capability `admin_users`.

En el modelo alpha actual, `admin_users` corresponde al super admin.

Un usuario alpha tester puede tener `view_report` y consultar reportes, pero
eso no implica acceso a DB health.

## Diferencia entre endpoints

```text
/api/infonavit/health      -> health basico reducido
/api/infonavit/db-health   -> health de DB protegido
```

`/api/infonavit/health` debe mantenerse como una verificacion basica sin
detalles sensibles. `/api/infonavit/db-health` debe permanecer protegido para
evitar exponer informacion operativa innecesaria.

## Impacto UX

Un alpha tester puede acceder a reportes si tiene `view_report`.

Ese permiso no concede acceso a DB health. Si una pantalla o dashboard consulta
DB health para usuarios sin `admin_users`, debe manejar respuestas `401` o
`403` sin romper la experiencia principal.

Comportamiento esperado:

- sin sesion: `AUTH_REQUIRED` / 401;
- con sesion sin `admin_users`: `FORBIDDEN` / 403;
- con super admin: respuesta normal de DB health.

## Seguridad

DB health:

- no debe exponer secretos;
- no debe exponer cadenas de conexion;
- no debe exponer headers internos;
- no debe exponer stack traces;
- no debe exponer detalles internos innecesarios;
- no debe mover `X-API-Key` al cliente.

`X-API-Key` sigue siendo server-side y solo debe viajar desde Next.js hacia la
API INFONAVIT protegida.

## Pendientes

Pendientes para fases posteriores:

- decidir si se mantiene un health publico/reducido en entornos desplegados;
- confirmar si DB health queda solo para admin en todos los ambientes;
- validar comportamiento en entorno desplegado;
- revisar logging/observabilidad de errores de health;
- rebaselinar `docs/matriz_controles_futuros.md` en una fase posterior.

## Fuera de alcance

Esta decision no incluye:

- dashboard admin;
- nuevos roles;
- nuevos permisos editables por UI;
- cambios de codigo;
- cambios al backend INFONAVIT;
- acceso directo a Supabase;
- produccion publica.

## Decision vigente

El hardening de `/api/infonavit/db-health` con `admin_users` forma parte del
estado actual de Closed Alpha controlada. No convierte la aplicacion en apta
para exposicion publica.
