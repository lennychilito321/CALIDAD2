# Paquete D1 – Informe 1, secciones 1 a 7 · Miguel Llantén

Propuesta de texto para las secciones 1 a 7 de `G_Funcionales.md`, actualizada con los casos nuevos del paquete F1 (FUN-20 a FUN-23). Lenny la integra en el informe junto con los casos de los demás (FUN-25 en adelante). Las cifras de abajo solo cuentan los casos que estaban en `main` al 17-nov-2026 más los míos; hay que sumar los de cada integrante al integrar.

---

## 1. Portada y control de versiones
Portada común, integrantes y escala de severidad: ver `00_Portada_y_severidad.md`. Grupo sin número asignado.

| Versión | Fecha | Autor | Cambios |
|---|---|---|---|
| 0.1 | 2026-11-16 | Grupo | Primera suite (login, aspirante) y borrador |
| 1.0 | 2026-11-17 | Lenny Chilito | Zona pública (FUN-17 a FUN-19), corrida completa del 17-nov, evidencia y consolidación del repositorio |
| 1.1 | 2026-11-17 | Miguel Llantén | Paquete F1: casos FUN-20 a FUN-23 de autenticación y registro; actualización de las secciones 1 a 7 |

## 2. Resumen ejecutivo
Se probó el rol **Aspirante** de UniDoc, el módulo de convocatorias de la plataforma Nova. Se diseñaron **18 casos**: inicio de sesión, recuperación de contraseña, registro, zona pública, perfil, convocatorias, postulaciones, datos personales y permisos. De ellos, **17 son automatizados con Cypress**.

En la última ejecución de cada parte no hubo fallos atribuibles a la aplicación:
- FUN-01 a FUN-19: 13 de 13 aprobados (corrida del 17-nov).
- FUN-20 a FUN-23: 4 de 4 aprobados (corrida de Miguel, 17-nov 22:55).

FUN-15 (postular con el perfil incompleto) no se ejecutó a propósito, porque podría crear una postulación real en un sistema compartido.

No se encontraron defectos funcionales. Las validaciones del inicio de sesión y del registro rechazan correctamente los datos vacíos, mal formados o incompletos. El mayor riesgo no es un defecto sino una **limitación de la prueba**: el control de permisos entre roles (FUN-16) solo se verificó contra una ruta inexistente que devuelve 404.

**Recomendación general:** el rol Aspirante está **apto con reservas**. Antes de aprobarlo conviene probar la postulación real con permiso del docente y repetir el control de permisos con una URL real de otro rol.

## 3. Objetivo y alcance
**Objetivo:** verificar que las funciones del Aspirante se comportan como se espera, que los datos inválidos se rechazan y que el acceso está protegido.

**Dentro del alcance:**
- Inicio de sesión de UniDoc, con sus validaciones de correo y contraseña.
- Enlaces del login a registro y a recuperación de contraseña.
- Registro (pasos 1 y 2).
- Zona pública de convocatorias.
- Inicio del aspirante (hoja de vida).
- Listado y detalle de convocatorias.
- Mis postulaciones.
- Datos personales (8 secciones).
- Control de acceso sin sesión.

**Fuera del alcance (con justificación):**
- **Rol Docencia:** ninguna cuenta del grupo tiene ese rol. La suite existe pero está desactivada.
- **Postulación real (FUN-15), carga de documentos, edición de la hoja de vida y completar el registro hasta el paso 5:** crean o modifican datos reales en un sistema compartido. El registro solo se prueba hasta el paso 2.
- **Envío del formulario de recuperación de contraseña:** mandaría correos reales. Solo se verifica que la pantalla abre.
- **Inicio de sesión con Google:** es un servicio de terceros que bloquea la automatización.
- **Recepción con IA, Normativas y notificaciones:** no son parte de los flujos mínimos del rol.

## 4. Descripción de la aplicación y del rol
UniDoc es el módulo de convocatorias, avales y contratación docente de Nova (Núcleo de Operaciones Virtuales Académicas, Uniautónoma del Cauca). Vive en `/convocatorias-app` y tiene su propio inicio de sesión (`/inicio-sesion`), independiente del de Nova.

