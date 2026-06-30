# Fase 0 - Decisiones de arranque

> **Nota de vigencia documental**
>
> Este documento se conserva como evidencia historica de la fase o decision que describe.
> El estado operativo vigente del proyecto se documenta en
> `docs/ESTADO_ACTUAL_CLOSED_ALPHA.md`.
> Si existe diferencia entre este documento y el baseline vigente, prevalece el baseline.

Proyecto: `003_control_dashboard_platform`

Este documento consolida las decisiones de arranque para construir una plataforma reusable de reportería económica y tableros analíticos. INFONAVIT será el primer módulo conectado, no el límite arquitectónico del proyecto.

## 1. Naturaleza del proyecto

`003_control_dashboard_platform` será una plataforma visual escalable para:

- reportería económica;
- tableros de control;
- consumo de APIs analíticas;
- visualización de indicadores;
- análisis asistido por IA;
- generación futura de reportes;
- integración futura de múltiples motores analíticos.

INFONAVIT será únicamente el primer caso de uso conectado, aprovechando el backend existente en `infonavit-strategic-report`.

## 2. Entorno inicial y destino productivo

Fase 1 se desarrollará inicialmente en un entorno local/controlado, sin exposición pública.

La arquitectura debe mantenerse compatible con despliegue server-side posterior.

Recomendación productiva objetivo:

- Cloud Run, por alineación con el backend actual.
- Secret Manager para manejo de secretos productivos.
- Logging y monitoreo dentro de GCP.
- Mejor preparación para PDF server-side, autenticación, autorización y módulos analíticos adicionales.

Alternativa táctica:

- Vercel, si se prioriza velocidad de despliegue de Next.js y la primera versión productiva no requiere generación PDF server-side pesada ni controles operativos avanzados en GCP.

## 3. Autenticación en Fase 1

Fase 1 no requiere login real desde el inicio.

Puede operar en ambiente local/controlado, pero la arquitectura debe quedar preparada para incorporar autenticación y autorización en fases posteriores.

Si la aplicación se expone fuera del entorno local/controlado, deberá incorporarse autenticación antes de permitir acceso a reportes, descargas o funcionalidades IA.

## 4. Consumo server-side obligatorio

Todas las llamadas a la API INFONAVIT deben realizarse desde la capa server-side del frontend.

Permitido:

```text
Browser -> Next.js server-side -> Cloud Run API
```

No permitido:

```text
Browser -> Cloud Run API con X-API-Key
```

El navegador nunca debe recibir, almacenar, mostrar ni transmitir `X-API-Key`.

`INFONAVIT_API_KEY` nunca debe declararse como:

```text
NEXT_PUBLIC_INFONAVIT_API_KEY
```

## 5. Alcance funcional de Fase 1

Fase 1 se limitará al consumo read-only del reporte extendido INFONAVIT.

Debe dejar fuera IA y PDF de la implementación inicial, pero la estructura deberá quedar preparada para integrar ambas capacidades en fases posteriores sin rediseñar la arquitectura base.

## 6. Descargas en Fase 1

En Fase 1 se permite:

- visualizar el reporte extendido;
- copiar Markdown;
- descargar Markdown/JSON únicamente en entorno local/controlado, sin exposición pública.

No permitido en Fase 1:

- descarga PDF;
- descargas públicas;
- descargas sin control si la app se expone fuera del entorno local/controlado.

## 7. Autorización futura

La autorización futura debe modelarse por capabilities/permisos, no únicamente por roles rígidos.

Permisos base sugeridos:

```text
view_report
download_markdown
download_json
use_ai
download_pdf
admin_users
```

Los roles futuros podrán agrupar permisos, pero la lógica de autorización debe pensarse por capability para evitar rigidez.

## 8. Gráficas

Recharts será la librería inicial recomendada para gráficas ejecutivas.

Si en fases posteriores aparecen visualizaciones más complejas, se evaluará ECharts u otra librería especializada.

## 9. Exclusiones estructurales

Fase 1 no incluirá PDF ni IA, aunque ambos forman parte obligatoria del proyecto en fases posteriores.

Los siguientes elementos quedan fuera del alcance del proyecto frontend/plataforma visual, no solo fuera de Fase 1:

- ETL;
- migraciones;
- administración de Supabase;
- administración de secretos productivos;
- modificación de datos;
- cambios al backend.

El proyecto será una plataforma visual de consumo, reportería, análisis asistido, visualización y exportación controlada.

No será una herramienta de operación de datos, carga, migración ni administración del backend.

El acceso directo a Supabase desde el frontend queda prohibido.

Supabase puede seguir siendo usado por el backend como fuente de datos administrada, pero el frontend deberá consumir información únicamente mediante APIs autorizadas.

PDF e IA deberán implementarse posteriormente de forma server-side, controlada y sin exposición de secretos.

## 10. Decisiones que bloquearon Fase 1 y quedaron cerradas

| Decision | Estado |
| --- | --- |
| Naturaleza de plataforma reusable | Aprobada |
| INFONAVIT como primer módulo | Aprobada |
| Entorno inicial local/controlado | Aprobado |
| Cloud Run como recomendación productiva objetivo | Aprobado |
| Vercel como alternativa táctica | Aprobado |
| Sin login real en Fase 1 | Aprobado |
| Preparación para auth futura | Aprobada |
| Consumo server-side obligatorio | Aprobado |
| No exposición de `X-API-Key` | Aprobado |
| Fase 1 limitada a reporte extendido read-only | Aprobada |
| Descargas Markdown/JSON solo local/controladas | Aprobadas |
| Autorización futura por capabilities | Aprobada |
| Recharts como librería inicial recomendada | Aprobada |
| PDF e IA fuera de Fase 1 | Aprobado |
| ETL, migraciones, Supabase directo y cambios backend fuera del frontend | Aprobado |

## 11. Decisiones que pueden diferirse

- Proveedor final de autenticación.
- Modelo final de sesión.
- Roles definitivos.
- Implementación de capabilities.
- Generación PDF server-side.
- Integración IA.
- Cuotas o límites de IA.
- Auditoría de descargas.
- Observabilidad productiva.
- Branding visual.
- Segundo módulo analítico.
- Estrategia de costos.
- Hosting productivo final, si la primera etapa permanece local/controlada.

## 12. Riesgos de iniciar sin respetar Fase 0

| Riesgo | Impacto | Control |
| --- | --- | --- |
| Convertir la app en frontend exclusivo de INFONAVIT | Alto | Separar plataforma y módulo INFONAVIT |
| Exponer `X-API-Key` al navegador | Alto | Consumo server-side obligatorio |
| Incluir IA o PDF demasiado pronto | Medio/Alto | Mantener Fase 1 acotada |
| Publicar sin auth | Alto | Mantener entorno local/controlado o agregar auth antes de exponer |
| Implementar descargas públicas sin permisos | Alto | Descargas solo local/controladas en Fase 1 |
| Acceder directo a Supabase | Alto | Prohibir acceso directo desde frontend |
| Modificar backend por necesidades frontend | Alto | Consumir solo contrato existente en Fase 1 |

## 13. Resultado de Fase 0

Fase 0 queda cerrada como base de decisión para preparar e implementar posteriormente una Fase 1 controlada.

No autoriza por sí misma scaffold, instalación de dependencias, commits, push, deploy ni cambios al backend.
