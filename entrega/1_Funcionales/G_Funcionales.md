# Informe 1 – Pruebas funcionales · UniDoc (Nova) · Rol Aspirante

## 1. Portada y control de versiones
Portada común, integrantes y escala de severidad: ver la portada de este documento. Grupo sin número asignado.

| Versión | Fecha | Autor | Cambios |
|---|---|---|---|
| 0.1 | 2026-11-16 | Grupo | Primera suite (login, aspirante) y borrador |
| 1.0 | 2026-11-17 | Lenny Chilito | Zona pública (FUN-17 a FUN-19), corrida completa del 17-nov, evidencia y consolidación del repositorio |
| 1.1 | 2026-11-17 | Miguel Llantén | Paquete F1: casos FUN-20 a FUN-23 de autenticación y registro; secciones 1 a 7 |
| 1.2 | 2026-11-17 | Lenny Chilito | Paquete F2: casos FUN-25 a FUN-29 de convocatorias, defectos DEF-01 a DEF-03 e integración del informe |

## 2. Resumen ejecutivo
Se probó el rol **Aspirante** de UniDoc, el módulo de convocatorias de la plataforma Nova. Se diseñaron **23 casos**: inicio de sesión, recuperación de contraseña, registro, zona pública, detalle de convocatorias, perfil, postulaciones, datos personales y permisos. De ellos, **22 son automatizados con Cypress** y se ejecutaron todos: **20 aprobados y 2 fallidos**. FUN-15 (postular con el perfil incompleto) no se ejecutó a propósito, porque podría crear una postulación real en un sistema compartido.

Los 2 fallos son **defectos reales de la aplicación**, ambos en la lista pública de convocatorias:
- **DEF-01:** el detalle de una convocatoria puede mostrar un estado distinto al de su tarjeta ("Cerrada" en la lista y "Abierta" en el detalle).
- **DEF-02:** las fechas de cierre se muestran **un día antes** de la fecha real. Un aspirante puede creer que el plazo venció cuando todavía está abierto.

También se encontraron datos de prueba visibles en producción (DEF-03, severidad baja). Las validaciones del inicio de sesión y del registro funcionan bien. La principal limitación de la prueba sigue siendo el control de permisos entre roles (FUN-16), que solo se verificó contra una ruta inexistente.

**Recomendación general:** el rol Aspirante está **apto con reservas**. Antes de aprobarlo conviene corregir DEF-01 y DEF-02, probar la postulación real con permiso del docente y repetir el control de permisos con una URL real de otro rol.

## 3. Objetivo y alcance
**Objetivo:** verificar que las funciones del Aspirante se comportan como se espera, que los datos inválidos se rechazan, que la información mostrada es coherente y que el acceso está protegido.

**Dentro del alcance:**
- Inicio de sesión de UniDoc, con sus validaciones de correo y contraseña.
- Enlaces del login a registro y a recuperación de contraseña.
- Registro (pasos 1 y 2).
- Zona pública de convocatorias: listado, detalle, botón para postularse sin sesión y coherencia con la API pública.
- Inicio del aspirante (hoja de vida), listado y detalle de convocatorias con sesión, Mis postulaciones y Datos personales (8 secciones).
- Control de acceso sin sesión.

**Fuera del alcance (con justificación):**
- **Rol Docencia:** ninguna cuenta del grupo tiene ese rol. La suite existe pero está desactivada.
- **Postulación real (FUN-15), carga de documentos, edición de la hoja de vida y registro hasta el paso 5:** crean o modifican datos reales en un sistema compartido.
- **Envío del formulario de recuperación de contraseña:** mandaría correos reales. Solo se verifica que la pantalla abre.
- **Inicio de sesión con Google:** servicio de terceros que bloquea la automatización. Por eso los casos con sesión (FUN-01, FUN-10 a FUN-16) solo pueden correrlos integrantes con una cuenta de correo y contraseña de UniDoc.
- **Recepción con IA, Normativas y notificaciones:** no son parte de los flujos mínimos del rol.

