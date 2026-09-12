# Real-VPS acceptance procedure

Use this on the **actual** production host (or an identical staging VPS).  
A sample unit file or Nginx snippet in git is **not** a pass.

**Evidence classes**

| Class | Meaning |
|---|---|
| REPOSITORY-VERIFIED | Implemented and/or tested in this repo / local CI. Not proof it works on your VPS. |
| REAL-VPS-VERIFIED | You ran the command below on the live (or twin) server and recorded a pass. |
| NOT YET VERIFIED | No VPS evidence exists yet. Default for every item until you tick it. |

**Item status (repo audit, 2026-08-31)**

Each item below already has a repo classification. After you run the VPS command, change **VPS result** from `NOT YET VERIFIED` to pass/fail.

Go-live requires every **REQUIRES VPS ACTION** / **REQUIRES CONFIGURATION** item to be REAL-VPS-VERIFIED. None of the 45 items is REAL-VPS-VERIFIED today.

Suggested host layout (must match systemd `ReadWritePaths` if you keep the sample unit):

```
/var/www/mws/{client/dist,server/{.env,data,uploads,backups,src}}
```

---

## 1. Linux user creation

| | |
|---|---|
| **Status** | REQUIRES VPS ACTION |
| **Repo** | Documented in DEPLOY.md (`useradd … mws`). No user exists until you create it. |
| **VPS** | `id mws` → uid exists, shell `nologin` or equivalent, **not** root. |
| **VPS result** | NOT YET VERIFIED |

## 2. Application directory permissions

| | |
|---|---|
| **Status** | REQUIRES VPS ACTION |
| **Repo** | DEPLOY.md: owner `mws`, `.env` mode `600`. |
| **VPS** | `namei -l /var/www/mws/server/.env`; `ls -ld data uploads backups`; app readable by `mws`; `.env` not world-readable; `client/dist` readable by `www-data`/`nginx`. |
| **VPS result** | NOT YET VERIFIED |

## 3. Node installation / runtime version

| | |
|---|---|
| **Status** | REQUIRES VPS ACTION |
| **Repo** | `engines.node >= 20.6.0`. Unit uses `/usr/bin/node` (breaks if Node is only via nvm). |
| **VPS** | `sudo -u mws /usr/bin/node -v` (or the path in `ExecStart`) ≥ 20.6. Rebuild `better-sqlite3` on **that** Node. |
| **VPS result** | NOT YET VERIFIED |

## 4. `server/.env` configuration

| | |
|---|---|
| **Status** | REQUIRES CONFIGURATION |
| **Repo** | Fail-closed via `collectStartupProblems` + `npm run verify:env`. Example file is **development** (localhost CORS, empty JWT). |
| **VPS** | On the server, `NODE_ENV=production npm run verify:env` exits 0. Confirm `JWT_SECRET` ≥ 32 chars, production `ALLOWED_ORIGINS`, SMTP filled if mail must send. |
| **VPS result** | NOT YET VERIFIED |

## 5. `DB_PATH`

| | |
|---|---|
| **Status** | REQUIRES CONFIGURATION |
| **Repo** | Default `server/data/portfolio.db`; rejected if under uploads, backups, or `client/dist`. |
| **VPS** | `DB_PATH` resolves outside Nginx `root`; directory writable by `mws`; listed in systemd `ReadWritePaths`. |
| **VPS result** | NOT YET VERIFIED |

## 6. Uploads path

| | |
|---|---|
| **Status** | REQUIRES CONFIGURATION |
| **Repo** | Default `server/uploads/projects`, public prefix `/uploads/projects`. |
| **VPS** | Directory exists, owned by `mws`, on `ReadWritePaths`; `UPLOADS_PUBLIC_PATH` matches Nginx `/uploads/` proxy. |
| **VPS result** | NOT YET VERIFIED |

## 7. `BACKUP_DIR`

| | |
|---|---|
| **Status** | REQUIRES CONFIGURATION |
| **Repo** | Default `server/backups`; refused if nested under uploads. |
| **VPS** | Not under `client/dist` or `/uploads`; writable by `mws`; on `ReadWritePaths`. |
| **VPS result** | NOT YET VERIFIED |

## 8. systemd `ReadWritePaths`

