# Nota tecnica: descargas Markdown/JSON y capabilities

> **Nota de vigencia documental**
>
> Este documento se conserva como evidencia historica de la fase o decision que describe.
> El estado operativo vigente del proyecto se documenta en
> `docs/ESTADO_ACTUAL_CLOSED_ALPHA.md`.
> Si existe diferencia entre este documento y el baseline vigente, prevalece el baseline.

## Contexto

Fase 1 de `control-dashboard-platform` opera en entorno local/controlado.

El modulo INFONAVIT consume informacion read-only mediante rutas internas de Next.js:

```text
Browser -> /api/infonavit/* -> Next.js server-side -> API INFONAVIT
```

La capa server-side de Next.js llama a la API INFONAVIT usando `X-API-Key`. El navegador no recibe ni transmite esa llave.

Actualmente el navegador recibe el contenido JSON y Markdown del reporte extendido, y las descargas Markdown/JSON se generan en cliente mediante `data:` URI a partir de datos ya cargados en la aplicacion.

Existen placeholders de capabilities:

```text
view_report
download_markdown
download_json
use_ai
download_pdf
admin_users
```

Fase 1 no implementa auth real, sesion real ni gate server-side de descargas.

## Flujo actual

Flujo de consulta del reporte:

```text
Browser
  -> /api/infonavit/extended/json
  -> Next.js server-side
  -> API INFONAVIT con X-API-Key
  -> Next.js server-side
  -> Browser recibe JSON
```

Flujo de Markdown:

```text
Browser
  -> /api/infonavit/extended/markdown
  -> Next.js server-side
  -> API INFONAVIT con X-API-Key
  -> Next.js server-side
  -> Browser recibe Markdown
```

Flujo de descarga actual:

```text
Browser recibe JSON/Markdown
Browser construye data: URI
Browser descarga archivo local
```

## Riesgo actual

El riesgo principal no es exposicion de `X-API-Key`, porque la llave permanece server-side.

El riesgo esta en la distribucion del contenido del reporte. Si el JSON o Markdown completo ya vive en el navegador, el usuario puede copiar, guardar o reconstruir el contenido desde:

- la respuesta de Network tab;
- el estado de la aplicacion;
- DevTools;
- el DOM renderizado;
- la accion de copiar Markdown;
- el contenido visible en pantalla.

Por lo tanto, deshabilitar u ocultar botones de descarga no equivale a proteger realmente la distribucion de datos.

## Diferencia entre controles

| Control | Descripcion | Seguridad real |
| ------- | ----------- | -------------- |
| Gate UX | Oculta o deshabilita botones en la interfaz. | No. Solo controla la experiencia visible. |
| Capability en cliente | Evalua permisos dentro del navegador. | No fuerte. El estado cliente puede inspeccionarse o modificarse, y los datos ya estan presentes. |
| Capability server-side | Evalua permisos antes de ejecutar una accion en servidor. | Si, siempre que el servidor no entregue datos ni archivos sin autorizacion. |
| Seguridad real de distribucion | Impide que contenido protegido llegue a usuarios sin permiso. | Si. Requiere auth, sesion, capabilities server-side y control de entrega de datos. |

## Limitacion de la arquitectura actual

Mientras el reporte completo viva en el navegador, `download_markdown` y `download_json` solo pueden actuar como controles de interfaz.

Incluso si se condicionan los botones por capability en cliente, el usuario ya tiene acceso al contenido recibido. Por ello, un gate cliente no debe presentarse como control de seguridad fuerte.

Para controlar realmente descargas y distribucion, el flujo debe cambiar hacia rutas server-side de descarga con validacion de sesion y capabilities antes de entregar el archivo.

## Decision para Fase 1

Para Fase 1 se mantienen las descargas Markdown/JSON generadas en cliente solo para entorno local/controlado.

Esta decision es aceptable porque Fase 1 no esta autorizada para exposicion publica y no incluye auth real.

Condiciones de Fase 1:

- las descargas Markdown/JSON son locales/controladas;
- no se afirma que exista proteccion real de descarga;
- no se expone `X-API-Key`;
- no se agrega auth falsa;
- no se implementan capabilities como seguridad real;
- no se habilita exposicion publica.

## Decision para exposicion publica futura

Antes de cualquier exposicion publica, las descargas Markdown/JSON deberan migrarse a rutas server-side con auth y capability gate real.

La exposicion publica queda bloqueada hasta resolver este punto.

El flujo objetivo debera ser:

```text
Browser
  -> /api/infonavit/download/markdown
  -> validar sesion
  -> validar capability download_markdown
  -> obtener/generar contenido server-side
  -> responder archivo Markdown
```

```text
Browser
  -> /api/infonavit/download/json
  -> validar sesion
  -> validar capability download_json
  -> obtener/generar contenido server-side
  -> responder archivo JSON
```

