# Nota tecnica - Workaround Next/SWC en Windows

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

Este fallo no corresponde a la logica de la aplicacion. La causa probable es una incompatibilidad entre Node 24, que es una version current/no LTS, y el binario nativo SWC precompilado usado por Next.js 15 en Windows.

## Workaround actual

Se agrego temporalmente:

```text
@next/swc-wasm-nodejs
scripts/with-next-wasm.mjs
NEXT_TEST_WASM_DIR
```

Los scripts `dev` y `build` ejecutan Next mediante el wrapper:

```text
node scripts/with-next-wasm.mjs dev
node scripts/with-next-wasm.mjs build
```

El wrapper apunta explicitamente a `node_modules/@next/swc-wasm-nodejs` para permitir que Next use SWC WASM.

## Evaluacion de riesgo

Este workaround es aceptable como puente temporal para desarrollo local, pero no debe considerarse una solucion permanente.

Riesgos:

- `NEXT_TEST_WASM_DIR` parece una variable interna/de pruebas de Next.js, no una API publica estable.
- El flujo local deja de ser el estandar documentado por Next.js.
- Puede confundir a nuevos desarrolladores.
- Debe revisarse antes de formalizar CI/CD o despliegue productivo.

Mitigantes:

- Las validaciones de Fase 1 pasan con el wrapper.
- La implementacion funcional no depende de SWC WASM.
- CI/CD y despliegues en Linux probablemente usen SWC nativo sin este problema.

## Solucion propuesta

Normalizar el runtime del proyecto a Node 22 LTS y validar si el wrapper puede eliminarse.

Plan recomendado:

1. Fijar Node 22 LTS para el proyecto.
2. Agregar `.nvmrc` con:

```text
22
```

3. Declarar engines en `package.json`:

```json
{
  "engines": {
    "node": ">=22 <23"
  }
}
```

4. En un entorno limpio con Node 22 LTS:

```text
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npm run build
```

5. Si `next build` funciona con SWC nativo normal, eliminar:

```text
scripts/with-next-wasm.mjs
@next/swc-wasm-nodejs
NEXT_TEST_WASM_DIR
```

6. Restaurar scripts estandar:

```json
{
  "dev": "next dev",
  "build": "next build"
}
```

## Decision para Fase 1

El workaround no bloquea el cierre de Fase 1.

Debe mantenerse temporalmente, documentado y con una tarea tecnica posterior para eliminarlo antes de CI/CD formal o despliegue productivo.

## Registro de deuda tecnica

| Observacion | Severidad | Estado | Accion recomendada | Bloquea Fase 1 | Bloquea despliegue publico |
| --- | --- | --- | --- | --- | --- |
| Workaround SWC/Node 24 usando `scripts/with-next-wasm.mjs`, `@next/swc-wasm-nodejs` y `NEXT_TEST_WASM_DIR`. | Media | Temporal documentado | Validar Node 22 LTS en Windows; si `next build` estandar funciona, eliminar wrapper, dependencia WASM y variable interna. | No | No, si CI/CD/despliegue usa runtime Linux/Node soportado; revisar antes de formalizar pipeline |
| Descargas Markdown/JSON sin auth/capability gate. | Alta para exposicion publica | Permitido solo local/controlado en Fase 1 | Antes de publicar, agregar gate server-side de autorizacion para `download_markdown` y `download_json`. | No | Si |
| Falta definir version Node soportada para el proyecto. | Media | Pendiente | Agregar `.nvmrc`, `engines` en `package.json` o equivalente antes de CI/CD formal. | No | Si, para CI/CD productivo |
| Evaluar eliminacion de `scripts/with-next-wasm.mjs`. | Media | Pendiente | Abrir tarea posterior para probar build limpio con Node 22 LTS y restaurar scripts `next dev` / `next build` si aplica. | No | No, pero debe resolverse antes de estandarizar DX/CI |
