# Operations

Canonical production procedure: **[DEPLOY.md](./DEPLOY.md)** (VPS + Nginx + systemd). Backup/restore: **[DR.md](./DR.md)**.

Real-VPS go-live ticks: **[VPS-ACCEPTANCE.md](./VPS-ACCEPTANCE.md)** (45-point checklist). Sample configs in git are not a pass.

This page is the short operational index.

## Health

- `GET /api/health/live` — process alive
- `GET /api/health` — `{ ok, db, uploads, email }` with no SMTP host/error strings. `503` when db or uploads fail.

## Logging

JSON on stdout (systemd journal). Fields include timestamp, level, event name, and `requestId` on unhandled 5xx. Never JWT, passwords, Authorization headers, or inquiry bodies.

## Backup

`npm run backup` writes `BACKUP_DIR/snapshot-<timestamp>/` (verified SQLite file + uploads copy) and prunes with `BACKUP_KEEP`. See DEPLOY.md for the timer and restore steps.

SQLite uses WAL, foreign keys, and `busy_timeout=5000`. One Node writer.

## Rate limits

In-memory, single instance: public inquiry POST, admin login, media uploads, and inquiry email resend. Not shared across processes. Exceeded limits return HTTP 429.

## Database

SQLite is the supported runtime. `DB_HOST` is ignored; production refuses to start if it is set so MySQL cannot be activated accidentally. The previous MySQL adapter blocked the event loop and has been removed.

Admin sessions are stored in `admin_sessions`. `POST /api/admin/auth/logout` revokes the current JWT. Password changes, deactivation, and role changes also revoke that admin's sessions. `JWT_EXPIRES_IN` defaults to 12h (max 24h in production). `ADMIN_SECRET_PATH` is an extra HTML gate for the existing `/admin` SPA; it is not a substitute for JWT authentication. Never log the live path. Rotate it by changing `.env` and restarting the API.

## Schema initialization

Startup creates missing tables/columns. Production does not insert demo projects into an empty catalog. No migration framework — additive only.

## Keep SQLite until

- more than one concurrent application instance writing to the same database
- a database larger than this host can back up comfortably
- write concurrency that SQLite WAL cannot absorb
- managed Postgres as an infrastructure requirement

## Unused / classified surfaces

- `WorkPage.jsx` and `client/src/data/projects.js` — KEEP as unused archive. Live work is CMS projects.
- `Process.jsx`, `FinalCTA.jsx` — KEEP unused. ClosingBand is live.
- CMS reorder helpers — KEEP. API is complete; admin UI has no drag-and-drop yet.
- `AdminSettings.jsx` — account identity, not CMS site settings.
- `heroCta` CMS block — KEEP as optional future block. Live hero uses Hero settings (`cta` + optional `secondaryCta`).
- Project `seo_title` / `seo_description` — KEEP for a future case-study route. There is no public project detail page.
