# Closed Alpha 1 - Google login y allowlist

> **Nota de vigencia documental**
>
> Este documento se conserva como evidencia historica de la fase o decision que describe.
> El estado operativo vigente del proyecto se documenta en
> `docs/ESTADO_ACTUAL_CLOSED_ALPHA.md`.
> Si existe diferencia entre este documento y el baseline vigente, prevalece el baseline.

## Contexto

Closed Alpha 1 implementa Google login con Auth.js y una allowlist server-side para una free trial controlada de maximo 5 usuarios invitados directamente.

Esta fase no abre exposicion publica general, no habilita signup publico y no protege todavia los endpoints reales de reporte. La proteccion de `/api/infonavit/extended/json` y `/api/infonavit/extended/markdown` queda para Closed Alpha 2.

## Alcance implementado

- Auth.js con Google Provider.
- Route handler `app/api/auth/[...nextauth]/route.ts`.
- Allowlist server-side mediante variables privadas.
- Normalizacion de emails a lowercase y sin espacios.
- Rechazo de emails no invitados.
- Rechazo si Google reporta `email_verified=false`.
- Rechazo si la allowlist excede 5 emails.
- Rechazo si `ALPHA_SUPER_ADMIN_EMAIL` no esta dentro de la allowlist.
- Mapeo de capabilities alpha.
- UI minima de login/logout para validacion local.
- Bloqueo UI del dashboard para usuarios sin sesion alpha valida.

## Variables privadas

```text
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
ALPHA_ALLOWED_EMAILS=
ALPHA_SUPER_ADMIN_EMAIL=
ALPHA_MAX_INVITED_USERS=5
```

Estas variables no deben usar prefijo `NEXT_PUBLIC_`.

## Modelo de allowlist

`ALPHA_ALLOWED_EMAILS` contiene una lista separada por comas:

```text
email1@example.com,email2@example.com
```

Reglas:

- maximo 5 emails invitados;
- emails normalizados a lowercase;
- espacios removidos;
- no hay signup publico;
- usuarios fuera de allowlist son rechazados;
- el super admin debe estar incluido en la allowlist.

El limite se interpreta como maximo 5 correos invitados/autorizados. El control de usuarios activos concurrentes queda fuera de esta fase.

## Capabilities alpha

`alpha_tester`:

```text
view_report
download_markdown
download_json
download_pdf
use_ai
```

`super_admin`:

```text
view_report
download_markdown
download_json
download_pdf
use_ai
admin_users
```

`download_pdf` y `use_ai` son solo capabilities futuras. Esta fase no implementa PDF ni IA.

## Bloqueos explicitos

Esta fase no implementa:

- PDF;
- IA;
- descargas server-side;
- dashboard admin;
- roles editables por UI;
- tablas reales;
- migraciones;
- cambios al backend INFONAVIT;
- cambios a Supabase;
- exposicion publica abierta.

## Riesgos residuales

- Los endpoints de reporte todavia no estan protegidos por `view_report`.
- El dashboard queda oculto para usuarios anonimos, pero el gate server-side
  fuerte de endpoints queda para Closed Alpha 2.
- Las descargas Markdown/JSON siguen siendo cliente/local/controladas.
- La observabilidad real minima queda para Closed Alpha 3.
- La allowlist por variables privadas es transitoria; una base operacional queda para fase posterior.

## Siguiente fase

Closed Alpha 2 debe aplicar `view_report` server-side a endpoints de reporte, usando la sesion Auth.js integrada con `PlatformSession`.
