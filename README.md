# Moiz Web Solutions

Agency site: React + Vite frontend, Express 5 API, SQLite.

## Local development

```bash
cd server && npm install && npm run dev
cd client && npm install && npm run dev
```

API defaults to `http://127.0.0.1:8787`. Vite proxies `/api` and `/uploads`. Copy `server/.env.example` to `server/.env`.

## Documentation

- [server/docs/DEPLOY.md](server/docs/DEPLOY.md) — production VPS, HTTPS, systemd, backup/restore
- [server/docs/VPS-ACCEPTANCE.md](server/docs/VPS-ACCEPTANCE.md) — real-host go-live checklist
- [server/docs/API.md](server/docs/API.md) — HTTP API
- [server/docs/API.md](server/docs/API.md) — HTTP API
- [server/docs/OPERATIONS.md](server/docs/OPERATIONS.md) — short ops index

## Tests

```bash
cd server && npm test && npm run test:phase2
cd client && npm run build
```