| | |
|---|---|
| **Status** | REQUIRES CONFIGURATION |
| **Repo** | Sample lists `/var/www/mws/server/{data,uploads,backups}` only. Custom `DB_PATH` **must** be added or the unit will fail at runtime. |
| **VPS** | `systemctl cat mws-api` matches real paths; after start, WAL files appear under `DB_PATH`’s directory. |
| **VPS result** | NOT YET VERIFIED |

## 9. systemd `ProtectSystem`

| | |
|---|---|
| **Status** | REQUIRES VPS ACTION |
| **Repo** | `ProtectSystem=full` + `ProtectHome=true` + `NoNewPrivileges=true` in sample unit. Untested on a real systemd. |
| **VPS** | Service stays `active`; uploads and backups still write; `journalctl -u mws-api` has no EACCES on data dirs. |
| **VPS result** | NOT YET VERIFIED |

## 10. systemd restart behavior

| | |
|---|---|
| **Status** | REQUIRES VPS ACTION |
| **Repo** | `Restart=on-failure`, `RestartSec=5`, `WantedBy=multi-user.target`. |
| **VPS** | `sudo kill -9 $(systemctl show -p MainPID --value mws-api)` then `systemctl is-active mws-api` becomes `active` again. |
| **VPS result** | NOT YET VERIFIED |

## 11. Graceful shutdown

| | |
|---|---|
| **Status** | REQUIRES VPS ACTION (code is REPOSITORY-VERIFIED) |
| **Repo** | SIGTERM → `server.close` → `closeDb` → exit 0; 10s force timeout. `TimeoutStopSec=15`. |
| **VPS** | `sudo systemctl stop mws-api`; journal shows `server.shutting_down` then `server.stopped`; no truncated SQLite. |
| **VPS result** | NOT YET VERIFIED |

## 12. Nginx configuration

| | |
|---|---|
| **Status** | REQUIRES CONFIGURATION |
| **Repo** | Sample uses `example.com`; **TLS certificate lines are commented**. `listen 443 ssl http2` may need `http2 on;` on newer Nginx. |
| **VPS** | Real `server_name`; `nginx -t`; cert paths uncommented and valid; reload succeeds. |
| **VPS result** | NOT YET VERIFIED |

## 13. DNS

| | |
|---|---|
| **Status** | REQUIRES VPS ACTION |
| **Repo** | No DNS. Placeholders only. |
| **VPS** | `dig +short A your.domain` (and AAAA if used) points at this VPS; www if you serve it. |
| **VPS result** | NOT YET VERIFIED |

## 14. HTTPS / TLS

| | |
|---|---|
| **Status** | REQUIRES VPS ACTION |
| **Repo** | Let’s Encrypt mentioned; certs not in git (correct). |
| **VPS** | `curl -sI https://your.domain` is `HTTP/2 200` (or 301 to apex); certificate matches host; HSTS present if intended. |
| **VPS result** | NOT YET VERIFIED |

## 15. HTTP → HTTPS redirect

| | |
|---|---|
| **Status** | REQUIRES VPS ACTION |
| **Repo** | Port 80 `return 301 https://$host$request_uri` in sample. |
| **VPS** | `curl -sI http://your.domain` → 301 Location `https://…`. |
| **VPS result** | NOT YET VERIFIED |

## 16. API proxy

| | |
|---|---|
| **Status** | REQUIRES VPS ACTION |
| **Repo** | `location /api/` → `http://127.0.0.1:8787`. Production bind default is loopback. |
| **VPS** | `curl -sI https://your.domain/api/health/live` from the internet; `ss -lntp | grep 8787` is `127.0.0.1` only (not `0.0.0.0`). |
| **VPS result** | NOT YET VERIFIED |

## 17. Frontend static serving

| | |
|---|---|
| **Status** | REQUIRES VPS ACTION |
| **Repo** | Nginx `root …/client/dist`; SPA `try_files`. Client `npm run build` succeeded locally. |
| **VPS** | `https://your.domain/` returns the built `index.html`; `/portfolio` and `/admin/login` do not 404 as files. |
| **VPS result** | NOT YET VERIFIED |

## 18. `/uploads` behavior

