# Paquete F1 – Autenticación y registro · Miguel Llantén

Casos nuevos **FUN-20 a FUN-23** y revisión de FUN-01 a FUN-04 y FUN-18.
Código: `cypress/e2e/auth/miguel.cy.js`. Ninguno necesita credenciales ni crea datos en el sistema.

## 1. Cómo se diseñaron
Antes de escribir los casos exploré la app real (17-nov-2026, sin sesión) con Cypress en modo solo lectura y anoté rutas, nombres de campos y mensajes exactos:

| Pantalla | Ruta | Lo observado |
|---|---|---|
| Inicio de sesión | `/convocatorias-app/inicio-sesion` | Campos `email` y `password`, botón "Iniciar Sesión", enlaces "¿Olvidaste tu contraseña?" y "Regístrate aquí", botón de Google |
| Login con correo `correo-sin-arroba` | misma | Mensaje "Correo no valido", no sale del login |
| Login con clave `123` y correo válido | misma | Mensaje "Contraseña muy corta", no sale del login |
| Registro, paso 2 | `/convocatorias-app/registro` | Campos `tipo_identificacion` (lista de 9 tipos) y `numero_identificacion` |
| Paso 2 sin datos | misma | "Faltan 2 datos en este paso", "Seleccione un tipo de identificación" y "El número de identificación debe tener al menos 7 caracteres" |
| Restablecer contraseña | `/convocatorias-app/restablecer-contrasena` | Título "Restablecer contraseña", campo de correo, aviso de que el enlace caduca a los 5 minutos |

## 2. Casos nuevos
| ID | Funcionalidad | Descripción | Precondiciones | Pasos | Datos de entrada | Resultado esperado | Prior. | Tipo | Auto |
|---|---|---|---|---|---|---|---|---|---|
| FUN-20 | Login | Rechazar correo con formato inválido | Sin sesión | 1. Abrir `/inicio-sesion` 2. Escribir un correo sin "@" y una clave 3. Pulsar "Iniciar Sesión" | `correo-sin-arroba` / `ClaveFalsa#123` | Mensaje "Correo no valido"; permanece en el login | Media | Negativo | Sí |
| FUN-21 | Login | Rechazar contraseña demasiado corta | Sin sesión | 1. Abrir `/inicio-sesion` 2. Escribir correo válido y clave de 3 caracteres 3. Enviar | `qa.prueba.invalida@example.com` / `123` | Mensaje "Contraseña muy corta"; no aparece error de correo; permanece en el login | Media | Negativo | Sí |
| FUN-22 | Registro | El paso 2 no avanza sin identificación | Sin sesión | 1. Abrir `/registro` 2. Llenar primer nombre y primer apellido 3. "Siguiente" 4. En el paso 2 pulsar "Siguiente" sin datos | `Prueba` / `Qa`; paso 2 vacío | "Faltan 2 datos en este paso", con los dos mensajes de campo; permanece en "Paso 2 de 5" | Media | Negativo | Sí |
| FUN-23 | Login | Enlaces de registro y recuperación | Sin sesión | 1. Abrir `/inicio-sesion` 2. Pulsar "Regístrate aquí" 3. Volver y pulsar "¿Olvidaste tu contraseña?" | — | Abre `/registro` en "Paso 1 de 5" y `/restablecer-contrasena` con su formulario | Baja | Positivo | Sí |

**Por qué estos casos:** FUN-03 ya probaba el login vacío, pero no los dos mensajes por separado. FUN-20 y FUN-21 confirman que cada validación funciona sola. FUN-22 sigue a FUN-18 un paso más adentro del registro. FUN-23 cubre la navegación desde el login, que no tenía ningún caso.

Para no crear datos reales, el registro no pasa del paso 2 y el formulario de recuperación no se envía.

## 3. Resultados de mi ejecución
Equipo: Windows 11 Pro, Node v25.8.1, Cypress 13.17.0, navegador Electron (headless).

| Fecha y hora | Comando | Resultado |
|---|---|---|
| 2026-11-17 22:55 | `npx cypress run --spec "cypress/e2e/auth/miguel.cy.js,cypress/e2e/publico/**"` | **7/7 aprobados**: FUN-20 a FUN-23 y FUN-17 a FUN-19 |
| 2026-11-17 22:56 | `npx cypress run --spec "cypress/e2e/auth/login.cy.js"` | FUN-02, FUN-03 y FUN-04 aprobados; **FUN-01 no ejecutado** ("Faltan ASPIRANTE_USER / ASPIRANTE_PASS") |

**Por qué FUN-01 no se ejecutó en mi equipo:** mi cuenta de UniDoc entra con "Iniciar sesión con Google", y Cypress no puede automatizar ese inicio de sesión (sección 3 del informe). FUN-01 necesita una cuenta con correo y contraseña de UniDoc. Crear una cuenta nueva no era viable antes de la entrega: los permisos de las cuentas nuevas tardan varios días en asignarse y la solicitud no se resolvió a tiempo. FUN-01 sí fue aprobado en la corrida del grupo del 17-nov (`evidencia/login.cy.js.mp4`). Por eso se registra como **limitación de mi ejecución, no como defecto**.

## 4. Revisión de los casos existentes de F1
| Caso | Revisión |
|---|---|
| FUN-01 | Correcto, pero depende de una cuenta con correo y contraseña en `cypress.env.json`. No se puede repetir con cuentas que solo entran con Google (ver sección 3). |
| FUN-02 | Correcto. Verifica el mensaje y la ruta. |
| FUN-03 | Correcto. Ahora FUN-20 y FUN-21 prueban cada mensaje por separado. |
| FUN-04 | Correcto, aunque solo comprueba que no aparezca "Hoja de vida". Sería más fuerte comprobar también que redirige al login. |
| FUN-18 | Correcto. FUN-22 lo continúa en el paso 2. |

## 5. Defectos
No encontré defectos nuevos: todas las validaciones se comportan como se esperaba. Confirmo la observación OBS-01: el mensaje "Correo no valido" no lleva tilde y no indica el formato esperado.
