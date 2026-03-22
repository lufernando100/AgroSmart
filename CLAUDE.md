@AGENTS.md

---

## COMANDOS

```bash
npm run dev      # Servidor de desarrollo en localhost:3000
npm run build    # Build de producción
npm run lint     # Linter ESLint
supabase gen types typescript --local > src/types/supabase.ts  # Regenerar tipos tras cambios en BD
```

---

## ESTADO ACTUAL DEL PROYECTO

**Completado:**
- Setup Next.js 14+ con TypeScript, Tailwind, App Router
- Estructura de carpetas por dominio
- Tipos TypeScript de todas las entidades (`src/types/database.ts`)
- Clientes Supabase: browser, server, admin
- Tablas y lógica de Cenicafé (`src/lib/cenicafe/tablas.ts`)
- Utilidades de formato COP y fechas
- Archivos de referencia en `database/` y `docs/`

**Por hacer — empezar aquí (Fase 1):**
- [ ] Instalar `@supabase/supabase-js` y `@supabase/ssr`
- [ ] Ejecutar SQL en Supabase (`database/01_modelo_datos.sql` y `database/05_datos_semilla.sql`)
- [ ] Auth por OTP con teléfono
- [ ] Catálogo de productos con comparador de precios
- [ ] Flujo de pedido completo (caficultor → almacén → confirmación)
- [ ] Panel del almacén
- [ ] Webhook de WhatsApp con Claude

Ver el plan completo de 4 fases en `AGENTS.md`.

---

## REGLAS RÁPIDAS

**Hacer:**
- TypeScript estricto siempre — cero `any`
- Usar `createClient()` de `lib/supabase/server.ts` en API routes y Server Components
- Usar `createAdminClient()` de `lib/supabase/admin.ts` solo para operaciones privilegiadas
- Commits pequeños en español: `feat: agrega comparador de precios`
- Responder 200 inmediato en el webhook de WhatsApp y procesar en background

**No hacer:**
- No modificar tablas de Supabase directamente en producción — usar migraciones
- No poner API keys en el código — todo en variables de entorno
- No construir Fase 2, 3 o 4 antes de tener un pedido real funcionando de punta a punta
- No usar `any` ni `as unknown` — definir tipos correctos

---

## ARCHIVOS CLAVE

| Archivo | Para qué sirve |
|---|---|
| `database/01_modelo_datos.sql` | Esquema completo — leer antes de tocar la BD |
| `database/05_datos_semilla.sql` | Datos de ejemplo para desarrollo |
| `docs/02_system_prompt_tools.ts` | System prompt y 11 tools del asistente IA |
| `docs/03_flujos_whatsapp.md` | 8 flujos conversacionales completos |
| `docs/04_wireframes.md` | Todas las pantallas de la PWA |
| `src/lib/cenicafe/tablas.ts` | Lógica de interpretación de análisis de suelo |
| `src/types/database.ts` | Tipos TypeScript de todas las entidades |
| `.env.local.example` | Variables de entorno requeridas |
