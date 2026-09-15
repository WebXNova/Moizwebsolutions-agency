import fs from 'node:fs';
import path from 'node:path';

export const SAFE_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

const SAFE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

/**
 * @param {Buffer} header
 */
export function sniffImageKind(header) {
  if (!header || header.length < 12) return null;
  if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) return 'jpeg';
  if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47) return 'png';
  if (
    header[0] === 0x47 &&
    header[1] === 0x49 &&
    header[2] === 0x46 &&
    header[3] === 0x38 &&
    (header[4] === 0x37 || header[4] === 0x39) &&
    header[5] === 0x61
  ) {
    return 'gif';
  }
  const riff = header.toString('ascii', 0, 4);
  const webp = header.toString('ascii', 8, 12);
  if (riff === 'RIFF' && webp === 'WEBP') return 'webp';
  return null;
}

/**
 * @param {string} ext
 * @param {string | null} kind
 */
export function extensionMatchesKind(ext, kind) {
  if (!kind) return false;
  const normalized = ext.toLowerCase();
  if (kind === 'jpeg') return normalized === '.jpg' || normalized === '.jpeg';
  return normalized === `.${kind}`;
}

/**
 * Reject SVG/HTML/JS by name or declared type before the file is stored.
 *
 * @param {{ originalname?: string; mimetype?: string }} file
 * @returns {string | null}
 */
export function rejectUnsafeUploadMeta(file) {
  const name = typeof file?.originalname === 'string' ? file.originalname : '';
  const ext = path.extname(name).toLowerCase();
  const mime = typeof file?.mimetype === 'string' ? file.mimetype.toLowerCase() : '';

  if (!SAFE_IMAGE_EXTENSIONS.includes(ext)) {
    return 'Invalid image type. Use JPG, PNG, WebP, or GIF.';
  }
  if (mime && !SAFE_MIME_TYPES.has(mime) && mime !== 'application/octet-stream') {
    return 'Invalid image type. Use JPG, PNG, WebP, or GIF.';
  }
  return null;
}

/**
 * Confirm the stored bytes are a raster image matching the extension.
 *
 * @param {string} filePath
 * @param {string} originalName
 * @returns {string | null}
 */
export function rejectUnsafeImageFile(filePath, originalName) {
  const ext = path.extname(originalName || filePath).toLowerCase();
  const fd = fs.openSync(filePath, 'r');
  try {
    const header = Buffer.alloc(16);
    const bytesRead = fs.readSync(fd, header, 0, 16, 0);
    const kind = sniffImageKind(header.subarray(0, bytesRead));
    if (!extensionMatchesKind(ext, kind)) {
      return 'File content does not match a supported image type.';
    }
    return null;
  } finally {
    fs.closeSync(fd);
  }
}