| | |
|---|---|
| **Status** | REQUIRES VPS ACTION |
| **Repo** | Nginx proxies `/uploads/` to Express; Express serves that dir with `dotfiles: deny`. |
| **VPS** | A known public image URL returns 200; `https://your.domain/uploads/projects/.env` is not 200. |
| **VPS result** | NOT YET VERIFIED |

## 19. Database not publicly accessible

| | |
|---|---|
| **Status** | REQUIRES VPS ACTION |
| **Repo** | DB is not under Nginx `root`. Regex deny for `.db` only helps if someone copies a DB into `dist`. |
| **VPS** | `curl -sI https://your.domain/server/data/portfolio.db` and `/data/portfolio.db` are 404 (not 200/403 with body). |
| **VPS result** | NOT YET VERIFIED |

## 20. Backups not publicly accessible

| | |
|---|---|
| **Status** | REQUIRES VPS ACTION |
| **Repo** | `BACKUP_DIR` is not the Nginx root. |
| **VPS** | `curl -sI https://your.domain/server/backups/` and `/backups/` are 404. |
| **VPS result** | NOT YET VERIFIED |

## 21. `.env` not publicly accessible

| | |
|---|---|
| **Status** | REQUIRES VPS ACTION |
| **Repo** | `.env` gitignored; Nginx deny `\.env$`. |
| **VPS** | `curl -sI https://your.domain/.env` and `/server/.env` are 404. |
| **VPS result** | NOT YET VERIFIED |

## 22. CORS production origin

| | |
|---|---|
| **Status** | REQUIRES CONFIGURATION |
| **Repo** | Production **requires** `ALLOWED_ORIGINS`; https except localhost. Same-origin Nginx still sends `Origin: https://your.domain` on POST. |
| **VPS** | `ALLOWED_ORIGINS` includes `https://your.domain` (and `www` if used). Browser inquiry POST is not a CORS error. |
| **VPS result** | NOT YET VERIFIED |

## 23. `TRUST_PROXY`

| | |
|---|---|
| **Status** | REQUIRES CONFIGURATION |
| **Repo** | Integer 0–32; docs say `1` behind Nginx. Default in `.env.example` is `0` (wrong for this topology if copied blindly). |
| **VPS** | Production `.env` has `TRUST_PROXY=1`. After a 429, confirm `X-Forwarded-For` is not trivially spoofable from the public internet (proxy overwrites). |
| **VPS result** | NOT YET VERIFIED |

## 24. Health / live

| | |
|---|---|
| **Status** | REQUIRES VPS ACTION (endpoint is REPOSITORY-VERIFIED) |
| **Repo** | `GET /api/health/live` → `{ ok: true }`. Covered by local tests + `npm run smoke`. |
| **VPS** | `curl -sS https://your.domain/api/health/live` |
| **VPS result** | NOT YET VERIFIED |

## 25. Health / readiness

| | |
|---|---|
| **Status** | REQUIRES VPS ACTION (endpoint is REPOSITORY-VERIFIED) |
| **Repo** | `GET /api/health` → `{ ok, db, uploads, email }`; 503 if db/uploads fail; no SMTP host/error. |
| **VPS** | Same URL over HTTPS; `ok: true`, `db`/`uploads` `ok`; `email` `configured` if SMTP is required for go-live mail. |
| **VPS result** | NOT YET VERIFIED |

## 26. Public content

| | |
|---|---|
| **Status** | REQUIRES VPS ACTION |
| **Repo** | `GET /api/content` in tests and smoke. |
| **VPS** | `curl -sS https://your.domain/api/content` has `ok: true` and `content`; homepage in a browser shows CMS (or honest empty), not a proxy error. |
| **VPS result** | NOT YET VERIFIED |

## 27. Admin login

| | |
|---|---|
| **Status** | REQUIRES VPS ACTION |
| **Repo** | Login API + rate limits tested locally. Smoke login is **optional** env. Production admin must exist (`ADMIN_*` seed or Users UI). |
| **VPS** | Sign in at `https://your.domain/admin/login` with the real admin (not fixtures). Wrong password stays 401. |
| **VPS result** | NOT YET VERIFIED |

## 28. Authenticated admin API

