import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import { env } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';
import { getDb } from '../db/index.js';
import { formatMedia } from '../cms/formatters.js';
import { logActivity, getClientIp } from '../cms/activity.js';

const uploadDir = env.uploads.dir;
const mediaDir = path.join(uploadDir, 'media');
fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(mediaDir, { recursive: true });

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

const upload = multer({
  storage,
  limits: { fileSize: env.uploads.maxBytes },
  fileFilter(_req, file, cb) {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error('Invalid image type. Use JPG, PNG, WebP, GIF, or SVG.'));
    }
    return cb(null, true);
  },
});

const mediaUpload = multer({
  storage: mediaStorage,
  limits: { fileSize: env.uploads.maxBytes },
  fileFilter(_req, file, cb) {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error('Invalid image type. Use JPG, PNG, WebP, GIF, or SVG.'));
    }
    return cb(null, true);
  },
});

export const uploadsRouter = Router();

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

  const url = subdir
    ? `${env.uploads.publicPath}/${subdir}/${req.file.filename}`
    : `${env.uploads.publicPath}/${req.file.filename}`;

  return res.json({ ok: true, url });
}

uploadsRouter.post('/project-image', requireAuth, (req, res) => {
  upload.single('image')(req, res, (err) => handleUpload(req, res, err));
});

uploadsRouter.post('/media', requireAuth, (req, res) => {
  mediaUpload.single('image')(req, res, (err) => {
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
