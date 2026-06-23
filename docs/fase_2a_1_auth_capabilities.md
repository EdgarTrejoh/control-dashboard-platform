# Fase 2A.1 - Modelo server-side de sesion y capabilities

## Contexto

Fase 2A.1 prepara el modelo base para evaluar permisos en servidor.

Esta subfase no implementa proveedor de autenticacion real, no agrega login, no agrega middleware global y no protege todavia endpoints reales de reporte.

## Decision

Se incorpora un modelo server-side de sesion y helpers de capabilities para que fases posteriores puedan aplicar gates reales en rutas internas de Next.js.

El adaptador temporal local/controlado no es auth productiva.

No debe usarse para exposicion publica, staging abierto, PDF, IA ni descargas publicas.

## Alcance

Incluye:

- tipo `PlatformSession`;
- tipo de usuario de sesion;
- provider `local-controlled`;
- helper para construir una sesion local/controlada en pruebas o desarrollo controlado;
- `hasCapability`;
- `requireCapability`;
- errores normalizados `AUTH_REQUIRED` y `FORBIDDEN`.

No incluye:

- Google login;
- Auth.js;
- proveedor externo;
- base de datos de usuarios;
- middleware global;
- proteccion de endpoints reales;
- rutas server-side de descarga;
- PDF;
- IA;
- despliegue publico.

## Capabilities soportadas

```text
view_report
download_markdown
download_json
download_pdf
use_ai
admin_users
```

## Uso futuro esperado

Fases posteriores deberan evaluar capabilities en route handlers server-side antes de entregar datos o archivos:

```text
Browser
  -> Next.js route handler
  -> resolver sesion server-side
  -> requireCapability(...)
  -> ejecutar accion permitida
```

## Restriccion de seguridad

El cliente puede usar capabilities para UX, pero la seguridad real debe evaluarse en servidor.

Mientras no exista proveedor auth real y sesion verificable, el proyecto sigue bloqueado para exposicion publica.

