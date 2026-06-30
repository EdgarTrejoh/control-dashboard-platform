# Fase 1 - Definición cerrada

> **Nota de vigencia documental**
>
> Este documento se conserva como evidencia historica de la fase o decision que describe.
> El estado operativo vigente del proyecto se documenta en
> `docs/ESTADO_ACTUAL_CLOSED_ALPHA.md`.
> Si existe diferencia entre este documento y el baseline vigente, prevalece el baseline.

Proyecto: `003_control_dashboard_platform`

Fase 1 define la primera implementación funcional read-only de la plataforma usando INFONAVIT como primer módulo conectado. Esta especificación está lista para revisión y aprobación antes de una ronda posterior de implementación controlada.

## 1. Resumen ejecutivo

Fase 1 construirá la base funcional read-only de `003_control_dashboard_platform`.

El objetivo es permitir que un usuario en entorno local/controlado consulte, visualice, copie y descargue el reporte extendido INFONAVIT sin tocar backend, base de datos, ETL ni secretos.

Fase 1 valida:

- estructura base de plataforma;
- separación plataforma vs módulo INFONAVIT;
- consumo seguro server-side;
- uso de variables privadas;
- health checks;
- consumo de reporte extendido JSON;
- consumo de reporte extendido Markdown;
- render inicial;
- copia de Markdown;
- descarga local/controlada de Markdown/JSON;
- manejo seguro de errores;
- no exposición de secretos;
- no cambios al backend.

Queda fuera:

- IA;
- PDF;
- auth real;
- roles finales;
- deploy productivo;
- ETL;
- migraciones;
- Supabase directo;
- cambios al backend.

## 2. Alcance cerrado

### Incluye

- Base Next.js + TypeScript + Tailwind.
- App ejecutable en entorno local/controlado.
- Estructura modular inicial: plataforma + módulo INFONAVIT.
- Cliente API INFONAVIT server-side.
- Variables privadas:
  - `INFONAVIT_API_BASE_URL`;
  - `INFONAVIT_API_KEY`.
- Health check API.
- Health check DB.
- Selector de periodo.
- Consumo de reporte extendido JSON.
- Consumo de reporte extendido Markdown.
- Render inicial del reporte extendido.
- Vista Markdown.
- Copiar Markdown.
- Descargar Markdown/JSON solo en entorno local/controlado.
- Estados UI principales.
- Manejo seguro de errores.
- Validación manual de no exposición de secretos.

### No incluye

- IA.
- PDF.
- Login real.
- Administración de usuarios.
- Roles definitivos.
- Auditoría de descargas.
- Deploy productivo.
- Observabilidad avanzada.
- Segundo módulo analítico.
- Nuevos endpoints.
- Cambios al backend.

### Fuera del proyecto frontend

Nunca debe pertenecer al frontend:

- ETL;
- migraciones;
- escritura de datos;
- administración de Supabase;
- acceso directo a Supabase;
- administración productiva de secretos;
- cambios al backend;
- ejecución directa de procesos analíticos de backend;
- llamadas directas del navegador a servicios protegidos con secretos.

## 3. Arquitectura funcional

Stack esperado:

- Next.js para UI, rutas y ejecución server-side.
- TypeScript para contratos y seguridad de tipos.
- Tailwind para sistema visual inicial.
- Cliente API server-side para INFONAVIT.
- Módulo INFONAVIT aislado dentro de la plataforma.
- Componentes compartidos para layout, estados, errores, acciones y visualización.
- Capa futura de auth preparada, no implementada.
- Capa futura de capabilities preparada, no implementada.
- IA y PDF futuros considerados en estructura, pero fuera del flujo Fase 1.

Diagrama:

```text
Browser
  -> Next.js UI
    -> Server-side action / route handler / server component
      -> INFONAVIT API client
        -> Cloud Run FastAPI
          -> Supabase read-only detrás del backend
```

Prohibido:

```text
Browser
  -> Cloud Run API con X-API-Key
```

## 4. Estructura lógica de carpetas propuesta

Conceptual:

```text
003_control_dashboard_platform/
  app/
    page
    layout
    dashboard
    modules
      infonavit

  src/
    platform/
      config
      env
      errors
      auth
      permissions
      navigation
      download
      telemetry

    modules/
      infonavit/
        api
        types
        adapters
        components
        pages
        markdown

    components/
      ui
      layout
      feedback
      markdown
      downloads
      charts

    lib/
      http
      dates
      formatting
      validation

    docs/
      decisions
      architecture
```

Separación esperada:

- `platform`: capacidades reutilizables.
- `modules/infonavit`: dominio INFONAVIT.
- `components`: UI compartida.
- `lib`: utilidades no acopladas a dominio.
- `docs`: documentación futura de decisiones y operación.

## 5. Variables de entorno

Variables privadas esperadas:

