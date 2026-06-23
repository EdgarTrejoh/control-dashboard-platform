# Nota tecnica - Audit de dependencias Fase 1

## Contexto

Despues de reinstalar dependencias con Node 22 LTS, `npm install` reporto:

```text
2 moderate severity vulnerabilities
```

El detalle de `npm audit` indica:

```text
postcss <8.5.10
PostCSS has XSS via Unescaped </style> in its CSS Stringify Output
node_modules/next/node_modules/postcss
next 9.3.4-canary.0 - 16.3.0-canary.5 depends on vulnerable versions of postcss
```

La correccion sugerida por npm fue:

```text
npm audit fix --force
Will install next@9.3.3, which is a breaking change
```

## Evaluacion

No se debe ejecutar `npm audit fix --force`.

Motivo:

- degradaria Next.js desde 15.5.19 hacia 9.3.3;
- romperia el stack actual de App Router/Next 15;
- introduce mas riesgo que el hallazgo que intenta corregir.

El hallazgo proviene de una dependencia transitiva interna de Next.js. En Fase 1 la aplicacion no procesa CSS arbitrario enviado por usuarios ni genera CSS dinamico desde input externo, por lo que el riesgo practico para el alcance actual es bajo.

## Decision para Fase 1

Este hallazgo no bloquea Fase 1 local/controlada.

No bloquea:

- lint;
- typecheck;
- build;
- test;
- cierre funcional de Fase 1.

Si bloquea o debe revisarse antes de:

- despliegue publico;
- CI/CD formal con politica estricta de `npm audit`;
- exposicion a usuarios externos;
- cualquier flujo futuro que procese CSS no confiable.

## Accion recomendada

1. No ejecutar `npm audit fix --force`.
2. Mantener Next.js en la linea actual.
3. Revisar periodicamente si una version posterior de Next actualiza su `postcss` transitivo.
4. Ejecutar en una tarea tecnica posterior:

```text
npm update next
npm audit
npm run lint
npm run typecheck
npm run build
npm run test
```

5. Si el hallazgo persiste y se requiere bloqueo de seguridad para despliegue publico, evaluar una mitigacion controlada con `overrides` solo despues de validar compatibilidad con Next.

## Registro de deuda tecnica

| Observacion | Severidad | Estado | Accion recomendada | Bloquea Fase 1 | Bloquea despliegue publico |
| --- | --- | --- | --- | --- | --- |
| `npm audit` reporta `postcss <8.5.10` transitivo dentro de Next.js. | Moderada | Riesgo transitorio aceptado para Fase 1 local | No usar `npm audit fix --force`; esperar update seguro de Next o evaluar override controlado. | No | Revisar antes de despliegue publico |
| `npm audit fix --force` propone instalar `next@9.3.3`. | Alta si se aplica | Rechazado | No ejecutar el fix automatico con `--force`. | No | Si, si alguien lo aplica sin revision |
