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