```text
INFONAVIT_API_BASE_URL
INFONAVIT_API_KEY
```

Reglas:

- Ambas son server-side.
- Ninguna debe tener prefijo `NEXT_PUBLIC_`.
- Ninguna debe enviarse al navegador.
- Ninguna debe guardarse en `localStorage`, `sessionStorage`, cookies visibles o HTML renderizado.
- `.env.example` debe existir en implementación futura sin valores reales.

`.env.example` conceptual:

```text
INFONAVIT_API_BASE_URL=https://example-cloud-run-url
INFONAVIT_API_KEY=replace-with-secure-server-side-key
```

No permitido:

```text
NEXT_PUBLIC_INFONAVIT_API_KEY=...
NEXT_PUBLIC_OPENAI_API_KEY=...
NEXT_PUBLIC_DATABASE_URL=...
```

## 6. Endpoints a consumir

| Endpoint | Propósito | Parámetros | Respuesta conceptual | Errores | Uso UI |
| --- | --- | --- | --- | --- | --- |
| `GET /health` | Validar disponibilidad API | Ninguno | Estado de servicio | timeout, 5xx, endpoint no disponible | Indicador API disponible/no disponible |
| `GET /db/health` | Validar disponibilidad DB vía backend | Ninguno | Estado DB read-only | timeout, 5xx, DB no disponible | Indicador DB disponible/no disponible |
| `GET /mini-report/extended/json` | Obtener reporte extendido estructurado | `current_year`, `previous_year`, `month_limit`, opcionales según contrato | JSON con métricas, secciones y datos de reporte | `401`, `422`, timeout, vacío | Render estructurado y descarga JSON |
| `GET /mini-report/extended/markdown` | Obtener reporte extendido narrativo | Mismos parámetros aplicables | Markdown del reporte extendido | `401`, `422`, timeout, vacío | Vista Markdown, copiar, descargar Markdown |

Endpoints excluidos de Fase 1:

```text
GET /mini-report/ai/json
GET /mini-report/ai/markdown
```

## 7. Pantallas y flujos

Pantallas mínimas:

- dashboard inicial;
- sección de estado API/DB;
- selector de periodo;
- panel de resultados;
- vista de reporte extendido;
- vista Markdown;
- acciones locales/controladas.

Flujo principal:

```text
Usuario abre dashboard
-> frontend valida configuración server-side
-> usuario selecciona periodo
-> usuario solicita reporte extendido
-> servidor Next.js llama API INFONAVIT con X-API-Key
-> UI muestra JSON interpretado y Markdown
-> usuario copia Markdown o descarga archivo si está permitido
```

Acciones permitidas:

- consultar health;
- consultar DB health;
- generar/ver reporte extendido;
- copiar Markdown;
- descargar Markdown;
- descargar JSON.

Acciones no permitidas:

- generar PDF;
- consultar IA;
- ejecutar ETL;
- modificar datos;
- acceder a Supabase.

## 8. Estados UI requeridos

Fase 1 debe contemplar:

- cargando;
- API disponible;
- API no disponible;
- DB disponible;
- DB no disponible;
- falta `INFONAVIT_API_KEY` en servidor;
- falta `INFONAVIT_API_BASE_URL`;
- `401` API key inválida;
- `422` parámetros inválidos;
- timeout;
- error controlado;
- datos vacíos;
- endpoint no disponible;
- Markdown vacío;
- JSON vacío o inesperado;
- descarga permitida en entorno local/controlado;
- descarga no permitida fuera de entorno controlado.

## 9. Manejo de errores

Estrategia:

- Normalizar errores backend en una forma interna común.
- No mostrar stack traces.
- No mostrar headers.
- No mostrar API keys.
- No propagar respuestas crudas si contienen información sensible.
- Diferenciar configuración faltante, red, timeout, API key inválida, parámetros inválidos, backend no disponible, DB no disponible, datos vacíos y error inesperado.
- Mostrar mensajes breves y accionables.
- Registrar errores de forma segura en consola server-side durante Fase 1 local/controlada.
- No registrar secretos.

Categorías conceptuales:

```text
CONFIG_ERROR
AUTH_ERROR
VALIDATION_ERROR
NETWORK_ERROR
TIMEOUT_ERROR
UPSTREAM_ERROR
EMPTY_DATA
UNKNOWN_ERROR
```

## 10. Seguridad

Controles obligatorios:

- `X-API-Key` solo server-side.
- `INFONAVIT_API_KEY` nunca con `NEXT_PUBLIC_`.
- Ningún secreto en navegador.
- Ningún secreto en HTML renderizado.
- Ningún secreto en logs de cliente.
- No `localStorage` ni `sessionStorage` para secretos.
- No acceso directo a Supabase.
- No llamadas browser -> Cloud Run protegido.
- No llamadas OpenAI desde navegador.
- No stack traces visibles.
- Descargas solo local/controladas.
- Validación manual en Network tab.
- Búsqueda de `INFONAVIT_API_KEY`, `X-API-Key`, `DATABASE_URL`, `OPENAI_API_KEY` en bundle/cliente como parte de revisión.