| | |
|---|---|
| **Status** | REQUIRES VPS ACTION |
| **Repo** | Dashboard/CMS routes require JWT; viewer cannot write (tests). |
| **VPS** | After login, dashboard loads; `GET /api/admin/dashboard` with Bearer token is 200; without token 401. |
| **VPS result** | NOT YET VERIFIED |

## 29. Project CRUD

| | |
|---|---|
| **Status** | REQUIRES VPS ACTION |
| **Repo** | CRUD + publish invariants in `npm test` / `test:phase2`. **Not** in production `smoke` (avoids mutating live data). |
| **VPS** | Create a **disposable** draft, confirm it is absent from public `/api/projects`, publish it, edit, unpublish or delete. |
| **VPS result** | NOT YET VERIFIED |

## 30. Inquiry submission

| | |
|---|---|
| **Status** | REQUIRES VPS ACTION |
| **Repo** | Persist-without-SMTP and validation tested locally. Smoke only checks **invalid** 422. |
| **VPS** | Submit a **test** brief via the public wizard; row appears in Admin → Inquiries; `email_status` is `sent` if SMTP is live, else `failed` and the row still exists. |
| **VPS result** | NOT YET VERIFIED |

## 31. Media upload

| | |
|---|---|
| **Status** | REQUIRES VPS ACTION |
| **Repo** | Multer + auth + extension/size limits; local media tests. Not in smoke. |
| **VPS** | Admin Media: upload a small PNG; file appears under `UPLOADS_DIR`; journal has no EACCES. |
| **VPS result** | NOT YET VERIFIED |

## 32. Media retrieval

| | |
|---|---|
| **Status** | REQUIRES VPS ACTION |
| **Repo** | Public URL via `/uploads/…`. |
| **VPS** | Open the uploaded URL over HTTPS; image displays. Use it on a draft project card if needed. |
| **VPS result** | NOT YET VERIFIED |

## 33. Backup creation

| | |
|---|---|
| **Status** | REQUIRES VPS ACTION (script is REPOSITORY-VERIFIED) |
| **Repo** | `npm run backup` → snapshot dir + verified SQLite + media copy. Local test writes a `.db` outside uploads. |
| **VPS** | `sudo -u mws bash -lc 'cd /var/www/mws/server && npm run backup'` creates a new `snapshot-*`. |
| **VPS result** | NOT YET VERIFIED |

## 34. Backup verification

| | |
|---|---|
| **Status** | REQUIRES VPS ACTION |
| **Repo** | `verifyBackupFile` opens the snapshot read-only; `npm run verify:db` for the live DB. |
| **VPS** | Snapshot `portfolio.db` size &gt; 0; `sqlite3 snapshot-…/portfolio.db 'SELECT COUNT(*) FROM sqlite_master;'` succeeds. |
| **VPS result** | NOT YET VERIFIED |

## 35. Backup restoration on a disposable environment

| | |
|---|---|
| **Status** | REQUIRES VPS ACTION |
| **Repo** | Procedure in DEPLOY.md. **Never** the first restore against live. Local tests do **not** run a full stop-replace-start cycle. |
| **VPS** | On a **copy** of the VPS or a second directory: stop API, restore snapshot DB, start, health 200. Then discard the copy. |
| **VPS result** | NOT YET VERIFIED |

## 36. Media restoration

| | |
|---|---|
| **Status** | REQUIRES VPS ACTION |
| **Repo** | Snapshot includes `media/`. Not atomic with SQLite. |
| **VPS** | On the same disposable restore, copy `media/` over uploads; a known file URL works. |
| **VPS result** | NOT YET VERIFIED |

## 37. System reboot recovery

| | |
|---|---|
| **Status** | REQUIRES VPS ACTION |
| **Repo** | `WantedBy=multi-user.target`. Untested on hardware. |
| **VPS** | `sudo reboot`; after boot `systemctl is-active mws-api nginx` and HTTPS health. |
| **VPS result** | NOT YET VERIFIED |

## 38. Application crash recovery

| | |
|---|---|
| **Status** | REQUIRES VPS ACTION |
| **Repo** | Same as item 10. |
| **VPS** | SIGKILL the node PID; service returns to `active`; health 200. |
| **VPS result** | NOT YET VERIFIED |

## 39. Disk-space checks

