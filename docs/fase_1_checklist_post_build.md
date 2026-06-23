# Fase 1 - Checklist post-build

## Validación funcional

- [ ] La app inicia en entorno local/controlado.
- [ ] El dashboard inicial carga.
- [ ] El estado de API se muestra.
- [ ] El estado de DB se muestra.
- [ ] El selector de periodo permite año actual, año previo y mes de corte.
- [ ] El reporte extendido JSON se consulta correctamente.
- [ ] El reporte extendido Markdown se consulta correctamente.
- [ ] El resumen estructurado se renderiza.
- [ ] La vista Markdown se renderiza.
- [ ] La vista JSON se renderiza.
- [ ] Copiar Markdown funciona.
- [ ] Descargar Markdown funciona solo en entorno local/controlado.
- [ ] Descargar JSON funciona solo en entorno local/controlado.

## Validación de errores

- [ ] Falta `INFONAVIT_API_BASE_URL` muestra error controlado.
- [ ] Falta `INFONAVIT_API_KEY` muestra error controlado.
- [ ] API key inválida muestra error controlado.
- [ ] Parámetros inválidos muestran error controlado.
- [ ] Timeout muestra error controlado.
- [ ] API no disponible muestra error controlado.
- [ ] DB no disponible muestra error controlado.
- [ ] No se muestran stack traces al usuario.

## Validación de seguridad

- [ ] `X-API-Key` no aparece en Network tab del navegador.
- [ ] `INFONAVIT_API_KEY` no aparece en HTML renderizado.
- [ ] `INFONAVIT_API_KEY` no aparece en el bundle cliente.
- [ ] No existe `NEXT_PUBLIC_INFONAVIT_API_KEY`.
- [ ] No hay llamadas browser directas a Cloud Run protegido.
- [ ] No hay acceso directo a Supabase.
- [ ] No hay llamadas OpenAI desde navegador.
- [ ] No se usan `localStorage` ni `sessionStorage` para secretos.

## Validación de alcance

- [ ] No hay IA en Fase 1.
- [ ] No hay PDF en Fase 1.
- [ ] No hay ETL.
- [ ] No hay migraciones.
- [ ] No hay cambios al backend.
- [ ] INFONAVIT está aislado en `src/modules/infonavit`.
- [ ] La plataforma común vive fuera del módulo INFONAVIT.
## Validacion tecnica Next/SWC

- [ ] Se reviso `docs/nota_tecnica_next_swc_windows.md`.
- [ ] `package.json` usa scripts estandar `next dev` y `next build`.
- [ ] No existe `scripts/with-next-wasm.mjs`.
- [ ] No esta instalado `@next/swc-wasm-nodejs`.
- [ ] No se usa `NEXT_TEST_WASM_DIR` en codigo ejecutable.
- [ ] `npm run build` funciona con el flujo estandar de Next.js.
- [ ] `.nvmrc` define Node 22.
- [ ] `package.json` declara `engines.node` como `>=22 <23`.
- [ ] Antes de CI/CD formal, el pipeline debe usar Node 22.

## Validacion audit de dependencias

- [ ] Se reviso `docs/nota_tecnica_audit_dependencias.md`.
- [ ] `npm audit` reporta el hallazgo transitorio de `postcss` transitivo via Next.js.
- [ ] No se ejecuta `npm audit fix --force` porque propone degradar Next.js a una version incompatible.
- [ ] El hallazgo no bloquea Fase 1 local/controlada.
- [ ] El hallazgo debe revisarse antes de despliegue publico o CI/CD con politica estricta de audit.

## Validacion manual de Network tab

- [ ] Browser llama solo rutas internas `/api/infonavit/*`.
- [ ] No se observa `X-API-Key` en Request Headers del navegador.
- [ ] El payload/query del navegador contiene solo `current_year`, `previous_year` y `month_limit`.
- [ ] No se observan secretos en navegador.

## Validacion de descargas

- [ ] Las descargas Markdown/JSON se validan solo en entorno local/controlado.
- [ ] No se habilitan descargas publicas sin auth/capabilities.
- [ ] Antes de cualquier despliegue publico existe un gate de autorizacion server-side para descargas.
- [ ] Se entiende que esto no bloquea Fase 1 local, pero si bloquea exposicion publica futura.
