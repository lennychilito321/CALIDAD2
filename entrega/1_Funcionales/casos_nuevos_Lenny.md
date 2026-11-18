# Casos nuevos – Lenny Chilito (F2 Convocatorias)

Archivo de pruebas: `cypress/e2e/aspirante/convocatorias_extra.cy.js`. Zona pública de UniDoc, sin sesión y solo de lectura.
Ejecución: 2026-11-17, `npx cypress run --spec cypress/e2e/aspirante/convocatorias_extra.cy.js` (Cypress 13.17.0, Electron 118, Node v24.20.0, Windows 11).
Los casos se diseñaron explorando la app real el mismo día: lista pública (9 convocatorias), ventana "Detalles de la Convocatoria" y API pública `/convocatorias-app/api/publico/convocatorias`.

| ID | Funcionalidad | Descripción | Precondiciones | Pasos | Datos | Resultado esperado | Prioridad | Tipo | Auto | Resultado obtenido | Fecha |
|---|---|---|---|---|---|---|---|---|---|---|---|
| FUN-25 | Convocatorias | Sin sesión, "Iniciar sesión para postularse" lleva al login | Sin sesión; existe una convocatoria abierta | 1. Abrir `/convocatorias-publicas` 2. Pulsar "Iniciar sesión para postularse" | — | Ruta `/convocatorias-app/inicio-sesion` con el campo de correo visible | Alta | Positivo | Sí | **Aprobado** | 2026-11-17 |
| FUN-26 | Convocatorias | "Ver Detalles" abre el detalle y "Cerrar" lo cierra | Sin sesión | 1. Pulsar el primer "Ver Detalles" 2. Verificar el detalle 3. Pulsar "Cerrar" | — | Se ven "Detalles de la Convocatoria" e "Información del Cargo"; al cerrar, desaparece | Media | Positivo | Sí | **Aprobado** | 2026-11-17 |
| FUN-27 | Convocatorias | La página muestra tantas convocatorias como la API pública | Sin sesión | 1. Consultar la API pública 2. Contar los botones "Ver Detalles" | — | API responde 200 y el número de tarjetas es igual al de convocatorias (9) | Media | Positivo | Sí | **Aprobado** | 2026-11-17 |
| FUN-28 | Convocatorias | El estado del detalle coincide con el de la tarjeta | Sin sesión | 1. Leer el estado de la primera tarjeta 2. Abrir su detalle 3. Leer el estado del detalle | Convocatoria "ejm" | Mismo estado en ambos lugares | Alta | Negativo | Sí | **Fallido** → DEF-01 | 2026-11-17 |
| FUN-29 | Convocatorias | La fecha de cierre mostrada coincide con la de la API | Sin sesión; convocatoria abierta | 1. Leer "Cierre" en la tarjeta abierta 2. Compararlo con `fecha_cierre` de la API | "Docente de Algebra moderna" | Mismo día | Alta | Negativo | Sí | **Fallido** → DEF-02 | 2026-11-17 |

**Resumen F2:** 5 casos, 5 automatizados, 3 aprobados, 2 fallidos (por defectos reales de la aplicación).

## Defectos encontrados

| ID | Título | Caso | Pasos para reproducir | Resultado esperado | Resultado obtenido | Severidad | Prioridad | Evidencia |
|---|---|---|---|---|---|---|---|---|
| DEF-01 | El detalle de una convocatoria muestra un estado distinto al de su tarjeta | FUN-28 | 1. Abrir `/convocatorias-app/convocatorias-publicas` sin sesión 2. En la tarjeta "ejm" se lee **Cerrada** 3. Pulsar "Ver Detalles" | El detalle indica **Cerrada** | El detalle indica **Abierta** | Media | Alta | Fallo de FUN-28 (`expected 'Abierta' to equal 'Cerrada'`), captura en `cypress/screenshots/` |
| DEF-02 | Las fechas de cierre se muestran un día antes | FUN-29 | 1. Consultar `/convocatorias-app/api/publico/convocatorias` 2. "Docente de Algebra moderna" tiene `fecha_cierre` = 2026-12-26T00:00:00Z 3. Ver su tarjeta en la lista pública | "Cierre 26 dic 2026" | "Cierre **25** dic 2026" | Media | Alta | Fallo de FUN-29 (`'25 dic 2026'` frente a `'26 dic 2026'`) |
| DEF-03 | Datos de prueba visibles en producción | (exploración) | Abrir la lista pública y el detalle de "ejm" | Solo convocatorias reales | Convocatoria "ejm" con descripción "hbnnjoibvdedrtfyguhjik", solicitante "jaja" y "Cargo"/"Facultad" vacíos | Baja | Media | Texto de la lista pública y del detalle (exploración 17-nov) |

**Análisis:**
- **DEF-02** afecta a todas las fechas que llegan a medianoche UTC. Al convertirlas a la hora de Colombia (UTC−5) quedan en el día anterior. Esto también ocurre en el detalle ("Cierre 16 de noviembre" con API = 17). El aspirante puede creer que el plazo cerró un día antes.
- **DEF-01 tiene relación con la API:** la API marca como "Abierta" 6 convocatorias cuya fecha de cierre ya pasó, mientras la lista las muestra "Cerrada". Hipótesis: la tarjeta calcula el estado por fecha y el detalle usa el campo `estado_convocatoria`, que no se actualiza al vencer.
- **Observación adicional (no automatizada):** la API pública devuelve campos internos (`solicitante`, `aprobaciones`, `created_at`, `updated_at`) que el aspirante no necesita. Se recomienda revisarlo con el equipo de seguridad.