| | |
|---|---|
| **Status** | REQUIRES VPS ACTION |
| **Repo** | Docs mention `df`. No in-app disk monitor (intentional). |
| **VPS** | `df -h`; `du -sh data uploads backups`; enough headroom for WAL + next snapshot. |
| **VPS result** | NOT YET VERIFIED |

## 40. Log visibility

| | |
|---|---|
| **Status** | REQUIRES VPS ACTION |
| **Repo** | JSON to stdout; unit `StandardOutput=journal`. |
| **VPS** | `journalctl -u mws-api -n 50 --no-pager` shows `server.started`; no secrets. |
| **VPS result** | NOT YET VERIFIED |

## 41. Backup timer execution

| | |
|---|---|
| **Status** | REQUIRES VPS ACTION |
| **Repo** | `mws-backup.timer` daily ~02:15 + jitter. Unit is not enabled by git. |
| **VPS** | `systemctl enable --now mws-backup.timer`; `systemctl list-timers mws-backup`; optionally `systemctl start mws-backup.service` once and confirm a snapshot. |
| **VPS result** | NOT YET VERIFIED |

## 42. Off-site backup configuration

| | |
|---|---|
| **Status** | REQUIRES VPS ACTION |
| **Repo** | Mentions restic/Borg/encrypted disk. **No** vendor config in the repo (correct). |
| **VPS** | A copy of `BACKUP_DIR` exists off-box; restore from that copy is possible. |
| **VPS result** | NOT YET VERIFIED |

## 43. Production build

| | |
|---|---|
| **Status** | REQUIRES VPS ACTION (local build is REPOSITORY-VERIFIED) |
| **Repo** | `cd client && npm run build` succeeded in Phase 4. |
| **VPS** | Build **on the server** (or CI artifact) into the Nginx `root`; `index.html` + hashed `/assets/` match that build. |
| **VPS result** | NOT YET VERIFIED |

## 44. Browser smoke test

| | |
|---|---|
| **Status** | NOT VERIFIED |
| **Repo** | No Playwright/Cypress. Manual only. |
| **VPS** | Desktop: home, portfolio, contact, inquiry, admin login, one CMS save, SEO title on home. |
| **VPS result** | NOT YET VERIFIED |

## 45. Mobile browser smoke test

| | |
|---|---|
| **Status** | NOT VERIFIED |
| **Repo** | None. |
| **VPS** | Phone (or DevTools mobile): home layout, inquiry, admin. |
| **VPS result** | NOT YET VERIFIED |

---

## Convenience commands (after DNS/TLS)

```bash
# from your laptop
curl -sS https://YOUR_DOMAIN/api/health/live
curl -sS https://YOUR_DOMAIN/api/health
cd server && SMOKE_BASE_URL=https://YOUR_DOMAIN npm run smoke
# optional:
SMOKE_BASE_URL=https://YOUR_DOMAIN SMOKE_ADMIN_EMAIL=… SMOKE_ADMIN_PASSWORD=… npm run smoke
```

Smoke does **not** replace items 29–32, 35–38, or 44–45.

---

## Summary (this audit)

### REPOSITORY-VERIFIED

Fail-closed production env validation; DB/uploads/backup path guards; health live + readiness (local tests); security headers + request id; SQLite backup() + file open verify; inquiry persist; auth/RBAC; project publish invariants; client production build (local); systemd/Nginx **samples**; smoke script (against a running API, not used on a real VPS yet).

### REAL-VPS-VERIFIED

**None.** No host in this engagement ran these checks.

### NOT YET VERIFIED

All 45 VPS results above, plus off-site restore, reboot, TLS, DNS, and browsers.

### Code change required for go-live?

**No**, if you follow this procedure and fill the sample configs (especially Nginx certs, production `.env`, `TRUST_PROXY=1`, `ReadWritePaths`). Do not treat commented TLS lines as a live site.

### Go-live readiness

**NOT READY** for public traffic until the VPS column is filled.

After items 1–28, 33–34, 39–43 pass on the VPS, status may become **CONDITIONALLY READY** (still missing disposable restore, reboot, off-site copy, and browser/mobile).

**READY** only when 1–45 are REAL-VPS-VERIFIED (item 42 may be “accepted risk” only if you explicitly accept on-box-only backups — that is not recommended).