## 11. Modelo de plataforma y módulo

Debe vivir en `platform`:

- layout general;
- navegación base;
- config/env;
- manejo de errores;
- utilidades HTTP genéricas;
- estados UI compartidos;
- preparación auth futura;
- preparación permissions/capabilities;
- controles genéricos de descarga;
- componentes base.

Debe vivir en `modules/infonavit`:

- cliente específico INFONAVIT;
- tipos del contrato INFONAVIT;
- adaptadores del reporte extendido;
- pantallas del módulo INFONAVIT;
- componentes específicos del reporte INFONAVIT;
- mapeo de parámetros del periodo;
- render específico de secciones INFONAVIT.

Compartido:

- botones;
- layouts;
- loaders;
- error banners;
- Markdown viewer;
- download controls;
- form controls;
- utilidades de fecha/formato.

Evitar sobrediseño:

- no crear sistema de plugins todavía;
- no crear marketplace de módulos;
- no abstraer motores analíticos antes del segundo módulo;
- sí dejar límites claros para que INFONAVIT no invada la plataforma.

## 12. Gráficas en Fase 1

Fase 1 debe dejar preparada la estructura para gráficas, pero no depender de gráficas completas para aceptación.

Puede incluirse una visualización básica solo si no amplía riesgo, por ejemplo:

- indicadores simples tipo summary cards;
- comparación actual vs previo si el JSON lo expone directamente.

No se exigirán gráficas completas en Fase 1 porque el objetivo principal es validar consumo seguro, estructura modular y render del reporte extendido.

Recharts queda aprobado para fases posteriores de visualización ejecutiva.

## 13. Descargas

Permitido:

- copiar Markdown;
- descargar Markdown;
- descargar JSON.

Condiciones:

- solo en entorno local/controlado;
- no exposición pública;
- sin PDF;
- sin IA;
- sin datos obtenidos fuera de API autorizada;
- si la app se expone fuera del entorno controlado, descargas deben deshabilitarse hasta tener auth/permisos.

Nomenclatura sugerida:

```text
infonavit_extended_report_<current_year>_vs_<previous_year>_m<month_limit>.json
infonavit_extended_report_<current_year>_vs_<previous_year>_m<month_limit>.md
```

Riesgos:

- distribución no controlada de información;
- archivos compartidos fuera del entorno previsto;
- confusión entre datos oficiales y reporte preliminar;
- necesidad futura de auditoría.

## 14. Preparación futura para IA y PDF

IA y PDF son obligatorios en fases posteriores, pero no se implementan en Fase 1.

La arquitectura debe permitir:

- agregar capability `use_ai`;
- agregar capability `download_pdf`;
- agregar cliente server-side para endpoints IA;
- agregar generación PDF server-side;
- agregar control de permisos antes de invocar IA o PDF;
- agregar auditoría futura de descargas;
- evitar llamadas OpenAI desde navegador;
- evitar generación PDF en browser para producción.

Principio futuro:

```text
Browser
  -> Next.js server-side
    -> Validación de sesión/capability
      -> API backend o generador PDF server-side
```

## 15. Pruebas mínimas esperadas

Validaciones esperadas:

- configuración:
  - falta `INFONAVIT_API_BASE_URL`;
  - falta `INFONAVIT_API_KEY`;
- cliente API server-side:
  - health OK;
  - DB health OK;
  - reporte JSON OK;
  - reporte Markdown OK;
- seguridad:
  - `X-API-Key` no aparece en Network tab;
  - `INFONAVIT_API_KEY` no aparece en bundle cliente;
  - no hay `NEXT_PUBLIC_INFONAVIT_API_KEY`;
  - no hay Supabase directo;
- UI:
  - render con datos válidos;
  - render con datos vacíos;
  - loader;
  - error controlado;
- errores:
  - `401`;
  - `422`;
  - timeout;
  - endpoint no disponible;
- acciones:
  - copiar Markdown;
  - descargar Markdown local/controlado;
  - descargar JSON local/controlado;
- arquitectura:
  - separación `platform` vs `modules/infonavit`;
  - no lógica INFONAVIT dentro de componentes genéricos.

## 16. Criterios de aceptación

Fase 1 queda aceptada si:

- La app funciona en entorno local/controlado.
- Existe separación clara entre plataforma y módulo INFONAVIT.
- Todas las llamadas a INFONAVIT ocurren server-side.
- El navegador nunca recibe `X-API-Key`.
- `INFONAVIT_API_KEY` no usa prefijo `NEXT_PUBLIC_`.
- Se visualiza estado de API.
- Se visualiza estado de DB.
- Se puede seleccionar periodo.
- Se consume reporte extendido JSON.
- Se consume reporte extendido Markdown.
- Se renderiza el reporte extendido.
- Se puede copiar Markdown.
- Se puede descargar Markdown/JSON solo local/controlado.
- Se manejan `401`, `422`, timeout, API no disponible, DB no disponible y configuración faltante.
- No hay acceso directo a Supabase.
- No hay IA.
- No hay PDF.
- No hay ETL.
- No hay migraciones.
- No hay cambios backend.
- No hay secretos visibles en UI, logs cliente o Network tab.

## 17. Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación | Bloquea aceptación |
| --- | --- | --- | --- | --- |
| Exponer `X-API-Key` al navegador | Media | Alto | Server-side obligatorio y revisión Network tab | Sí |
| Acoplar la app a INFONAVIT | Alta | Alto | Separar `platform` y `modules/infonavit` | Sí |
| Ampliar Fase 1 con IA/PDF | Media | Medio | Mantener alcance cerrado | Sí |
| Falta de API key local | Media | Medio | Error de configuración claro | Sí para aceptación funcional |
| Contrato JSON inesperado | Media | Medio | Adaptadores y manejo de datos vacíos | No |
| `422` por parámetros inválidos | Media | Bajo | Validación de formulario | No |
| Timeout de Cloud Run | Media | Medio | Timeout controlado y mensaje claro | No |
| Descargas usadas fuera de entorno controlado | Media | Alto | Bloquear si no es local/controlado | Sí si app se expone |
| Stack trace visible | Media | Alto | Normalización de errores | Sí |
| Supabase directo por error | Baja | Alto | Regla explícita y revisión de código | Sí |
| Sobrediseño de módulos | Media | Medio | Abstracción moderada | No |
| Falta de pruebas mínimas | Media | Medio | Checklist post-build | Sí |

## 18. Entregables esperados

Para una implementación posterior, los entregables esperados serán:

- app local funcional;
- base Next.js + TypeScript + Tailwind;
- estructura modular inicial;
- cliente API INFONAVIT server-side;
- configuración privada de variables;
- `.env.example` sin valores reales;
- pantalla dashboard inicial;
- selector de periodo;
- estado API/DB;
- render de reporte extendido JSON/Markdown;
- vista Markdown;
- copiar Markdown;
- descarga Markdown/JSON local/controlada;
- manejo de errores;
- validación de seguridad;
- pruebas mínimas o checklist verificable;
- documentación mínima de operación local;
- checklist post-build.

## 19. Plan de validación post-build

Validación sugerida después de construir Fase 1:

- Ejecutar lint/typecheck/test si existen.
- Ejecutar app local.
- Confirmar variables privadas.
- Probar sin `INFONAVIT_API_KEY`.
- Probar con API key inválida.
- Probar health y DB health.
- Probar reporte JSON.
- Probar reporte Markdown.
- Probar parámetros inválidos para validar `422`.
- Simular timeout o backend no disponible.
- Revisar Network tab:
  - no `X-API-Key`;
  - no llamada browser directa a Cloud Run protegido;
  - no secretos en payloads.
- Buscar en código/bundle referencias indebidas:
  - `NEXT_PUBLIC_INFONAVIT_API_KEY`;
  - `DATABASE_URL`;
  - `SUPABASE`;
  - `OPENAI_API_KEY`.
- Validar copiar Markdown.
- Validar descarga Markdown/JSON solo local/controlada.
- Confirmar que no hubo cambios al backend.
- Confirmar que no hay ETL, migraciones ni acceso Supabase directo.
- Revisar que INFONAVIT esté aislado como módulo.

Comandos sugeridos para futura validación:

```text
npm run lint
npm run typecheck
npm run test
npm run build
```

## 20. Decisiones pendientes después de Fase 1

Quedarán pendientes:

- proveedor de autenticación;
- modelo final de sesión;
- capabilities/permisos implementados;
- roles que agrupan permisos;
- integración IA;
- límites/cuotas IA;
- generación PDF server-side;
- hosting productivo final;
- Secret Manager productivo;
- observabilidad/logging;
- auditoría de descargas;
- branding visual;
- sistema de diseño;
- gráficas ejecutivas completas;
- segundo módulo analítico;
- estrategia de costos;
- runbook productivo;
- política de datos descargables.

## 21. Recomendación final

Fase 1 queda lista como definición cerrada para revisión y aprobación.

La siguiente ronda, solo con autorización explícita, podrá ser la implementación controlada de Fase 1 con alcance limitado a reporte extendido INFONAVIT read-only, consumo server-side, entorno local/controlado y validación de seguridad.

No queda autorizada por este documento ninguna implementación, scaffold, instalación, commit, push, deploy ni cambio backend.
