# Internal API notes

Lightweight reference for the agency CMS. Public JSON uses `{ ok: true, ... }` or `{ ok: false, code, message }`. Admin writes require a Bearer JWT.

## Authentication

- `POST /api/admin/auth/login` — email + password. Rate limited per IP and email.
- `GET /api/admin/auth/me` — current admin.
- `POST /api/admin/auth/logout` — client discards the token.

Roles: `super_admin`, `content_manager`, `editor` (write), `viewer` (read). User administration is `super_admin` only. Inactive accounts cannot sign in.

## Public

- `GET /api/health` — `{ ok, db, email }`. No SMTP host/error strings.
- `GET /api/content` — homepage CMS bundle (hero, services, testimonials, updates already visibility-filtered, SEO, etc.). Cached 60s.
- `GET /api/projects` — published projects only.
- `GET /api/projects/:id` — 404 for unpublished unless an admin token is present.
- `GET /api/categories`
- `POST /api/project-inquiry` — public lead capture. Rate limited. Honeypot field `company`.

Dedicated `/api/content/*` sub-routes exist for the same collections. The live site uses `GET /api/content`.

## Inquiry workflow

1. Validate payload against the inquiry catalog.
2. Persist a lead (`status=new`). Duplicate emails are allowed.
3. Attempt the business notification email.
4. Record `email_status` `sent` or `failed`. A mail failure does **not** drop the lead.
5. Public response is `201` with `inquiryId` only.

Admin (authenticated):

- `GET /api/admin/inquiries` — pagination, `search`, `status`, `emailStatus`, `from`, `to`.
- `GET /api/admin/inquiries/:id`
- `PUT /api/admin/inquiries/:id` — `status`, `notes`. Write role required.
- `POST /api/admin/inquiries/:id/resend` — retry the business notification.
- `DELETE` returns 405. Archive instead.

Statuses: `new`, `contacted`, `qualified`, `proposal`, `won`, `lost`, `archived`.

## Projects

Create/update via `/api/projects` (auth + write). `published` is only changed when the field is present on PUT. Public lists never include drafts.

## CMS

`/api/admin/cms/...` covers settings, hero, services, testimonials, companies, technologies, process steps, updates, social links, navigation, media, activity logs, and users.

Settings keys: `hero`, `site`, `contact`, `cta`, `heroCta`, `footer`, `seo`, `sectionLabels`, `servicesContent`. Navigation create/delete is 405. User delete is 405 (deactivate instead).

## Admin dashboard

`GET /api/admin/dashboard` — project/CMS counts, inquiry totals (including today / last 7 days in UTC), health flags, recent projects and activity.
