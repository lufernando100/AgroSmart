# Contribuir a AgroSmart

Guía corta para mantener `main` estable y evitar merges conflictivos.

## Flujo recomendado

1. Crear rama por objetivo único (`feat/*`, `fix/*`, `docs/*`).
2. Mantener PRs pequeños (ideal: abrir en 24-72h).
3. Sincronizar rama con `main` al menos 1 vez al día si sigue abierta.
4. No mezclar alcance en una sola rama:
   - UI/estilos por un lado
   - API/servicios/BD por otro
5. Antes de merge a `main`, ejecutar:
   - `npm test`
   - `npm run build`
6. Si un merge trae conflictos masivos o toca archivos críticos fuera del alcance:
   - abortar merge
   - rehacer integración en PRs pequeños (por archivos o commits selectivos)

## Checklist antes de merge

- [ ] La rama solo incluye el alcance acordado.
- [ ] No hay secretos ni archivos locales.
- [ ] `npm test` pasa.
- [ ] `npm run build` pasa.
- [ ] El PR explica qué cambia y por qué.

## Convención de commits

- Formato: `tipo: descripción`
- Tipos: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`
- Mensajes en español, concretos y cortos.
