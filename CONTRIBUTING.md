# Cómo trabajar en este repositorio

## Preparación (una sola vez)
```bash
git clone <URL-del-repo>
cd <carpeta-del-repo>
git config user.name "Su Nombre Real"
git config user.email "correo-de-su-cuenta-de-github"
npm install
npm run cy:publico     # debe dar 3 passing
```
El correo debe ser el de su cuenta de GitHub, o los commits no se les asignan.

## Flujo de cada tarea (nadie trabaja directo en `main`)
1. Actualizar: `git checkout main` y `git pull origin main`
2. Crear una rama con su nombre y el paquete: `git checkout -b miguel/F1-autenticacion`
3. Hacer el trabajo y commits pequeños: `git add archivo`, `git commit -m "F1: agrega caso de correo con espacios"`
4. Subir la rama: `git push -u origin miguel/F1-autenticacion`
5. En GitHub abrir un **Pull Request** hacia `main` y pedir revisión (ver `REPARTO.md`).
6. Quien revisa aprueba o comenta; después se hace *Merge*.
7. Volver al paso 1 con el siguiente paquete.

## Mensajes de commit
`Paquete: qué se hizo`. Ejemplos: `F1: agrega 2 casos de registro`, `R1: resultados de carga y estrés`, `V2: script resumen_csv.py`.

## Qué NO subir
- Contraseñas, `cypress.env.json`, `.env`.
- `node_modules`, videos grandes ni capturas.
- Reportes de OpenVAS en bruto si el repo es público.

## Si algo falla
| Problema | Solución |
|---|---|
| `Permission denied` / `403` | No aceptó la invitación o no es colaborador |
| `non-fast-forward` | Falta actualizar: `git pull --rebase origin main` |
| `Author identity unknown` | Falta `git config user.name` y `user.email` |
| Conflicto al hacer `pull` | Avisar a Lenny antes de resolver |

## Límites de las pruebas
Solo `nova.uniautonoma.edu.co`, rol Aspirante, sin explotar nada, máximo 20 peticiones por segundo.
