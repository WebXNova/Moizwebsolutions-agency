# Production deployment

**Assumed model:** one Linux VPS, one Node process, SQLite on local disk, Nginx for HTTPS, systemd to keep the API running.

The repository does not name a cloud provider. This is the smallest realistic production shape for React + Vite + Express + better-sqlite3. Do not add Docker, Kubernetes, Redis, or PostgreSQL unless the [scaling triggers](#scalability) below actually occur.

```
Internet
   ↓ HTTPS
Nginx (static `client/dist` + proxy)
   ↓ 127.0.0.1:8787
Express (systemd user `mws`)
   ↓
SQLite  +  uploads/  +  backups/
```

A short restart window during deploys is expected. This is not zero-downtime.

## Prerequisites

- Ubuntu 22.04+ or similar
- Node.js 20.6+
- Nginx
- A TLS certificate (Let’s Encrypt)
- A dedicated OS user, for example `mws` — **do not run Node as root**

## Secrets

Copy `server/.env.example` to `server/.env` on the server. `.env` is gitignored. Never commit JWT secrets, SMTP passwords, or database files.

| Class | Variables |
|---|---|
| SECURITY | `JWT_SECRET`, `JWT_EXPIRES_IN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (first-run seed only) |
| DATABASE | `DB_PATH` |
| SERVER | `NODE_ENV`, `PORT`, `LISTEN_HOST`, `TRUST_PROXY` |
| CORS | `ALLOWED_ORIGINS` |
| SMTP | `SMTP_*`, `MAIL_*`, `BUSINESS_EMAIL` |
| UPLOADS | `UPLOADS_DIR`, `UPLOADS_PUBLIC_PATH`, `UPLOAD_MAX_BYTES` |
| BACKUP | `BACKUP_DIR`, `BACKUP_KEEP` |
| OPTIONAL | `SITE_URL`, `MAIL_TIMEZONE`, rate-limit windows |

Production refuses to start if `JWT_SECRET` is missing/weak, `ALLOWED_ORIGINS` is empty or invalid, `PORT`/`TRUST_PROXY` are nonsense, or `DB_PATH` sits under uploads/backups/`client/dist`. Missing SMTP does **not** block startup: inquiries still persist with `email_status=failed`.

`TRUST_PROXY=1` when Nginx is in front (so rate limits see the real client IP). Leave `0` if Node is reached directly.

`LISTEN_HOST` defaults to `127.0.0.1` in production. Set `0.0.0.0` only for a container/PaaS that must bind all interfaces.

Frontend: leave `VITE_API_BASE_URL` unset for this same-origin Nginx layout. Anything in `VITE_*` is public.

## Install layout

Suggested paths (adjust if you must; keep DB and backups off the web root):

```
/var/www/mws/            # git checkout, owned by mws
  client/dist/           # Vite build; Nginx document root
  server/
    .env                 # mode 600, owner mws
    data/portfolio.db    # not HTTP-accessible
    uploads/projects/
    backups/
    src/index.js
```

```bash
sudo useradd --system --home /var/www/mws --shell /usr/sbin/nologin mws
sudo mkdir -p /var/www/mws
sudo chown -R mws:mws /var/www/mws
```

Minimum permissions: `mws` read the app; write `data/`, `uploads/`, `backups/`; `.env` owner-read only (`chmod 600`).

## Database initialization

On first start the process creates tables (`CREATE TABLE IF NOT EXISTS`) and additive columns. Existing rows are not wiped. Demo portfolio projects are **not** inserted when `NODE_ENV=production`. CMS defaults (hero/services copy) still seed empty tables so a brand-new site can be edited.

There is no migration framework. Schema change rate is low and the app is single-instance; startup initialization remains acceptable. Do not introduce destructive migrations. Rollback of schema is not automatic — avoid dropping columns.

SQLite pragmas: `journal_mode=WAL` (readers during writes), `foreign_keys=ON`, `busy_timeout=5000` (brief lock wait). Keep a **single** Node writer.

## Build & start

```bash
cd /var/www/mws/client && npm ci && npm run build
cd /var/www/mws/server && npm ci --omit=dev
NODE_ENV=production npm run verify:env
NODE_ENV=production npm run verify:db
# then systemd start (below)
```

Development `npm run dev` is not a production command.

## Process management

Use **systemd** only (not PM2 and systemd together).

1. Copy `deploy/systemd/mws-api.service` to `/etc/systemd/system/`
2. Edit `WorkingDirectory` / `ReadWritePaths` if your paths differ
3. `sudo systemctl daemon-reload && sudo systemctl enable --now mws-api`

The unit restarts on crash and at boot, logs to the journal (`journalctl -u mws-api -f`), and stops with SIGTERM (the app closes the HTTP server, then SQLite, with a 10s timeout).

## Reverse proxy and HTTPS

Copy `deploy/nginx/moizwebsolutions.conf`, set the real hostname, install certificates, reload Nginx. HTTP redirects to HTTPS. Node is not published on `:8787` to the internet.

Compression and TLS live in Nginx, not Express.

## Health

- `GET /api/health/live` — process is up (liveness)
- `GET /api/health` — SQLite ping + uploads dir readable; `{ ok, db, uploads, email }` with no paths or SMTP errors. `200` if ready, `503` if db/uploads failed.

Email `unconfigured` does not fail readiness.

## Backup

```bash
cd /var/www/mws/server && npm run backup
```

Creates `BACKUP_DIR/snapshot-<timestamp>/` with `portfolio.db` (better-sqlite3 backup, then opened read-only to verify), a copy of uploads under `media/`, and `manifest.json`. Older snapshots beyond `BACKUP_KEEP` (default 14) are deleted.

Enable the timer:

```bash
sudo cp deploy/systemd/mws-backup.service deploy/systemd/mws-backup.timer /etc/systemd/system/
sudo systemctl enable --now mws-backup.timer
```

Copy snapshots off-box (encrypted disk, `restic`, Borg, or your host’s snapshot product). Do not invent application-level cryptography. Do not store backups under `uploads/` or `client/dist/`.

**Limitation:** SQLite backup is consistent; media is a near-simultaneous filesystem copy, not a two-phase commit.

Backup success/failure is JSON on stdout (`backup.complete` / `backup.failed`). Failed timer units show in `systemctl status mws-backup`.

## Restore (disposable environment first)

1. Stop `mws-api`
2. Keep a copy of the current `DB_PATH` and uploads directory
3. Confirm the snapshot `portfolio.db` opens (`npm run verify:db` after pointing `DB_PATH` at a copy, or open with `sqlite3`)
4. Replace `DB_PATH` with `snapshot-…/portfolio.db` (and `-wal`/`-shm` if you copy a live file — prefer the snapshot file)
5. Replace uploads with `snapshot-…/media/`
6. Start `mws-api`
7. `GET /api/health`, `npm run smoke`, sign in to admin

Do not auto-restore on error.

## Smoke test

```bash
SMOKE_BASE_URL=https://example.com npm run smoke
# optional authenticated GETs:
SMOKE_ADMIN_EMAIL=… SMOKE_ADMIN_PASSWORD=… npm run smoke
```

Does not delete CMS data.

## Release checklist

- [ ] `npm run backup`
- [ ] `NODE_ENV=production npm run verify:env`
- [ ] install dependencies
- [ ] `npm test` / `npm run test:phase2` (CI or staging)
- [ ] client `npm run build` **before** replacing live `dist`
- [ ] `npm run verify:db`
- [ ] restart `mws-api`
- [ ] health + smoke
- [ ] inspect `journalctl -u mws-api`

If the new build fails, keep serving the previous `client/dist` and do not restart.

## Rollback

- **App:** restore the previous git revision / previous `client/dist` and restart. Easy.
- **Database:** restore a snapshot taken **before** the release. Only possible if you did not apply irreversible schema drops (this project does not).
- **Media:** restore the matching snapshot `media/` folder. Application rollback without DB rollback is usually safe; DB rollback without a matching media tree can leave missing images.

## Monitoring (keep it small)

- `systemctl is-active mws-api`
- `GET /api/health`
- disk: `df -h`, size of `data/`, `uploads/`, `backups/`
- memory/CPU: `systemctl status` / `htop`
- errors: `journalctl -u mws-api -p err`
- backup: `systemctl status mws-backup.timer` and last backup log

Journald rotates logs. Do not write unbounded files from the app (stdout JSON only).

## Cache

Vite hashed `/assets/` can be cached long-term (see Nginx sample). HTML `index.html` should not be cached aggressively. `GET /api/content` is already `Cache-Control: public, max-age=60`. Never cache `/api/admin/*`.

## In-memory rate limits

Login and inquiry limiters are per-process. One instance only. Documented, not a Redis ticket.

## Disaster recovery (honest)

| Event | Detection | Response |
|---|---|---|
| App crash | systemd restart | Check journal; health |
| Server reboot | systemd `WantedBy=multi-user` | Confirm health |
| DB corruption | health/verify:db fail | Restore snapshot; do not auto-overwrite |
| Accidental CMS delete | admin activity logs | Restore snapshot |
| Media deletion | missing files in admin | Restore snapshot `media/` |
| Disk full | `df`; backup/upload fail | Free space; prune backups |
| Bad deploy | smoke/health | Roll back app; restore DB only if schema/data changed |
| SMTP down | health `email=error` / logs | Site stays up; leads persist |

**RTO:** typically minutes to an hour for a VPS restore from a local snapshot; longer if the whole disk is gone and you need off-box copies.  
**RPO:** up to one backup interval (daily timer ≈ up to ~24h) plus unsynced media writes since the last snapshot.

## Scalability

Stay on SQLite and one process while:

- one writer
- agency CMS traffic
- backups finish in a reasonable time

**Triggers to revisit architecture (do not implement now):** second app instance, measurable write-lock pain, DB/backups too large to copy, multi-region, or a platform that cannot ship a local file.

Then: PostgreSQL, object storage for uploads, shared rate-limit store, multiple Node processes behind the proxy.

## Formal migrations

Not introduced. Additive `CREATE IF NOT EXISTS` / `ALTER TABLE ADD COLUMN` on startup is enough at this change rate. Revisit if you run several environments that must upgrade independently.

## CI

`.github/workflows/ci.yml` runs backend tests and a client production build. It does **not** deploy.

Before public DNS/TLS traffic, complete **[VPS-ACCEPTANCE.md](./VPS-ACCEPTANCE.md)**. Files under `deploy/` are templates until they are installed, edited, and tested on the server.
