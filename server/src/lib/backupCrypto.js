import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';
import fs from 'node:fs';

const MAGIC = Buffer.from('MWSB1');
const SALT_LEN = 16;
const IV_LEN = 12;
const TAG_LEN = 16;
const KEY_LEN = 32;

/**
 * @param {string} passphrase
 * @param {Buffer} salt
 */
function deriveKey(passphrase, salt) {
  return scryptSync(passphrase, salt, KEY_LEN, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
}

/**
 * AES-256-GCM file encryption. Output is a sibling `.enc` file.
 * Never logs the passphrase.
 *
 * @param {string} sourcePath
 * @param {string} destPath
 * @param {string} passphrase
 */
export function encryptFile(sourcePath, destPath, passphrase) {
  if (!passphrase || passphrase.length < 16) {
    throw new Error('BACKUP_PASSPHRASE must be at least 16 characters.');
  }
  const salt = randomBytes(SALT_LEN);
  const iv = randomBytes(IV_LEN);
  const key = deriveKey(passphrase, salt);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const plain = fs.readFileSync(sourcePath);
  const encrypted = Buffer.concat([cipher.update(plain), cipher.final()]);
  const tag = cipher.getAuthTag();
  fs.writeFileSync(destPath, Buffer.concat([MAGIC, salt, iv, tag, encrypted]));
}

/**
 * @param {string} sourcePath
 * @param {string} destPath
 * @param {string} passphrase
 */
export function decryptFile(sourcePath, destPath, passphrase) {
  if (!passphrase) throw new Error('BACKUP_PASSPHRASE is required to decrypt this archive.');
  const packed = fs.readFileSync(sourcePath);
  if (packed.length < MAGIC.length + SALT_LEN + IV_LEN + TAG_LEN + 1) {
    throw new Error('Encrypted backup is truncated.');
  }
  if (!packed.subarray(0, MAGIC.length).equals(MAGIC)) {
    throw new Error('Encrypted backup header is not recognised.');
  }
  let offset = MAGIC.length;
  const salt = packed.subarray(offset, offset + SALT_LEN);
  offset += SALT_LEN;
  const iv = packed.subarray(offset, offset + IV_LEN);
  offset += IV_LEN;
  const tag = packed.subarray(offset, offset + TAG_LEN);
  offset += TAG_LEN;
  const encrypted = packed.subarray(offset);
  const key = deriveKey(passphrase, salt);
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  fs.writeFileSync(destPath, plain);
}

export function isEncryptedBackup(filePath) {
  return String(filePath).endsWith('.enc');
}
