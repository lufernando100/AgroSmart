# AgroSmart (GranoVivo)

Marketplace y asistente para caficultores (Next.js + Supabase). La interfaz es en español; el código y el esquema de BD están en inglés.

## Desarrollo

```bash
npm ci
cp .env.local.example .env.local
# Completa Supabase y el resto de claves en .env.local

npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Calidad (como en CI)

```bash
npm run ci
```

## Despliegue a producción

Guía paso a paso (Vercel, Supabase, variables, WhatsApp): **[docs/DEPLOY.md](docs/DEPLOY.md)**.

## Documentación del producto

- `AGENTS.md` — contexto técnico y plan por fases  
- `PLAN.md` — seguimiento de tareas  
- `CLAUDE.md` — comandos y reglas rápidas para el agente  

## Stack

Next.js (App Router), TypeScript, Tailwind, Supabase (Auth, Postgres, Realtime), Claude API, WhatsApp Cloud API.
