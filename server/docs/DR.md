# Backup and restore

Practical recovery for the Moiz Web Solutions SQLite API. One VPS, one Node process.

## Where backups are stored

| Copy | Path | Survives VPS disk loss? |
|---|---|---|
| Local snapshot directory | `BACKUP_DIR/snapshot-<timestamp>/` (`portfolio.db`, `media/`, `manifest.json`) | No |
| Compressed archive | `BACKUP_DIR/snapshot-<timestamp>.tar.gz` | No |
| Encrypted archive | `BACKUP_DIR/snapshot-<timestamp>.tar.gz.enc` when `BACKUP_PASSPHRASE` is set | No |
| Off-server copy | `BACKUP_OFFSITE_DIR/<same filename>` | **Yes**, if that directory is another disk, USB, or an rclone/sshfs mount |

Nginx must not serve `BACKUP_DIR`. Default is `server/backups/` (mode `750`, owner `mws`).

## How backups are created

Daily systemd timer (`deploy/systemd/mws-backup.timer`, ~02:15 plus jitter):

```bash
sudo cp deploy/systemd/mws-backup.service deploy/systemd/mws-backup.timer /etc/systemd/system/
sudo systemctl enable --now mws-backup.timer
sudo systemctl start mws-backup.service   # first run now
sudo systemctl list-timers mws-backup
```

Manual:

```bash
cd /var/www/mws/server && npm run backup
```

Flow: SQLite `backup()` (consistent) → copy uploads → `tar.gz` → encrypt if passphrase set → copy to `BACKUP_OFFSITE_DIR` if set → prune older than `BACKUP_KEEP` (default 14). The newest snapshot is never deleted.

The timer is **not** running until you enable it on the VPS.

## Environment

```
BACKUP_DIR=/var/www/mws/server/backups
BACKUP_KEEP=14
BACKUP_PASSPHRASE=                    # 16+ characters; required in production if off-site is set
BACKUP_OFFSITE_DIR=/mnt/mws-offsite   # rclone mount, USB, or second disk — not on the VPS boot volume
```

Do not put `.env` inside a snapshot. Passwords in the database are bcrypt hashes; inquiry PII is in the SQLite file — encrypt before it leaves the server.

Logs record filenames and byte counts only. The passphrase is redacted.

## How to verify a backup

```bash
# Opens the live configured DB (not a restore):
npm run verify:db

# Restore into a throwaway folder, then inspect:
npm run restore:db -- --source /var/www/mws/server/backups/snapshot-YYYY-… --target /tmp/mws-restore
```

Success logs `restore.complete` with `integrity=ok` and row counts. The live `DB_PATH` is refused as `--target`.

## How to restore (non-live)

1. Pick an empty directory that is **not** `DB_PATH` or `uploads/`.
2. `npm run restore:db -- --source <dir|.tar.gz|.tar.gz.enc> --target /tmp/mws-restore`
3. Confirm `integrity=ok` and table counts.

Encrypted archives need `BACKUP_PASSPHRASE` in the environment (same value used to encrypt).

## How to replace a failed live database

1. `sudo systemctl stop mws-api`
2. Copy the current `DB_PATH` aside (even if it looks corrupt).
3. Restore a snapshot to `/tmp/mws-restore` first and run `npm run restore:db` as above.
4. Only then copy `/tmp/mws-restore/portfolio.db` over `DB_PATH` (and restore `media/` onto `UPLOADS_DIR` if needed).
5. `sudo systemctl start mws-api`

Do not restore onto the live path with this script. That refusal is intentional.

## How to restart the application

```bash
sudo systemctl restart mws-api
curl -fsS http://127.0.0.1:8787/api/health/live
curl -fsS http://127.0.0.1:8787/api/health
```

## How to verify recovery

- `GET /api/health` → `{ ok: true, db: "ok" }`
- Admin login still works
- Project list and a known inquiry id are present
- `journalctl -u mws-api -n 50` has no `db_init_failed`

RPO is up to one backup interval (~24h with the daily timer) plus uploads written after that snapshot.