## 4. Descripción de la aplicación y del rol
UniDoc es el módulo de convocatorias, avales y contratación docente de Nova (Núcleo de Operaciones Virtuales Académicas, Uniautónoma del Cauca). Vive en `/convocatorias-app` y tiene su propio inicio de sesión (`/inicio-sesion`), independiente del de Nova. La lista pública de convocatorias se alimenta de la API `/convocatorias-app/api/publico/convocatorias`, que al 17-nov devolvía 9 convocatorias.

Desde el login, el usuario puede ir al registro (`/registro`), recuperar su contraseña (`/restablecer-contrasena`, con un enlace que caduca a los 5 minutos) o entrar con Google.

El **Aspirante**:
- consulta las convocatorias, que son públicas: ve su estado, fechas de publicación y cierre, y un detalle con el cargo, la vinculación y los datos académicos;
- se registra en cinco pasos: nombre, documento (9 tipos de identificación, número de al menos 7 caracteres), datos, ubicación y cuenta;
- mantiene su hoja de vida (formación, experiencia, idiomas, aptitudes);
- completa ocho secciones de datos personales: datos personales, contacto, EPS, RUT, certificación bancaria, pensión, antecedentes judiciales y ARL;
- se postula y consulta sus postulaciones.

**Datos de prueba:** cuenta propia de un integrante, con el perfil incompleto. Las credenciales se leen de `cypress.env.json` (excluido de Git) y no aparecen en este documento. Los casos negativos usan datos ficticios (`qa.prueba.invalida@example.com`, `correo-sin-arroba`, nombre "Prueba Qa") que nunca llegan a guardarse.

## 5. Entorno de pruebas
| Elemento | Valor |
|---|---|
| URL | https://nova.uniautonoma.edu.co/convocatorias-app |
| Navegador | Electron 118, incluido en Cypress, en modo headless |
| Sistema operativo | Windows 11 Pro (equipos de Lenny y de Miguel) |
| Node.js | v24.20.0 (Lenny) · v25.8.1 (Miguel) |
| Cypress | 13.17.0 |
| Fechas de ejecución | 2026-11-16 y 2026-11-17 |

## 6. Estrategia de pruebas
- **Automatizado:** casos de lectura, validaciones de formulario, navegación, coherencia entre la página y la API, y acceso sin sesión. Son repetibles y no alteran datos. La sesión se reutiliza con `cy.session`.
- **Diseño a partir de la app real:** antes de escribir un caso se explora la pantalla y se copian textos, rutas y nombres de campos tal como aparecen. No se inventan mensajes.
- **Casos que verifican defectos:** FUN-28 y FUN-29 comparan lo que ve el aspirante con los datos de la API. Mientras la app no se corrija, deben fallar; su fallo es la evidencia del defecto.
- **Manual / omitido:** FUN-15 (postulación con perfil incompleto), por riesgo de crear datos reales; carga de documentos.
- **Organización del código:** cada integrante escribe sus casos nuevos en su propio archivo `.cy.js` (`auth/miguel.cy.js`, `aspirante/convocatorias_extra.cy.js`) para evitar conflictos en Git.
- **Criterio de entrada:** servidor accesible y autorización del docente para probar Nova; cuenta con correo y contraseña de UniDoc para los casos con sesión.
- **Criterio de salida:** todos los casos de prioridad Alta ejecutados y los defectos documentados.
- **Prioridad:** Alta = acceso, seguridad, función principal e información que afecta decisiones del aspirante; Media = validaciones y consultas secundarias; Baja = navegación y contenido informativo.