Desde el login, el usuario puede ir al registro (`/registro`), recuperar su contraseña (`/restablecer-contrasena`, con un enlace que caduca a los 5 minutos) o entrar con Google.

El **Aspirante**:
- consulta las convocatorias abiertas, que son públicas y no exigen sesión;
- se registra en cinco pasos: nombre, documento (9 tipos de identificación, número de al menos 7 caracteres), datos, ubicación y cuenta;
- mantiene su hoja de vida (formación, experiencia, idiomas, aptitudes);
- completa ocho secciones de datos personales: datos personales, contacto, EPS, RUT, certificación bancaria, pensión, antecedentes judiciales y ARL;
- se postula y consulta sus postulaciones.

**Datos de prueba:** cuenta propia de un integrante, con el perfil incompleto. Las credenciales se leen de `cypress.env.json` (excluido de Git) y no aparecen en este documento. Los casos negativos usan datos ficticios (`qa.prueba.invalida@example.com`, `correo-sin-arroba`, nombre "Prueba Qa") que nunca llegan a guardarse.

## 5. Entorno de pruebas
| Elemento | Valor |
|---|---|
| URL | https://nova.uniautonoma.edu.co/convocatorias-app |
| Navegador | Electron, incluido en Cypress, en modo headless |
| Sistema operativo | Windows 11 Pro (equipos de Lenny y de Miguel) |
| Node.js | v24.20.0 (Lenny) · v25.8.1 (Miguel) |
| Cypress | 13.17.0 |
| Fechas de ejecución | 2026-11-16 y 2026-11-17 |

## 6. Estrategia de pruebas
- **Automatizado:** casos de lectura, validaciones de formulario, navegación y acceso sin sesión. Son estables, repetibles y no alteran datos. La sesión se reutiliza con `cy.session`. Los casos sin sesión borran cookies y almacenamiento antes de empezar.
- **Diseño a partir de la app real:** antes de escribir un caso se explora la pantalla y se copian textos, rutas y nombres de campos tal como aparecen (por ejemplo `name="numero_identificacion"`). No se inventan mensajes.
- **Manual / omitido:** FUN-15 (postulación con perfil incompleto), por riesgo de crear datos reales; carga de documentos.
- **Organización del código:** cada integrante escribe sus casos nuevos en su propio archivo `.cy.js` (por ejemplo, `cypress/e2e/auth/miguel.cy.js`) para evitar conflictos en Git.
- **Criterio de entrada:** cuenta con correo y contraseña en UniDoc, servidor accesible y autorización del docente para probar Nova.
- **Criterio de salida:** todos los casos de prioridad Alta ejecutados y sin defectos críticos abiertos.
- **Prioridad:** Alta = acceso, seguridad y función principal; Media = validaciones y consultas secundarias; Baja = navegación y contenido informativo.

## 7. Matriz de trazabilidad
| Funcionalidad del rol | Casos |
|---|---|
| Inicio de sesión | FUN-01, FUN-02, FUN-03, FUN-20, FUN-21 |
| Navegación desde el login (registro y recuperación de contraseña) | FUN-23 |
| Control de acceso | FUN-04, FUN-16 |
| Zona pública de convocatorias | FUN-17, FUN-19 |
| Registro de aspirante | FUN-18, FUN-22 |
| Inicio del aspirante / hoja de vida | FUN-10 |
| Listado de convocatorias | FUN-11 |
| Detalle de convocatoria | FUN-12 |
| Mis postulaciones | FUN-13 |
| Datos personales | FUN-14 |
| Postulación | FUN-15 (no ejecutado) |

**Cumplimiento de mínimos (con FUN-20 a FUN-23):**
- 18 casos (mínimo 12).
- 17 automatizados (mínimo 8).
- 8 negativos: FUN-02, 03, 15, 18, 19, 20, 21 y 22 (mínimo 3).
- 2 de permisos: FUN-04 y FUN-16 (mínimo 2).

El detalle de FUN-20 a FUN-23 (precondiciones, pasos, datos y resultado esperado) está en `casos_nuevos_Miguel.md`, para integrarlo en la sección 8.
