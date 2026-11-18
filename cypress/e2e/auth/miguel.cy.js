// Paquete F1 (Miguel Llantén) – Autenticación y registro, casos nuevos FUN-20 a FUN-23.
// Textos, rutas y nombres de campos observados en la app real el 17-nov-2026.
// No requieren credenciales y no crean datos: ningún formulario llega a enviarse con éxito.
const BASE = "/convocatorias-app";

describe("F1 Miguel – Autenticación y registro (casos nuevos)", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it("FUN-20 [negativo] Login: correo sin '@' muestra 'Correo no valido'", () => {
    cy.visit(`${BASE}/inicio-sesion`);
    cy.get('input[name="email"]', { timeout: 20000 }).type("correo-sin-arroba");
    cy.get('input[name="password"]').type("ClaveFalsa#123", { log: false });
    cy.contains("button", "Iniciar Sesión").click();
    cy.contains("Correo no valido").should("be.visible");
    cy.location("pathname").should("eq", `${BASE}/inicio-sesion`);
  });

  it("FUN-21 [negativo] Login: contraseña de 3 caracteres muestra 'Contraseña muy corta'", () => {
    cy.visit(`${BASE}/inicio-sesion`);
    cy.get('input[name="email"]', { timeout: 20000 }).type("qa.prueba.invalida@example.com");
    cy.get('input[name="password"]').type("123", { log: false });
    cy.contains("button", "Iniciar Sesión").click();
    cy.contains("Contraseña muy corta").should("be.visible");
    cy.contains("Correo no valido").should("not.exist");
    cy.location("pathname").should("eq", `${BASE}/inicio-sesion`);
  });

  it("FUN-22 [negativo] Registro: el paso 2 no avanza sin tipo ni número de identificación", () => {
    cy.visit(`${BASE}/registro`);
    cy.contains("Paso 1 de 5", { timeout: 20000 }).should("be.visible");
    cy.get('input[name="primer_nombre"]').type("Prueba");
    cy.get('input[name="primer_apellido"]').type("Qa");
    cy.contains("button", "Siguiente").click();
    cy.contains("Paso 2 de 5").should("be.visible");
    cy.contains("button", "Siguiente").click();
    cy.contains("Faltan 2 datos en este paso").should("be.visible");
    cy.contains("Seleccione un tipo de identificación").should("exist");
    cy.contains("El número de identificación debe tener al menos 7 caracteres").should("exist");
    cy.contains("Paso 2 de 5").should("be.visible");
  });

  it("FUN-23 [positivo] Login: los enlaces 'Regístrate aquí' y '¿Olvidaste tu contraseña?' abren su pantalla", () => {
    cy.visit(`${BASE}/inicio-sesion`);
    cy.contains("a", "Regístrate aquí", { timeout: 20000 }).click();
    cy.location("pathname").should("eq", `${BASE}/registro`);
    cy.contains("Paso 1 de 5").should("be.visible");

    cy.visit(`${BASE}/inicio-sesion`);
    cy.contains("a", "¿Olvidaste tu contraseña?", { timeout: 20000 }).click();
    cy.location("pathname").should("eq", `${BASE}/restablecer-contrasena`);
    cy.contains("Restablecer contraseña").should("be.visible");
    cy.get('input[name="email"]').should("be.visible");
  });
});
