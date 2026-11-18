# Reparto del trabajo – Calidad de Software II (rol Aspirante, UniDoc)

Objetivo: que los cuatro tengan **la misma carga** y **commits propios y reales**. El trabajo ya tiene una primera versión; ahora cada integrante es **dueño** de tres paquetes: los revisa, los mejora, los ejecuta de nuevo y los firma con sus commits.

## Reglas generales
- Solo `nova.uniautonoma.edu.co`, solo rol **Aspirante**, sin explotar nada, máximo **20 peticiones/segundo**.
- No se repite el escaneo de OpenVAS sin permiso del docente. El análisis se hace sobre el reporte ya generado.
- Nunca subir contraseñas ni `cypress.env.json`.
- Nada inventado: solo resultados de pruebas realmente ejecutadas. Lo que no se pudo probar se declara como limitación.

## Los 12 paquetes (3 por persona, ≈ 2 horas cada uno)

| Paquete | Tipo | Descripción | Archivos | Dueño |
|---|---|---|---|---|
| **F1** | Funcional | Autenticación y registro: revisar FUN-01 a FUN-04 y FUN-18; agregar **2 casos nuevos** vistos en la app real (ejemplo: correo con espacios, registro paso 2) | `cypress/e2e/auth/`, `cypress/e2e/publico/` | Miguel |
| **F2** | Funcional | Convocatorias (públicas y con sesión): revisar FUN-11, 12, 17 y 19; agregar **2 casos nuevos** (ejemplo: botón "Iniciar sesión para postularse") | `cypress/e2e/aspirante/`, `cypress/e2e/publico/` | Lenny |
| **F3** | Funcional | Perfil, postulaciones y permisos: revisar FUN-10, 13, 14, 15 y 16; conseguir una **URL real de otro rol** para que FUN-16 sea evidencia válida | `cypress/e2e/aspirante/` | Calet |
| **F4** | Funcional | Validaciones transversales: casos negativos adicionales (campos vacíos, datos inválidos) en los formularios visibles; coordinar con el docente el permiso para FUN-15 | `cypress/e2e/` | Luis |
| **R1** | Rendimiento | Ejecutar de nuevo carga y estrés con Vegeta (≤ 20 req/s) y guardar los resultados | `rendimiento/resultados/` | Lenny |
| **R2** | Rendimiento | Análisis: comparar con la primera corrida, gráfica con `vegeta plot`, conclusiones propias | `entrega/2_Rendimiento/` | Calet |
| **V1** | Vulnerabilidades | Analizar en detalle VUL-01 a VUL-04 en el informe 3, verificando contra el CSV | `entrega/3_Vulnerabilidades/` | Miguel |
| **V2** | Vulnerabilidades | Analizar VUL-05 a VUL-07, revisar matriz de riesgo y plan de remediación; escribir `seguridad/resumen_csv.py` | `seguridad/`, `entrega/3_Vulnerabilidades/` | Luis |
| **D1** | Documento | Informe 1, secciones 1 a 7 (resumen, alcance, estrategia, trazabilidad): actualizar con los casos nuevos | `entrega/1_Funcionales/` | Miguel |
| **D2** | Documento | Portada, README, regenerar los PDF, integrar los aportes y entregar | `entrega/`, `README.md` | Lenny |
| **D3** | Documento | Informe 2 completo: redactar con sus resultados R1 y R2 | `entrega/2_Rendimiento/` | Calet |
| **D4** | Documento | Informe 3 redacción final y revisión de las secciones 8 a 13 del informe 1 | `entrega/3_Vulnerabilidades/`, `entrega/1_Funcionales/` | Luis |

## Resumen por persona
| Persona | Funcional | Rendimiento / Seguridad | Documento |
|---|---|---|---|
| **Miguel Llantén** | F1 Autenticación y registro | V1 Hallazgos VUL-01..04 | D1 Informe 1 (secciones 1–7) |
| **Lenny Chilito** | F2 Convocatorias | R1 Ejecución de Vegeta | D2 Portada, README, PDF y entrega |
| **Calet Ibarra** | F3 Perfil, postulaciones y permisos | R2 Análisis de rendimiento | D3 Informe 2 |
| **Luis Ramos Sanjuan** | F4 Validaciones transversales | V2 Hallazgos VUL-05..07 y script | D4 Informe 3 y revisión final |

## Revisión cruzada (cada Pull Request lo aprueba otra persona)
Miguel → lo revisa Lenny · Lenny → lo revisa Calet · Calet → lo revisa Luis · Luis → lo revisa Miguel.
Revisar = leer el cambio, correr las pruebas si aplica y dejar al menos un comentario.

## Cuándo se considera terminado un paquete
- Su código o documento está en `main` mediante Pull Request aprobado.
- Si es una prueba: pasa con `npx cypress run` en el computador del dueño.
- Si es un resultado: tiene su archivo de salida original en el repo.
- Si es texto: está escrito con las palabras de su dueño.

## Cronograma
| Cuándo | Qué |
|---|---|
| Primera hora | Preparación (clonar, `npm install`, `npm run cy:publico`) |
| Siguientes 4 a 5 horas | Paquetes F, R y V |
| Antes de la entrega | Paquetes D, revisiones cruzadas y regenerar PDF (Lenny) |

## Control de equidad
Al final, cada uno debería tener 3 paquetes, 3 o más commits y 1 revisión hecha. Se comprueba en GitHub → Insights → Contributors.
