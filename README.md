# Karol's personal blog

Personal blog monorepo for Karol, a software engineer.

- `api/` — Rails 8 API-only backend with PostgreSQL
- `web/` — Vite + React + TypeScript + Tailwind frontend with four visual themes

## Run locally

### Docker

Clone the repository and make sure Docker Desktop or Docker Engine with Compose v2
is installed. From the repository root, start the stack:

```sh
docker compose up --build
```

Wait for the `api` service to finish preparing and seeding the database, then open
[http://localhost:5173](http://localhost:5173). The API is available at
[http://localhost:3000](http://localhost:3000).

The admin editor is available at `/admin/login` with the default
`ADMIN_PASSWORD=change-me`. To override it, create a root `.env` file (ignored by
git) with `ADMIN_PASSWORD`, `JWT_SECRET`, `SITE_URL`, and `VITE_API_URL`, or pass
those variables inline:

```sh
ADMIN_PASSWORD=choose-a-password JWT_SECRET=choose-a-secret docker compose up --build
```

Rebuild after changing `Gemfile` or `package.json`:

```sh
docker compose up --build
```

Stop the stack with `Ctrl+C`. To reset the database, run:

```sh
docker compose down -v
```

Open a Rails console or run tests with:

```sh
docker compose exec api bin/rails c
docker compose exec api bin/rails test
```

### Native setup

Follow [`scripts/setup.md`](scripts/setup.md) to install Ruby, Rails, PostgreSQL, and the local toolchain.

Set the admin credentials in `api/.env` (this file is ignored):

```dotenv
ADMIN_PASSWORD=choose-a-local-password
JWT_SECRET=choose-a-long-local-secret
```

Run each side separately:

```sh
cd api
bin/rails server -p 3000
```

```sh
cd web
npm install
npm run dev
```

Or run the full stack with one command from the repository root:

```sh
bin/dev
```

The frontend runs at [http://localhost:5173](http://localhost:5173), and the API runs at
[http://localhost:3000](http://localhost:3000). `web/.env.example` documents the
`VITE_API_URL` override.

## Themes and administration

Use the theme menu in the site header to switch between Notion, Brutalist, Pixel,
and Neon layouts. The choice is persisted in the browser under `theme`, and the
initial page uses an inline bootstrap script to avoid a flash of the default theme.

The admin editor is available at `/admin/login`; it uses the `ADMIN_PASSWORD` from
`api/.env`, supports drafts, publishing, Markdown preview, tags, and cover uploads.
The RSS feed is available at `/feed.xml`.
