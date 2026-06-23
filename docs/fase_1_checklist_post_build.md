# Fase 1 - Checklist post-build auditado

Fecha de actualizacion: 2026-06-23

Estado: APROBADO CON OBSERVACIONES

## Validacion funcional

- [ ] La app inicia en entorno local/controlado mediante `npm run dev`.
- [ ] El dashboard inicial carga en navegador.
- [ ] El estado de API se muestra en UI.
- [ ] El estado de DB se muestra en UI.
- [ ] El selector de periodo permite anio actual, anio previo y mes de corte.
- [ ] El reporte extendido JSON se consulta correctamente contra API real.
- [ ] El reporte extendido Markdown se consulta correctamente contra API real.
- [ ] El resumen estructurado se renderiza.
- [ ] La vista Markdown se renderiza.
- [ ] La vista JSON se renderiza.
- [ ] Copiar Markdown funciona en navegador.
- [ ] Descargar Markdown funciona solo en entorno local/controlado.
- [ ] Descargar JSON funciona solo en entorno local/controlado.

## Validacion de errores

- [ ] Falta `INFONAVIT_API_BASE_URL` muestra error controlado.
- [ ] Falta `INFONAVIT_API_KEY` muestra error controlado.
- [ ] API key invalida muestra error controlado.
- [ ] Parametros invalidos muestran error controlado.
- [ ] Timeout muestra error controlado.
- [ ] API no disponible muestra error controlado.
- [ ] DB no disponible muestra error controlado.
- [x] No se exponen stack traces desde la normalizacion server-side de errores.

## Validacion de seguridad

- [ ] `X-API-Key` no aparece en Network tab del navegador.
- [ ] `INFONAVIT_API_KEY` no aparece en HTML renderizado.
- [ ] `INFONAVIT_API_KEY` no aparece en el bundle cliente.
- [x] No existe `NEXT_PUBLIC_INFONAVIT_API_KEY` en codigo ejecutable.
- [x] No hay llamadas browser directas a Cloud Run protegido en componentes cliente.
- [x] No hay acceso directo a Supabase en codigo ejecutable.
- [x] No hay llamadas OpenAI desde navegador.
- [x] No se usan `localStorage` ni `sessionStorage` para secretos.
- [x] `INFONAVIT_API_KEY` se lee desde `process.env` en capa server-side.
- [x] `X-API-Key` solo se agrega en el cliente API server-side de INFONAVIT.

## Validacion de alcance

- [x] No hay IA implementada en Fase 1.
- [x] No hay PDF implementado en Fase 1.
- [x] No hay ETL.
- [x] No hay migraciones.
- [x] No hay cambios al backend.
- [x] No hay acceso directo a Supabase desde frontend.
- [x] INFONAVIT esta aislado en `src/modules/infonavit`.
- [x] La plataforma comun vive fuera del modulo INFONAVIT.

## Validacion tecnica Next/SWC

- [x] Se reviso `docs/nota_tecnica_next_swc_windows.md`.
- [x] `package.json` usa scripts estandar `next dev` y `next build`.
- [x] No existe `scripts/with-next-wasm.mjs`.
- [x] No esta instalado `@next/swc-wasm-nodejs`.
- [x] No se usa `NEXT_TEST_WASM_DIR` en codigo ejecutable.
- [x] `npm run build` funciona con el flujo estandar de Next.js.
- [x] `.nvmrc` define Node 22.
- [x] `package.json` declara `engines.node` como `>=22 <23`.
- [N/A] CI/CD formal no existe todavia; cuando exista, debe usar Node 22.

## Validacion audit de dependencias

- [x] Se reviso `docs/nota_tecnica_audit_dependencias.md`.
- [x] `npm audit` reporta el hallazgo transitorio de `postcss` transitivo via Next.js.
- [x] No se ejecuta `npm audit fix --force` porque propone degradar Next.js a una version incompatible.
- [x] El hallazgo no bloquea Fase 1 local/controlada.
- [ ] El hallazgo debe revisarse antes de despliegue publico o CI/CD con politica estricta de audit.

## Validacion manual de Network tab

- [ ] Browser llama solo rutas internas `/api/infonavit/*`.
- [ ] No se observa `X-API-Key` en Request Headers del navegador.
- [ ] El payload/query del navegador contiene solo `current_year`, `previous_year` y `month_limit`.
- [ ] No se observan secretos en navegador.

## Validacion de descargas

- [x] Las descargas Markdown/JSON estan documentadas como permitidas solo en entorno local/controlado.
- [x] No se deben exponer publicamente sin auth/capabilities.
- [ ] Antes de cualquier despliegue publico debe existir un gate de autorizacion server-side para descargas.
- [x] Se entiende que esto no bloquea Fase 1 local, pero si bloquea exposicion publica futura.

## Evidencia de validacion

### Contexto

- Fecha de validacion: 2026-06-23.
- Rama validada: `main`.
- Estado Git validado: limpio y sincronizado con `origin/main`.
- Node: `v22.23.0`.
- npm: `10.9.8`.
- Next.js: `15.5.19`.

### Comandos ejecutados

```text
npm run lint
npm run typecheck
npm run test
npm run build
```

### Resultado de lint

```text
npm run lint: OK
```

### Resultado de typecheck

```text
npm run typecheck: OK
```

### Resultado de test

```text
npm run test: OK
tests: 2
pass: 2
fail: 0
```

### Resultado de build

```text
npm run build: OK
Next.js 15.5.19
Compiled successfully
Linting and checking validity of types: OK
Generated static pages: 4/4
```

### Observaciones de seguridad

- No se encontro `NEXT_PUBLIC_INFONAVIT_API_KEY` en codigo ejecutable.
- `INFONAVIT_API_KEY` permanece como variable server-side.
- `X-API-Key` solo se agrega en el cliente server-side INFONAVIT.
- Componentes cliente consumen rutas internas `/api/infonavit/*`.
- No se encontro acceso directo a Supabase en codigo ejecutable.
- No se encontro `DATABASE_URL` expuesto en codigo ejecutable.
- No se encontro `OPENAI_API_KEY` en codigo ejecutable.
- Las descargas Markdown/JSON quedan restringidas documentalmente a entorno local/controlado.

### Hallazgos pendientes

- Validar manualmente Network tab en navegador.
- Validar flujos UI completos contra API real en entorno local/controlado.
- Implementar auth/capability gate server-side antes de cualquier exposicion publica.
- Revisar hallazgo transitorio de `postcss` via Next.js antes de CI/CD estricto o despliegue publico.
- Corregir encoding/mojibake en documentacion. Observacion baja; no bloquea Fase 1.

### Decision final

APROBADO CON OBSERVACIONES.

Fase 1 queda aprobada para cierre local/controlado. No queda aprobada para exposicion publica hasta incorporar auth/capability gate server-side para descargas y repetir validaciones de seguridad en navegador.
