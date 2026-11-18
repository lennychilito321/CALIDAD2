# Informe 2 – Rendimiento (carga y estrés) · Nova / UniDoc · Aspirante

## 1. Portada y control de versiones
Grupo: sin número asignado · Integrantes: ver la portada de este documento · Aplicación: UniDoc – Aspirante · Fechas: 2026-11-16 y 2026-11-17 · v1.1 · Autores: Lenny Chilito (ejecuciones 1 y 2). Pendiente: análisis y redacción final de Calet Ibarra (paquetes R2 y D3)

## 2. Resumen ejecutivo
Los flujos públicos que usa un aspirante (inicio de UniDoc, listado de convocatorias, pantalla de inicio de sesión) respondieron **sin ningún error en 4 440 peticiones** (1 – 20 peticiones por segundo) en la primera ejecución (16-nov). La mediana fue ≈33 ms y el p95 nunca superó 53 ms, muy por debajo del umbral de 2 s. En esa ejecución **no se encontró punto de degradación ni de ruptura dentro del tope probado (20 req/s)**; la capacidad real por encima de ese valor es desconocida porque el tope fue autoimpuesto. Una **segunda ejecución** el 17-nov (otras 4 440 peticiones, también sin errores) confirmó la mediana de ≈34 ms, pero a 20 req/s mostró una **cola de latencia**: el 1 % más lento llegó a 377 ms (p99) y una petición a 952 ms. Es la primera señal posible de saturación cerca del tope, y debe confirmarse repitiendo ese nivel. Recomendación: repetir el estrés con el límite que fije el docente y probar flujos autenticados.

## 3. Objetivos y alcance
Probados (solo GET): `/convocatorias-app/`, `/convocatorias-app/convocatorias-publicas`, `/convocatorias-app/inicio-sesion`. Fuera de alcance: inicio de sesión con Google, postulación, carga de documentos y cualquier escritura.

## 4. Sistema bajo prueba y escenarios
Son las tres primeras pantallas del recorrido del aspirante (descubrir convocatorias e ingresar). Las peticiones rotan por las 3 URL en partes iguales.

## 5. Entorno de pruebas
Cliente: PC Windows 11, AMD Ryzen 5 3600 (6 núcleos, 12 hilos), 31,4 GB RAM, red externa a la universidad. Servidor: `nova.uniautonoma.edu.co` (resuelve como alias de `utm.uniautonoma.edu.co`, 179.1.113.103; **servidor compartido con otras aplicaciones**). Herramienta: Vegeta v12.12.0. Ejecución 1: 16-nov-2026, 23:23–23:36. Ejecución 2: 17-nov-2026, 23:15–23:30 (hora local, UTC−5), mismo equipo y red; ventana indicada por el estudiante.

## 6. Criterios de aceptación (definidos antes de ejecutar)
p95 < 2 s; p99 < 5 s; errores < 1 %; sin respuestas 5xx. Justificación: tiempos habituales de percepción de "respuesta aceptable" en páginas de consulta.

## 7. Diseño de las pruebas
- **PER-01 – Carga (uso esperado):** 1, 2, 3 y 5 req/s, 60 s por escalón, 20 s de pausa.
- **PER-02 – Estrés (progresivo):** 2, 5, 10, 15 y 20 req/s, 60 s por escalón, 20 s de pausa, más recuperación a 1 req/s durante 30 s.
- **Tope:** 20 req/s, definido por el grupo de forma conservadora al no haber un límite escrito del docente. Sin tiempos de espera entre peticiones (tasa constante), timeout 30 s.

## 8. Ejecución
```
.\rendimiento\run-vegeta.ps1 -Modo carga  -MaxRps 5  -DuracionNivel 60
.\rendimiento\run-vegeta.ps1 -Modo estres -MaxRps 20 -DuracionNivel 60
```
Incidente: la primera corrida de carga se descartó porque PowerShell 5.1 corrompía la salida binaria de Vegeta; se corrigió el script (`cmd /c`) y se repitió completa. Los resultados de la ejecución 1 son de la corrida válida (carpetas `carga_20261116_2323` y `estres_20261116_2329`). La ejecución 2 usó los mismos comandos y no tuvo incidentes (`R1_Lenny/`).

## 9. Resultados (todos con 100 % de éxito, código 200)
**Carga**
| req/s | Peticiones | p50 | p95 | p99 | Máx | Throughput | Errores |
|---|---|---|---|---|---|---|---|
| 1 | 60 | 32,7 ms | 36,8 ms | 136,5 ms | 146,1 ms | 1,02 | 0 % (200:60) |
| 2 | 120 | 33,0 ms | 52,6 ms | 80,6 ms | 104,0 ms | 2,02 | 0 % (200:120) |
| 3 | 180 | 33,6 ms | 47,1 ms | 59,7 ms | 120,8 ms | 3,01 | 0 % (200:180) |
| 5 | 300 | 33,5 ms | 39,4 ms | 54,9 ms | 108,5 ms | 5,01 | 0 % (200:300) |

