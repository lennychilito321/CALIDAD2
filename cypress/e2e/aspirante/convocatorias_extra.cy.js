// Lenny Chilito - F2 Convocatorias: casos FUN-25 a FUN-29.
// Zona pública de UniDoc (sin sesión). Solo lectura: no se crea ningún dato.
// Basados en la exploración del 17-nov-2026. FUN-28 y FUN-29 verifican defectos reales (DEF-01 y DEF-02):
// mientras la app no se corrija, deben FALLAR; eso es el resultado esperado de la prueba.
const BASE = "/convocatorias-app";
const API = `${BASE}/api/publico/convocatorias`;
const ESTADO = /(Abierta|Cerrada|Finalizada)/;
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"];

// Tarjeta = el ancestro más cercano del botón que contiene el estado y la fecha de publicación.
const tarjetaDe = ($btn) =>
  Cypress.$($btn.parents().toArray().find((e) => /Publicaci/.test(e.textContent) && ESTADO.test(e.textContent)));

describe("UniDoc - Convocatorias públicas (extra, Lenny)", () => {
  beforeEach(() => {
    cy.visit(`${BASE}/convocatorias-publicas`);
    cy.contains("button", "Ver Detalles", { timeout: 20000 }).should("exist");
  });

  it("FUN-25 [positivo] Sin sesión, 'Iniciar sesión para postularse' lleva al inicio de sesión", () => {
    cy.contains("button", "Iniciar sesión para postularse").first().click();
    cy.location("pathname").should("eq", `${BASE}/inicio-sesion`);
    cy.get("#email").should("be.visible");
  });

  it("FUN-26 [positivo] 'Ver Detalles' abre la ventana de detalle y 'Cerrar' la cierra", () => {
    cy.contains("button", "Ver Detalles").first().click();
    cy.contains("Detalles de la Convocatoria").should("be.visible");
    cy.contains("Información del Cargo").should("be.visible");
    cy.contains("button", "Cerrar").click();
    cy.contains("Detalles de la Convocatoria").should("not.exist");
  });

  it("FUN-27 [positivo] La página muestra tantas convocatorias como devuelve la API pública", () => {
    cy.request(API).then((r) => {
      expect(r.status).to.eq(200);
      const total = r.body.convocatorias.length;
      cy.get("button").filter(':contains("Ver Detalles")').should("have.length", total);
    });
  });

  it("FUN-28 [negativo] El estado del detalle coincide con el de la tarjeta (verifica DEF-01)", () => {
    cy.contains("button", "Ver Detalles").first().then(($btn) => {
      const estadoTarjeta = tarjetaDe($btn).text().match(ESTADO)[1];
      cy.wrap($btn).click();
      // Se espera a que el detalle cargue su contenido antes de leerlo.
      cy.contains("Detalles de la Convocatoria")
        .closest('div[class*="max-w-4xl"]')
        .should("contain", "Publicación")
        .invoke("text")
        .then((t) => {
          const estadoDetalle = t.match(ESTADO)[1];
          expect(estadoDetalle, "estado en el detalle").to.eq(estadoTarjeta);
        });
    });
  });

  it("FUN-29 [negativo] La fecha de cierre mostrada coincide con la de la API (verifica DEF-02)", () => {
    cy.request(API).then((r) => {
      const items = r.body.convocatorias;
      cy.contains("button", "Iniciar sesión para postularse").first().then(($btn) => {
        const texto = tarjetaDe($btn).text();
        // Convocatoria de esta tarjeta: la de nombre más largo contenido en el texto.
        const item = items
          .filter((c) => texto.includes(c.nombre_convocatoria))
          .sort((a, b) => b.nombre_convocatoria.length - a.nombre_convocatoria.length)[0];
        expect(item, "convocatoria encontrada en la API").to.exist;
        const f = new Date(item.fecha_cierre);
        const esperado = `${f.getUTCDate()} ${MESES[f.getUTCMonth()]} ${f.getUTCFullYear()}`;
        const mostrado = texto.match(/Cierre\s*(\d{1,2} \S+ \d{4})/)[1];
        expect(mostrado, `cierre de "${item.nombre_convocatoria}"`).to.eq(esperado);
      });
    });
  });
});
