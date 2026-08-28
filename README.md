# Karol's personal blog

Personal blog monorepo for Karol, a software engineer.

- `api/` — Rails 8 API-only backend with PostgreSQL
- `web/` — Vite + React + TypeScript + Tailwind frontend (coming later)

## Run locally

Follow [`scripts/setup.md`](scripts/setup.md) to install dependencies. Then:

```sh
cd api
bin/rails server -p 3000
```

When the frontend is added:

```sh
cd web
npm install
npm run dev
```