**Estrés**
| req/s | Peticiones | p50 | p95 | p99 | Máx | Throughput | Errores |
|---|---|---|---|---|---|---|---|
| 2 | 120 | 32,6 ms | 49,6 ms | 115,0 ms | 221,5 ms | 2,02 | 0 % |
| 5 | 300 | 33,2 ms | 50,1 ms | 58,6 ms | 99,9 ms | 5,01 | 0 % |
| 10 | 600 | 33,0 ms | 49,4 ms | 59,5 ms | 102,4 ms | 10,01 | 0 % |
| 15 | 900 | 32,7 ms | 43,3 ms | 55,4 ms | 104,3 ms | 15,00 | 0 % |
| 20 | 1 200 | 32,3 ms | 46,4 ms | 64,5 ms | 175,6 ms | 20,01 | 0 % |
| Recuperación 1 | 30 | 34,6 ms | 56,8 ms | 106,4 ms | 106,4 ms | 1,03 | 0 % |

Histogramas y salidas completas de la ejecución 1: repositorio FinalCD2, carpeta `rendimiento/resultados/`.

### 9.1 Segunda ejecución (17-nov, Lenny – paquete R1)
**Carga**
| req/s | Peticiones | p50 | p95 | p99 | Máx | Throughput | Errores |
|---|---|---|---|---|---|---|---|
| 1 | 60 | 34,4 ms | 38,6 ms | 116,5 ms | 125,1 ms | 1,02 | 0 % |
| 2 | 120 | 34,2 ms | 39,3 ms | 87,2 ms | 181,4 ms | 2,02 | 0 % |
| 3 | 180 | 33,8 ms | 42,4 ms | 95,3 ms | 416,7 ms | 3,02 | 0 % |
| 5 | 300 | 34,0 ms | 47,1 ms | 57,2 ms | 169,8 ms | 5,01 | 0 % |

**Estrés**
| req/s | Peticiones | p50 | p95 | p99 | Máx | Throughput | Errores |
|---|---|---|---|---|---|---|---|
| 2 | 120 | 34,5 ms | 53,0 ms | 248,7 ms | 608,3 ms | 2,02 | 0 % |
| 5 | 300 | 34,3 ms | 41,2 ms | 73,3 ms | 125,1 ms | 5,01 | 0 % |
| 10 | 600 | 34,1 ms | 47,3 ms | 55,9 ms | 115,7 ms | 10,01 | 0 % |
| 15 | 900 | 33,3 ms | 38,4 ms | 48,7 ms | 153,7 ms | 15,01 | 0 % |
| 20 | 1 200 | 33,1 ms | 38,6 ms | **376,6 ms** | **952,2 ms** | 20,01 | 0 % |
| Recuperación 1 | 30 | 34,5 ms | 43,6 ms | 112,5 ms | 112,5 ms | 1,03 | 0 % |

Salidas completas: `entrega/2_Rendimiento/R1_Lenny/`. Notas de la ejecución y comparación detallada: `notas_ejecucion_R1_Lenny.md`.

## 10. Análisis de resultados
- Todos los escalones cumplen los cuatro criterios; el p95 máximo fue 56,8 ms (≈35 veces por debajo del umbral).
- La latencia es plana entre 1 y 20 req/s: no hay degradación visible en el rango probado. La recuperación a 1 req/s es igual a la del inicio, por lo que no se observó efecto residual.
- La latencia estable de ~33 ms sugiere que estas páginas son contenido estático o con caché (hipótesis, no verificada): por eso miden poco la capacidad del backend.
- **Comparación entre ejecuciones:** la mediana es igual (≈33–34 ms) y el p95 se mantiene por debajo de 53 ms en ambas. La diferencia está en la cola: a 20 req/s el p99 pasó de 64,5 ms (16-nov) a 376,6 ms (17-nov) y el máximo de 175,6 ms a 952,2 ms.
- **Interpretación:** alrededor del 1 % de las peticiones tardó entre 10 y 25 veces la mediana justo en el nivel más alto. Puede ser la primera señal de saturación o variación de la red; también hubo picos aislados a 2 y 3 req/s (608 y 417 ms) que no siguen la carga. Con dos ejecuciones no se puede distinguir.
- Punto de degradación: **posible inicio a 20 req/s en la cola de latencia (p99), sin confirmar**. Punto de ruptura: **no alcanzado** (0 % de errores en ambas ejecuciones).

## 11. Conclusiones y recomendaciones
Cumple los criterios en el rango probado. Capacidad estimada: ≥20 req/s sostenidas en estos tres flujos sin errores, con una cola de latencia a vigilar en ese nivel. Mejoras priorizadas: (1) repetir el nivel de 20 req/s varias veces y luego subir con el límite del docente, para confirmar si la cola de latencia es saturación; (2) medir flujos autenticados y dinámicos (listado desde API, detalle de convocatoria) bajo carga; (3) monitorear CPU/memoria del servidor durante la prueba.

## 12. Riesgos y limitaciones
Un solo cliente y una sola IP; red de origen externa; tope bajo autoimpuesto; servidor compartido con otras aplicaciones; posible caché/CDN que oculta el costo del backend; no se probó ningún flujo con sesión (login por Google fuera de alcance).

## 13. Anexos
Ejecución 1: script `run-vegeta.ps1`, targets y salidas en el repositorio FinalCD2 (`rendimiento/`). Ejecución 2: `entrega/2_Rendimiento/R1_Lenny/` (targets, `.txt` e histogramas) y `notas_ejecucion_R1_Lenny.md`. Los `.bin` no se versionan.
