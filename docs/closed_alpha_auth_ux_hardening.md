# Closed Alpha - UX/Auth hardening previo a invitados

## Contexto

Este ajuste prepara la closed alpha antes de invitar usuarios reales. Closed Alpha 1 ya implemento Google login con Auth.js y allowlist server-side. Closed Alpha 2 ya protegio endpoints de reporte con `view_report`. Closed Alpha 3 ya agrego observabilidad ligera de activacion.

La app sigue sin exposicion publica abierta y sin signup publico.

## Cambios de confianza y sesion

- El texto visible de acceso restringido ya no presenta Closed Alpha 2 como trabajo futuro.
- Usuarios sin sesion ven solo `Entrar con Google`.
- Usuarios con sesion ven `Cerrar sesión` y una opcion de `Cambiar cuenta`.
- La cuenta activa se muestra de forma minima para reducir confusion de usuario.
- Google Auth.js solicita selector de cuenta mediante `prompt=select_account`.
- La sesion alpha usa una duracion objetivo de 30 minutos.
- La UI cierra sesion automaticamente despues de 30 minutos de inactividad.
- El cierre por inactividad redirige a la pantalla de acceso con el mensaje `Tu sesión se cerró por inactividad.`

## Privacidad

El detector de inactividad no registra actividad granular, no envia eventos de tracking, no recolecta IP, no recolecta user-agent y no almacena datos personales adicionales. Solo usa eventos basicos del navegador para reiniciar un temporizador local.

## Seguridad

Estos cambios mejoran la confianza del flujo de acceso, pero no sustituyen controles server-side:

- los endpoints de reporte siguen protegidos por `view_report`;
- el navegador no recibe `X-API-Key`;
- no se agregan secretos `NEXT_PUBLIC_*`;
- no se guardan tokens OAuth ni refresh tokens desde la app;
- no se implementa dashboard admin;
- no se implementan PDF ni IA.

## Limitaciones

- El cierre por inactividad depende del navegador y de la cookie/sesion Auth.js.
- La opcion `Cambiar cuenta` depende del comportamiento de Google con `prompt=select_account`.
- No se registra evento `logout` todavia.
- No hay control de usuarios activos concurrentes.
- No hay exposicion publica autorizada todavia.

## Validacion esperada

- Sin sesion: aparece `Entrar con Google` y no aparece `Cerrar sesión`.
- Con sesion: aparece `Cerrar sesión` y la cuenta activa.
- `Cambiar cuenta` permite volver al selector de cuenta Google.
- Despues de 30 minutos sin actividad, se ejecuta cierre de sesion.
- No aparecen secretos en Network tab.
- Los endpoints de reporte siguen protegidos server-side.