## 7. Matriz de trazabilidad
| Funcionalidad del rol | Casos |
|---|---|
| Inicio de sesión | FUN-01, FUN-02, FUN-03, FUN-20, FUN-21 |
| Navegación desde el login (registro y recuperación) | FUN-23 |
| Control de acceso | FUN-04, FUN-16 |
| Zona pública: listado de convocatorias | FUN-17, FUN-19, FUN-27 |
| Zona pública: detalle de convocatoria | FUN-26, FUN-28, FUN-29 |
| Zona pública: postularse sin sesión | FUN-25 |
| Registro de aspirante | FUN-18, FUN-22 |
| Inicio del aspirante / hoja de vida | FUN-10 |
| Listado de convocatorias (con sesión) | FUN-11 |
| Detalle de convocatoria (con sesión) | FUN-12 |
| Mis postulaciones | FUN-13 |
| Datos personales | FUN-14 |
| Postulación | FUN-15 (no ejecutado) |

## 8. Casos de prueba
| ID | Funcionalidad | Descripción | Precondiciones | Pasos | Datos de entrada | Resultado esperado | Prior. | Tipo | Auto |
|---|---|---|---|---|---|---|---|---|---|
| FUN-01 | Login | Iniciar sesión con credenciales válidas | Cuenta de prueba activa | 1. Abrir `/inicio-sesion` 2. Escribir correo y clave 3. Pulsar "Iniciar Sesión" 4. Abrir `/index` | Cuenta del grupo | Se ve "Hoja de vida" | Alta | Positivo | Sí |
| FUN-02 | Login | Rechazar credenciales inválidas | Ninguna | 1. Abrir el login 2. Escribir correo inexistente y clave falsa 3. Enviar | `qa.prueba.invalida@example.com` / clave falsa | "Credenciales incorrectas"; permanece en el login | Alta | Negativo | Sí |
| FUN-03 | Login | Rechazar campos vacíos | Ninguna | 1. Abrir el login 2. Enviar sin datos | Vacío | "Correo no valido" y "Contraseña muy corta"; permanece en el login | Media | Negativo | Sí |
| FUN-04 | Permisos | Ruta protegida sin sesión | Sin cookies | 1. Borrar cookies y almacenamiento 2. Abrir `/index` | — | No se muestra "Hoja de vida" | Alta | Permisos | Sí |
| FUN-10 | Inicio | Ver perfil y hoja de vida | Sesión de aspirante | 1. Abrir `/index` | — | Se ven "Aspirante", "Hoja de vida" y "Formación educativa" | Alta | Positivo | Sí |
| FUN-11 | Convocatorias | Listado con sesión | Sesión de aspirante | 1. Abrir `/convocatorias` | — | "Convocatorias Disponibles" con "Ver Detalles" y "Postularse" | Alta | Positivo | Sí |
| FUN-12 | Convocatorias | Abrir el detalle con sesión | Sesión; existe una convocatoria | 1. Abrir `/convocatorias` 2. Pulsar "Ver Detalles" | — | El detalle abre sin "Página no encontrada" | Media | Positivo | Sí |
| FUN-13 | Postulaciones | Ver Mis postulaciones | Sesión de aspirante | 1. Abrir `/ver/postulaciones` | — | Pantalla "Mis Postulaciones" | Media | Positivo | Sí |
| FUN-14 | Datos personales | Ver las 8 secciones | Sesión de aspirante | 1. Abrir `/datos-personales` | — | Se listan las 8 secciones | Media | Positivo | Sí |
| FUN-15 | Postulación | Postular con perfil incompleto | Sesión; perfil al 0 % | 1. Abrir convocatorias 2. Pulsar "Postularse" | — | Rechazo con mensaje de validación | Alta | Negativo | No (omitido) |
| FUN-16 | Permisos | Acceso a módulo de otro rol | Sesión de aspirante | 1. Abrir `/talento-humano` | Ruta de ejemplo | Acceso denegado o 404 | Alta | Permisos | Sí (débil) |
| FUN-17 | Convocatorias | Listado público sin sesión | Sin sesión | 1. Abrir `/convocatorias-publicas` | — | Listado con "Ver Detalles" | Alta | Positivo | Sí |
| FUN-18 | Registro | Paso 1 sin nombre ni apellido | Sin sesión | 1. Abrir `/registro` 2. "Siguiente" sin datos | Vacío | Permanece en "Paso 1 de 5" | Media | Negativo | Sí |
| FUN-19 | Convocatorias | Convocatoria cerrada | Existe una cerrada | 1. Abrir `/convocatorias-publicas` 2. Localizar "Convocatoria cerrada" | — | El botón está deshabilitado | Media | Negativo | Sí |
| FUN-20 | Login | Correo con formato inválido | Sin sesión | 1. Abrir `/inicio-sesion` 2. Correo sin "@" y una clave 3. Enviar | `correo-sin-arroba` / `ClaveFalsa#123` | "Correo no valido"; permanece en el login | Media | Negativo | Sí |
| FUN-21 | Login | Contraseña demasiado corta | Sin sesión | 1. Abrir `/inicio-sesion` 2. Correo válido y clave de 3 caracteres 3. Enviar | `qa.prueba.invalida@example.com` / `123` | "Contraseña muy corta", sin error de correo; permanece en el login | Media | Negativo | Sí |
| FUN-22 | Registro | Paso 2 sin identificación | Sin sesión | 1. `/registro` 2. Nombre y apellido 3. "Siguiente" 4. "Siguiente" en el paso 2 vacío | `Prueba` / `Qa` | "Faltan 2 datos en este paso" con dos mensajes; permanece en "Paso 2 de 5" | Media | Negativo | Sí |
| FUN-23 | Login | Enlaces de registro y recuperación | Sin sesión | 1. `/inicio-sesion` 2. "Regístrate aquí" 3. Volver y "¿Olvidaste tu contraseña?" | — | Abre `/registro` y `/restablecer-contrasena` | Baja | Positivo | Sí |
| FUN-25 | Convocatorias | "Iniciar sesión para postularse" sin sesión | Sin sesión; una convocatoria abierta | 1. `/convocatorias-publicas` 2. Pulsar "Iniciar sesión para postularse" | — | Abre `/inicio-sesion` con el campo de correo | Alta | Positivo | Sí |
| FUN-26 | Convocatorias | Abrir y cerrar el detalle público | Sin sesión | 1. Pulsar "Ver Detalles" 2. Verificar el detalle 3. "Cerrar" | — | Se ven "Detalles de la Convocatoria" e "Información del Cargo"; al cerrar, desaparece | Media | Positivo | Sí |
| FUN-27 | Convocatorias | La lista coincide con la API pública | Sin sesión | 1. Consultar la API 2. Contar los botones "Ver Detalles" | — | API 200 y mismo número de convocatorias (9) | Media | Positivo | Sí |
| FUN-28 | Convocatorias | Estado del detalle igual al de la tarjeta | Sin sesión | 1. Leer el estado de la primera tarjeta 2. Abrir su detalle 3. Leer el estado | Convocatoria "ejm" | Mismo estado en ambos lugares | Alta | Negativo | Sí |
| FUN-29 | Convocatorias | Fecha de cierre igual a la de la API | Sin sesión; convocatoria abierta | 1. Leer "Cierre" en la tarjeta abierta 2. Comparar con `fecha_cierre` de la API | "Docente de Algebra moderna" | Mismo día | Alta | Negativo | Sí |

