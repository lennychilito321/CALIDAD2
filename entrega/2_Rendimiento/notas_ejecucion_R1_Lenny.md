# R1 – Ejecución de Vegeta (Lenny Chilito)

## Datos de la ejecución
| Elemento | Valor |
|---|---|
| Fecha y hora | 2026-11-17, carga 23:15–23:20 y estrés 23:20–23:30 (hora local, UTC−5) |
| Equipo | AMD Ryzen 5 3600 (6 núcleos), 31,4 GB de RAM, Windows 11 |
| Conexión | Red doméstica externa a la universidad |
| Herramienta | Vegeta v12.12.0 |
| Objetivo | `/convocatorias-app/`, `/convocatorias-app/convocatorias-publicas`, `/convocatorias-app/inicio-sesion` (solo GET, rotación en partes iguales; ver `R1_Lenny/targets-aspirante.txt`) |
| Comando de carga | `run-vegeta.ps1 -Modo carga -MaxRps 5 -DuracionNivel 60` |
| Comando de estrés | `run-vegeta.ps1 -Modo estres -MaxRps 20 -DuracionNivel 60` |
| Tope | 20 req/s (límite del grupo; sin límite escrito del docente) |
| Incidentes | Ninguno. El script vive fuera del repo porque la carpeta `rendimiento/` se retiró de esta rama |

Salidas originales completas (`.txt` e histogramas): `entrega/2_Rendimiento/R1_Lenny/carga_20261117_2315/` y `.../estres_20261117_2320/`.

## Resultados (todas las peticiones con código 200, 0 % de errores)
**Carga**
| req/s | Peticiones | p50 | p95 | p99 | Máx | Throughput |
|---|---|---|---|---|---|---|
| 1 | 60 | 34,4 ms | 38,6 ms | 116,5 ms | 125,1 ms | 1,02 |
| 2 | 120 | 34,2 ms | 39,3 ms | 87,2 ms | 181,4 ms | 2,02 |
| 3 | 180 | 33,8 ms | 42,4 ms | 95,3 ms | 416,7 ms | 3,02 |
| 5 | 300 | 34,0 ms | 47,1 ms | 57,2 ms | 169,8 ms | 5,01 |

**Estrés**
| req/s | Peticiones | p50 | p95 | p99 | Máx | Throughput |
|---|---|---|---|---|---|---|
| 2 | 120 | 34,5 ms | 53,0 ms | 248,7 ms | 608,3 ms | 2,02 |
| 5 | 300 | 34,3 ms | 41,2 ms | 73,3 ms | 125,1 ms | 5,01 |
| 10 | 600 | 34,1 ms | 47,3 ms | 55,9 ms | 115,7 ms | 10,01 |
| 15 | 900 | 33,3 ms | 38,4 ms | 48,7 ms | 153,7 ms | 15,01 |
| 20 | 1 200 | 33,1 ms | 38,6 ms | **376,6 ms** | **952,2 ms** | 20,01 |
| Recuperación 1 | 30 | 34,5 ms | 43,6 ms | 112,5 ms | 112,5 ms | 1,03 |

## Comparación con la primera ejecución (16-nov, informe 2)
| req/s | p95 16-nov | p95 17-nov | p99 16-nov | p99 17-nov | Máx 16-nov | Máx 17-nov |
|---|---|---|---|---|---|---|
| 5 (carga) | 39,4 ms | 47,1 ms | 54,9 ms | 57,2 ms | 108,5 ms | 169,8 ms |
| 10 | 49,4 ms | 47,3 ms | 59,5 ms | 55,9 ms | 102,4 ms | 115,7 ms |
| 20 | 46,4 ms | 38,6 ms | 64,5 ms | **376,6 ms** | 175,6 ms | **952,2 ms** |

## Observaciones
- Se cumplen los criterios de aceptación en todos los niveles (p95 < 2 s, p99 < 5 s, 0 % de errores). La mediana se mantiene estable en ≈ 34 ms, igual que el 16-nov.
- **A 20 req/s apareció una cola de latencia** que no se vio en la primera corrida: p99 de 376,6 ms y máximo de 952,2 ms, aunque el p95 siguió en 38,6 ms. Es decir, alrededor del 1 % de las peticiones tardó entre 10 y 25 veces la mediana. Puede ser la primera señal de saturación cerca del tope o ruido de la red; con una sola repetición no se puede distinguir.
- También hubo picos aislados (2 req/s del estrés con máximo de 608 ms; 3 req/s de la carga con 417 ms) que no siguen la carga, lo que apunta a variación de red más que del servidor.
- Tras bajar a 1 req/s, la latencia volvió a valores normales (p50 34,5 ms): no se observó efecto residual.
- Recomendación para R2/D3: repetir el nivel de 20 req/s dos o tres veces para confirmar si la cola de latencia es reproducible antes de concluir un punto de degradación.
