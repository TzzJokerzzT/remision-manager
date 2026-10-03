/**
 * Reglas de mensaje de commit.
 *
 * Se usa la convención de Conventional Commits, que es la que ya siguen todos
 * los commits del repositorio (`feat:`, `fix:`, `chore:`, `docs:`, ...) y la que
 * permite generar changelogs y decidir versiones sin leer el historial a mano.
 *
 * El hook `commit-msg` corre esto en cada commit: un mensaje fuera de formato no
 * entra.
 */
export default {
  extends: ['@commitlint/config-conventional'],
};
