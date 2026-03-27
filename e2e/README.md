# Pruebas E2E (Playwright)

## Comandos

| Comando | Descripción |
|--------|-------------|
| `npm run test:e2e` | Ejecuta todas las pruebas (levanta `npm run dev` si no hay servidor en :3000). |
| `npm run test:e2e:ui` | Modo UI: ver pasos, elegir tests, depurar. |
| `npm run test:e2e:headed` | Navegador visible (sin UI panel). |
| `npm run test:e2e:install` | Instala solo Chromium para Playwright. |

## Qué cubren hoy

- **smoke.spec.ts**: home y `/login` cargan y muestran controles esperados.
- **auth-redirects.spec.ts**: sin sesión, `/catalogo`, detalle de producto y `/almacen/dashboard` redirigen a `/login?next=…`.
- **dev-flujos.spec.ts**: `/dev/flujos` (guía de flujos; en build de producción responde 404).
- **soil-analysis-flow.spec.ts**: `/dev/e2e/soil-analysis` (subir foto -> OCR mock -> interpretar mock -> deep-link a catálogo).

No incluyen **login con OTP** (depende de Twilio/Supabase en vivo). Para grabar un flujo autenticado:

1. `npx playwright codegen http://localhost:3000`
2. Iniciá sesión manualmente y navegá el flujo.
3. Opcional: [Storage state](https://playwright.dev/docs/auth#session-storage) para reutilizar cookies en CI (avanzado).

## Guía visual en el navegador

En desarrollo: [http://localhost:3000/dev/flujos](http://localhost:3000/dev/flujos) — enlaces al flujo caficultor y almacén (requiere sesión con el rol adecuado).