**Cumplimiento de mínimos:** 23 casos (mínimo 12); 22 automatizados (mínimo 8); 10 negativos: FUN-02, 03, 15, 18, 19, 20, 21, 22, 28 y 29 (mínimo 3); 2 de permisos: FUN-04 y FUN-16 (mínimo 2).

## 9. Resultados de ejecución
| Ejecución | Fecha y hora | Equipo | Comando | Resultado |
|---|---|---|---|---|
| A – Suite con sesión | 2026-11-17 | Lenny | `npx cypress run` (login, aspirante, público) | 13 aprobados, 0 fallidos (FUN-01 a 04, 10 a 14, 16 a 19) |
| B – Casos F1 | 2026-11-17 22:55 | Miguel | `auth/miguel.cy.js` y `publico/**` | 7 de 7 aprobados (FUN-17 a 23) |
| C – Integrada sin sesión | 2026-11-17 23:37 | Lenny | `auth/miguel.cy.js`, `publico/**`, `aspirante/convocatorias_extra.cy.js` | **10 aprobados, 2 fallidos** (FUN-28 y FUN-29) |

Resultado vigente por caso (última ejecución):

| ID | Resultado | Ejecución | Evidencia |
|---|---|---|---|
| FUN-01 a FUN-04 | Aprobado (4/4) | A | `evidencia/login.cy.js.mp4` |
| FUN-10 a FUN-14, FUN-16 | Aprobado (6/6) | A | `evidencia/aspirante.cy.js.mp4` |
| FUN-17 a FUN-19 | Aprobado (3/3) | C | `evidencia/publico.cy.js.mp4` |
| FUN-20 a FUN-23 | Aprobado (4/4) | B y C | `evidencia/miguel.cy.js.mp4` |
| FUN-25 a FUN-27 | Aprobado (3/3) | C | `evidencia/convocatorias_extra.cy.js.mp4` |
| FUN-28 | **Fallido** → DEF-01 | C | Mismo video; mensaje `expected 'Abierta' to equal 'Cerrada'` |
| FUN-29 | **Fallido** → DEF-02 | C | Mismo video; mensaje `expected '25 dic 2026' to equal '26 dic 2026'` |
| FUN-15 | No ejecutado | — | Omitido a propósito (riesgo de datos reales) |