Ademas, si el contenido completo del reporte se considera sensible, el control no debe limitarse a las descargas. Tambien debera evaluarse `view_report` server-side antes de entregar JSON/Markdown al navegador.

## Opciones evaluadas

### A) Mantener descargas cliente y condicionar botones con capabilities locales

Viable para Fase 1 local/controlada.

Ventajas:

- bajo impacto;
- no requiere auth real;
- prepara la interfaz para capabilities futuras.

Limitaciones:

- es control UX;
- no protege distribucion;
- no debe usarse como justificacion para exposicion publica.

### B) Crear helper local/controlado de capabilities sin auth real

Viable como preparacion tecnica.

Ventajas:

- mejora consistencia del codigo futuro;
- permite modelar capabilities sin proveedor de auth.

Limitaciones:

- no crea sesion real;
- no crea gate server-side;
- no cambia el riesgo de distribucion si los datos ya viven en cliente.

### C) Mover descargas a rutas internas server-side

Recomendado para fase futura con exposicion publica.

Ventajas:

- permite validar sesion y capability antes de entregar archivo;
- evita que la generacion de archivos dependa de `data:` URI;
- prepara auditoria, logging y politicas de descarga.

Limitaciones:

- requiere decision de auth;
- requiere sesion real;
- requiere diseno de capabilities server-side;
- puede requerir cambios de UI y pruebas nuevas.

### D) Bloquear descargas fuera de entorno local/controlado

Recomendado como politica.

Ventajas:

- reduce riesgo de distribucion accidental;
- alinea Fase 1 con su alcance aprobado.

Limitaciones:

- si se aplica solo en cliente, sigue siendo debil;
- para ser fuerte debe aplicarse server-side.

### E) Documentar que las capabilities cliente son UX-only

Recomendado desde Fase 1.

Ventajas:

- evita una falsa percepcion de seguridad;
- deja claro el bloqueo para exposicion publica;
- guia el diseno futuro.

Limitaciones:

- no sustituye la implementacion futura.

## Recomendacion final

Mantener Fase 1 como local/controlada sin implementar gate real de descargas.

Documentar que cualquier capability aplicada en cliente seria un control de interfaz, no un control de seguridad fuerte.

Para una exposicion publica futura, implementar rutas server-side de descarga con:

- auth real;
- sesion server-side;
- validacion de capability;
- respuestas de archivo controladas;
- errores seguros;
- auditoria minima de accesos y descargas.

## Criterios minimos para implementacion futura real

Una implementacion futura real debera cumplir al menos:

- existencia de auth real;
- existencia de sesion verificable server-side;
- modelo de capabilities evaluado en servidor;
- `download_markdown` requerido para descargar Markdown;
- `download_json` requerido para descargar JSON;
- `view_report` requerido para visualizar el reporte si el contenido se considera protegido;
- rutas server-side de descarga;
- `Content-Type` correcto;
- `Content-Disposition` controlado;
- no exponer `X-API-Key`;
- no exponer stack traces;
- no entregar secretos en payloads;
- no depender de `data:` URI para descargas protegidas;
- comportamiento definido para `401`, `403`, `422`, timeout y errores upstream.

## Pruebas necesarias para la fase futura

Pruebas recomendadas:

- usuario sin sesion recibe `401`;
- usuario con sesion sin capability recibe `403`;
- usuario con `download_markdown` descarga Markdown;
- usuario con `download_json` descarga JSON;
- usuario sin `view_report` no recibe contenido protegido;
- headers de respuesta son correctos;
- nombre de archivo es seguro y consistente;
- errores no exponen secretos, headers internos ni stack traces;
- navegador solo llama rutas internas;
- `X-API-Key` no aparece en cliente;
- no existe `NEXT_PUBLIC_INFONAVIT_API_KEY`;
- descargas publicas quedan bloqueadas sin auth/capability gate.

## Deuda tecnica registrada

| Observacion | Severidad | Estado | Accion recomendada | Bloquea Fase 1 | Bloquea exposicion publica |
| ----------- | --------- | ------ | ------------------ | -------------- | -------------------------- |
| Descargas Markdown/JSON generadas en cliente con `data:` URI. | Media | Aceptada para Fase 1 local/controlada. | Migrar a rutas server-side antes de exposicion publica. | No | Si |
| Capabilities existentes son placeholders sin auth ni sesion real. | Media | Pendiente de fase futura. | Definir auth, sesion y evaluacion server-side de capabilities. | No | Si |
| Capability cliente seria UX-only. | Media | Documentado. | No presentarlo como seguridad real. | No | Si |
| El reporte completo vive en navegador tras la consulta. | Media | Aceptado para Fase 1 local/controlada. | Evaluar `view_report` server-side si el contenido se considera protegido. | No | Si |
| No existe auditoria de descargas. | Baja en local, media en publico. | Pendiente de fase futura. | Agregar logging/auditoria cuando exista auth real. | No | Si |

