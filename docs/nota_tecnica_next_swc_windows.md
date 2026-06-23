# Nota tecnica - Next/SWC en Windows

## Contexto

Durante la implementacion de Fase 1 se detecto un problema local al ejecutar `next build` en Windows con:

```text
Node v24.13.0
npm 11.6.2
Next.js 15.5.19
```

El build fallo al cargar el binario nativo SWC de Next:

```text
@next/swc-win32-x64-msvc ... next-swc.win32-x64-msvc.node no es una aplicacion Win32 valida
```

Este fallo no correspondia a la logica de la aplicacion. La causa probable era una incompatibilidad temporal entre el entorno local Windows/Node 24 y el binario nativo SWC usado por Next.js 15.

## Estado actual

El workaround SWC/WASM ya no esta activo.

Estado validado:

```text
scripts/with-next-wasm.mjs: no existe
@next/swc-wasm-nodejs: no instalado
NEXT_TEST_WASM_DIR: no usado en codigo ejecutable
package.json dev: next dev
package.json build: next build
```

Tambien se valido que el build estandar funciona en el entorno local actual con Node 22 LTS:

```text
node --version
v22.23.0

npm run build
> next build
Compiled successfully
```

## Decision para Fase 1

El problema queda atendido para Fase 1.

No bloquea:

- cierre de Fase 1;
- auditoria post-build;
- desarrollo local actual.

## Runtime Node

El proyecto ya declara Node 22 LTS como runtime objetivo.

Estado:

- `.nvmrc` contiene `22`;
- `package.json` declara `"node": ">=22 <23"`;
- el build estandar fue validado con Node 22 LTS.

Para CI/CD futuro, usar Node 22.

Ejemplo GitHub Actions:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '22'
```

## Registro de deuda tecnica

| Observacion | Severidad | Estado | Accion recomendada | Bloquea Fase 1 | Bloquea despliegue publico |
| --- | --- | --- | --- | --- | --- |
| Workaround SWC/WASM por Node 24 en Windows. | Baja | Resuelto: wrapper eliminado y build estandar validado | Mantener scripts estandar `next dev` y `next build`; reabrir solo si reaparece el fallo en entorno limpio. | No | No |
| Version Node soportada para el proyecto. | Baja | Resuelto para Fase 1: `.nvmrc` y `engines` apuntan a Node 22 LTS | Replicar Node 22 en CI/CD cuando se formalice pipeline. | No | No, si CI/CD usa Node 22 |
| Descargas Markdown/JSON sin auth/capability gate. | Alta para exposicion publica | Permitido solo local/controlado en Fase 1 | Antes de publicar, agregar gate server-side de autorizacion para `download_markdown` y `download_json`. | No | Si |