**Resumen numérico:** 23 casos diseñados · 22 ejecutados · **20 aprobados · 2 fallidos** · 1 no ejecutado. Aprobación sobre ejecutados: **90,9 %**; sobre el total diseñado: **87,0 %**.

**Limitación de la ejecución B:** en el equipo de Miguel, FUN-01 no se ejecutó porque su cuenta solo entra con Google. Se cuenta como aprobado por la ejecución A.

## 10. Reporte de defectos
| ID | Título | Caso | Pasos para reproducir | Resultado esperado | Resultado obtenido | Severidad | Prioridad | Evidencia |
|---|---|---|---|---|---|---|---|---|
| DEF-01 | El detalle muestra un estado distinto al de la tarjeta | FUN-28 | 1. Abrir `/convocatorias-app/convocatorias-publicas` sin sesión 2. La tarjeta "ejm" dice **Cerrada** 3. Pulsar "Ver Detalles" | El detalle dice **Cerrada** | El detalle dice **Abierta** | Media | Alta | Fallo de FUN-28; `convocatorias_extra.cy.js.mp4` |
| DEF-02 | Las fechas de cierre se muestran un día antes | FUN-29 | 1. Consultar `/convocatorias-app/api/publico/convocatorias` 2. "Docente de Algebra moderna" tiene `fecha_cierre` 2026-12-26T00:00:00Z 3. Ver su tarjeta | "Cierre 26 dic 2026" | "Cierre **25** dic 2026" | Media | Alta | Fallo de FUN-29; mismo video |
| DEF-03 | Datos de prueba visibles en producción | (exploración) | Abrir la lista pública y el detalle de "ejm" | Solo convocatorias reales | Convocatoria "ejm", descripción "hbnnjoibvdedrtfyguhjik", solicitante "jaja", "Cargo" y "Facultad" vacíos | Baja | Media | Texto de la lista y del detalle (17-nov) |

**Observaciones (no son defectos confirmados):**

