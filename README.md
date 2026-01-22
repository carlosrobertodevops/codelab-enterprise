# CodeLab Monorepo (Next.js 16 + NestJS)

This repository is organized as:

- `src/app` — Next.js 16 (frontend)
- `src/api` — NestJS (backend)
- Single `docker-compose.yaml` with profiles:
  - `dev`: hot-reload (Docker Desktop)
  - `prod`: production images (Coolify)

## Dev (Docker Desktop)

1. Copy env:
   ```bash
   cp .env.example .env
   ```
2. Start:
   ```bash
   docker compose --profile dev up -d --build
   ```
3. Open:
   - Web: http://localhost
   - API health: http://localhost/api/health
   - API docs: http://localhost/api/docs

## Prod (Coolify)

Use the same repo and set the Coolify docker compose profile to `prod`:

```bash
docker compose --profile prod up -d --build
```

## Notes

- Next.js version is pinned to `^16.1.4` (LTS at the time of writing). See Next.js 16 announcement and upgrade guide. citeturn0search0turn0search6
- API caches some hot paths in Redis (e.g., courses list/detail) for stability under load.
