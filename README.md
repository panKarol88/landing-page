# Karol's personal blog

Personal blog monorepo for Karol, a software engineer.

- `api/` — Rails 8 API-only backend with PostgreSQL
- `web/` — Vite + React + TypeScript + Tailwind frontend with four visual themes

## Run locally

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