| ID | Observación | Severidad | Evidencia |
|---|---|---|---|
| OBS-01 | Los mensajes del login son poco claros: "Correo no valido" no lleva tilde ni indica el formato esperado | Baja | FUN-03 y FUN-20 |
| OBS-02 | Nova y UniDoc tienen sesiones y logins independientes; el rol que muestra Nova no coincide con el de UniDoc | Informativa | Exploración manual |
| OBS-03 | FUN-16 aprobó porque `/talento-humano` devuelve 404, no porque exista un control de permisos demostrado | Media (riesgo de la prueba) | `aspirante.cy.js.mp4` |
| OBS-04 | La API pública devuelve campos internos (`solicitante`, `aprobaciones`, `created_at`, `updated_at`) que el aspirante no necesita | Baja | Respuesta de la API (17-nov) |

## 11. Análisis de resultados
- **Más estables:** el inicio de sesión y el registro. Todas sus validaciones (correo inválido, clave corta, campos vacíos, paso 2 incompleto) funcionan, y la navegación desde el login es correcta.
- **Más frágil:** la información de las convocatorias. Los dos defectos están ahí, y ambos afectan datos que el aspirante usa para decidir si se postula.
- **Patrón en DEF-02:** las fechas que llegan a medianoche UTC se muestran en el día anterior al convertirlas a la hora de Colombia (UTC−5). Afecta a todas las fechas de la lista y del detalle, no solo a un caso.
- **Patrón en DEF-01:** la API marca como "Abierta" 6 convocatorias cuya fecha de cierre ya pasó, mientras la lista las muestra "Cerrada". Hipótesis: la tarjeta calcula el estado por fecha y el detalle usa el campo `estado_convocatoria`, que no se actualiza al vencer.
- **Riesgos para el negocio:** un aspirante podría no postularse creyendo que el plazo venció (DEF-02), o intentar postularse a una convocatoria vencida (DEF-01). Los datos de prueba en producción (DEF-03) dañan la imagen institucional. Si un aspirante pudiera acceder a funciones de Talento Humano, se expondrían datos personales de otros candidatos (Ley 1581 de 2012); eso no está demostrado (OBS-03).
- **Limitaciones:** una sola cuenta con sesión; sin pruebas de postulación ni carga de archivos; el inicio de sesión con Google no es automatizable; los textos y selectores dependen del contenido actual y pueden cambiar.

## 12. Conclusiones y recomendaciones
**Valoración:** el rol Aspirante está **apto con reservas**. Las funciones de acceso y registro funcionan, pero hay dos defectos de severidad media en la información de las convocatorias y la prueba no cubre la postulación ni el control de permisos con evidencia sólida.

**Acciones recomendadas, por prioridad:**
1. (Alta) Corregir DEF-02: mostrar las fechas en la zona horaria correcta o guardarlas como fecha sin hora.
2. (Alta) Corregir DEF-01: calcular el estado igual en la tarjeta y en el detalle, y actualizar `estado_convocatoria` al vencer la fecha de cierre.
3. (Alta) Ejecutar FUN-16 con una URL real de otro rol y FUN-15 con autorización del docente.
4. (Media) Retirar las convocatorias de prueba de producción (DEF-03) y revisar los campos que expone la API pública (OBS-04).
5. (Media) Asignar el rol Docencia a una cuenta de prueba y activar la suite `docencia`.
6. (Baja) Mejorar los mensajes de validación del login.

## 13. Anexos
- Repositorio: https://github.com/lennychilito321/CALIDAD2
- Casos y análisis por integrante: `casos_nuevos_Miguel.md`, `casos_nuevos_Lenny.md`, `secciones_1_a_7_Miguel.md`.
- Videos: `entrega/1_Funcionales/evidencia/`.
- Reproducción: `npm install` y `npx cypress run`; sin credenciales, `npx cypress run --spec "cypress/e2e/auth/miguel.cy.js,cypress/e2e/publico/**/*.cy.js,cypress/e2e/aspirante/convocatorias_extra.cy.js"`.
