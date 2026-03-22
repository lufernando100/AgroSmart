# Despliegue a producción (AgroSmart / GranoVivo)

Stack recomendado: **Vercel** (Next.js) + **Supabase** (ya en el proyecto) + variables de entorno por entorno.

## 1. Base de datos (Supabase)

1. Crea un proyecto en [Supabase](https://supabase.com) (o usa uno dedicado a producción).
2. En **SQL Editor**, ejecuta en orden los scripts del repo:
   - `database/01_data_model.sql`
   - `database/05_seed_data.sql`
   - `database/06_catalog_api_read.sql`
   - `database/07_fn_products_distance.sql`
   - `database/08_order_items_rls.sql`
   - `database/09_realtime_orders.sql`
3. **Authentication → URL configuration**: añade la URL de tu app en producción (y la de preview si usas PRs):
   - Site URL: `https://tu-dominio.vercel.app` (o dominio custom)
   - Redirect URLs: incluye `https://tu-dominio.vercel.app/**` y `http://localhost:3000/**` para desarrollo
4. Anota en **Settings → API**: `Project URL`, `anon` `public`, y `service_role` (solo servidor; nunca en el cliente).

## 2. Vercel

1. [Importar el repositorio](https://vercel.com/new) desde GitHub/GitLab.
2. **Framework**: Next.js (detectado). **Build**: `npm run build` · **Output**: por defecto.
3. **Node.js**: 20.x (el proyecto usa Node 20 en CI; en Vercel: Settings → General → Node.js Version).

### Variables de entorno (Production)

Configúralas en Vercel → Project → **Settings → Environment Variables**. Marca **Production** (y **Preview** si quieres PRs con datos de prueba).

| Variable | Entorno | Notas |
|----------|---------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview | URL https del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview | Clave `anon` pública |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview | **Secreta.** Solo servidor (API routes, webhooks). No `NEXT_PUBLIC_` |
| `ANTHROPIC_API_KEY` | Production | Asistente / tools |
| `OPENAI_API_KEY` | Production | Whisper, si usas voz |
| `WHATSAPP_TOKEN` | Production | Cloud API |
| `WHATSAPP_VERIFY_TOKEN` | Production | Verificación webhook GET |
| `WHATSAPP_PHONE_NUMBER_ID` | Production | |
| `WHATSAPP_APP_SECRET` | Production | Validación firma `X-Hub-Signature-256` (recomendado en prod) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Production, Preview | Si usas mapas en la PWA |

Opcional: `ANTHROPIC_MODEL` si sobreescribes el modelo por defecto en código.

Tras el primer deploy, copia la URL definitiva (p.ej. `https://agrosmart-xxx.vercel.app`) y vuelve a **Supabase → Auth → URL** si hace falta.

## 3. WhatsApp (Meta)

Cuando tengas la URL de producción:

1. En [Meta for Developers](https://developers.facebook.com/) → tu app → WhatsApp → **Webhook**:
   - Callback URL: `https://tu-dominio.vercel.app/api/whatsapp/webhook`
   - Verify token: el mismo valor que `WHATSAPP_VERIFY_TOKEN` en Vercel.
2. Comprueba que el código valida la firma con `WHATSAPP_APP_SECRET` en producción.

## 4. Comprobaciones antes de confiar en prod

En local (con variables de prod **no** pegadas en el repo; usa solo en Vercel):

```bash
npm run ci
```

Tras deploy: login OTP, una ruta del catálogo (con BD sembrada), y un ping al webhook (GET con verify token).

## 5. Dominio propio (opcional)

Vercel → Project → **Domains**: añade `app.tudominio.com` y configura DNS según indicaciones. Actualiza Supabase Auth redirect URLs y el webhook de WhatsApp a la nueva URL.

## 6. Preview vs Production

- **Preview**: mismas variables con proyecto Supabase de *staging* recomendado (otro proyecto Supabase) para no mezclar datos con producción.
- **Production**: Supabase de producción y secretos finales.

---

Referencias: `.env.local.example`, `AGENTS.md`, `CLAUDE.md`.
