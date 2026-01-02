import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
import { getEnv } from "@/lib/env";

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB

export function getStorageRoot() {
  return getEnv().STORAGE_PATH || path.join(process.cwd(), "storage");
}

export function safeSubpath(input: string) {
  const cleaned = String(input || "")
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/\.\./g, "")
    .replace(/[^a-zA-Z0-9/_-]+/g, "-")
    .replace(/\/+/g, "/");
  return cleaned;
}

export async function ensureDir(dirPath: string) {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function saveImageForStore(input: {
  storeId: string;
  folder?: string | null;
  file: File;
}) {
  if (input.file.size > MAX_UPLOAD_BYTES) {
    throw new Error("File too large.");
  }

  const arrayBuffer = await input.file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Identify dimensions early (also validates it's an image).
  const image = sharp(buffer, { failOnError: true });
  const meta = await image.metadata();
  if (!meta.width || !meta.height) throw new Error("Invalid image.");
  if (meta.width > 6000 || meta.height > 6000) throw new Error("Image dimensions too large.");

  const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");

  const folder = safeSubpath(input.folder || "");
  const filenameBase = `${Date.now()}-${sha256.slice(0, 12)}`;
  const filename = `${filenameBase}.webp`;

  const key = folder ? `${folder}/${filename}` : filename;

  const root = getStorageRoot();
  const storeDir = path.join(root, input.storeId);
  const targetDir = folder ? path.join(storeDir, folder) : storeDir;
  const absPath = path.join(targetDir, filename);

  await ensureDir(targetDir);

  const out = await image
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  await fs.writeFile(absPath, out);

  const outMeta = await sharp(out).metadata();

  return {
    key,
    filename,
    folder: folder || null,
    mimeType: "image/webp",
    sizeBytes: out.length,
    width: outMeta.width ?? null,
    height: outMeta.height ?? null,
    sha256,
    absPath,
  };
}

export function resolveStoreFilePath(storeId: string, key: string) {
  const root = getStorageRoot();
  const safeKey = safeSubpath(key);
  return path.join(root, storeId, safeKey);
}


