import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import { env } from '../config/env.js';
import { requireAuth, requireWrite } from '../middleware/auth.js';
import { getDb } from '../db/index.js';
import { formatMedia } from '../cms/formatters.js';
import { logActivity, getClientIp } from '../cms/activity.js';
import { createRateLimiter } from '../lib/rateLimit.js';
import { rejectUnsafeImageFile, rejectUnsafeUploadMeta, SAFE_IMAGE_EXTENSIONS } from '../lib/imageMagic.js';

const uploadDir = env.uploads.dir;
const mediaDir = path.join(uploadDir, 'media');
fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(mediaDir, { recursive: true });

const uploadLimiter = createRateLimiter({
  windowMs: env.rateLimit.uploadWindowMs,
  maxPerKey: env.rateLimit.uploadMaxPerKey,
  maxGlobal: env.rateLimit.uploadMaxPerKey * 20,
});

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

const mediaStorage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, mediaDir);
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

function imageFileFilter(_req, file, cb) {
  const rejected = rejectUnsafeUploadMeta(file);
  if (rejected) return cb(new Error(rejected));
  const ext = path.extname(file.originalname).toLowerCase();
  if (!SAFE_IMAGE_EXTENSIONS.includes(ext)) {
    return cb(new Error('Invalid image type. Use JPG, PNG, WebP, or GIF.'));
  }
  return cb(null, true);
}

const upload = multer({
  storage,
  limits: {
    fileSize: env.uploads.maxBytes,
    files: 1,
    fields: 8,
    fieldNameSize: 120,
    fieldNestingDepth: 1,
  },
  fileFilter: imageFileFilter,
});

const mediaUpload = multer({
  storage: mediaStorage,
  limits: {
    fileSize: env.uploads.maxBytes,
    files: 1,
    fields: 8,
    fieldNameSize: 120,
    fieldNestingDepth: 1,
  },
  fileFilter: imageFileFilter,
});

export const uploadsRouter = Router();

function removeUploadedFile(file) {
  if (!file?.path) return;
  try {
    fs.unlinkSync(file.path);
  } catch {
    // already gone
  }
}

function enforceUploadRateLimit(req, res) {
  const key = req.admin?.id || req.ip || 'unknown';
  const limit = uploadLimiter.check(key);
  if (!limit.allowed) {
    res.set('Retry-After', String(limit.retryAfterSeconds));
    res.status(429).json({
      ok: false,
      code: 'rate_limited',
      message: 'Too many uploads. Please try again shortly.',
      retryAfterSeconds: limit.retryAfterSeconds,
    });
    return false;
  }
  return true;
}

function handleUpload(req, res, err, subdir = '') {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Image is too large. Maximum size is 5 MB.'
        : 'Upload failed.';
    return res.status(400).json({ ok: false, code: 'upload_failed', message });
  }
  if (err) {
    return res.status(400).json({
      ok: false,
      code: 'upload_failed',
      message: err.message || 'Upload failed.',
    });
  }
  if (!req.file) {
    return res.status(400).json({
      ok: false,
      code: 'validation_failed',
      message: 'No image file provided.',
    });
  }

  const contentError = rejectUnsafeImageFile(req.file.path, req.file.originalname);
  if (contentError) {
    removeUploadedFile(req.file);
    return res.status(400).json({ ok: false, code: 'upload_failed', message: contentError });
  }

  const url = subdir
    ? `${env.uploads.publicPath}/${subdir}/${req.file.filename}`
    : `${env.uploads.publicPath}/${req.file.filename}`;

  return res.json({ ok: true, url });
}

uploadsRouter.post('/project-image', requireAuth, requireWrite, (req, res) => {
  if (!enforceUploadRateLimit(req, res)) return;
  upload.single('image')(req, res, (err) => handleUpload(req, res, err));
});

uploadsRouter.post('/media', requireAuth, requireWrite, (req, res) => {
  if (!enforceUploadRateLimit(req, res)) return;
  mediaUpload.single('image')(req, res, (err) => {
    if (err || !req.file) {
      return handleUpload(req, res, err, 'media');
    }

    const contentError = rejectUnsafeImageFile(req.file.path, req.file.originalname);
    if (contentError) {
      removeUploadedFile(req.file);
      return res.status(400).json({ ok: false, code: 'upload_failed', message: contentError });
    }

    const url = `${env.uploads.publicPath}/media/${req.file.filename}`;
    const id = randomUUID();
    const altText = typeof req.body?.altText === 'string' ? req.body.altText : '';

    getDb().prepare(`
      INSERT INTO media (id, filename, url, mime_type, size_bytes, alt_text)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, req.file.originalname, url, req.file.mimetype, req.file.size, altText);

    logActivity({
      admin: req.admin,
      action: 'uploaded_media',
      resourceType: 'media',
      resourceId: id,
      ip: getClientIp(req),
    });

    const row = getDb().prepare('SELECT * FROM media WHERE id = ?').get(id);
    return res.json({ ok: true, url, media: formatMedia(row) });
  });
});
