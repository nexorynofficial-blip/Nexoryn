import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env";

let configured = false;
function ensureConfigured() {
  if (configured) return;
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
  });
  configured = true;
}

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
}

const VALID_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function isValidImageMime(mimeType: string): boolean {
  return VALID_IMAGE_MIME_TYPES.includes(mimeType);
}

export function uploadToCloudinary(
  buffer: Buffer,
  folder = "nexoryn/uploads",
): Promise<CloudinaryUploadResult> {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        tags: ["nexoryn"],
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload returned no result"));
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width ?? 0,
          height: result.height ?? 0,
          bytes: result.bytes ?? 0,
          format: result.format ?? "",
        });
      },
    );
    stream.end(buffer);
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  ensureConfigured();
  await cloudinary.uploader.destroy(publicId);
}

/** Best-effort extraction of a Cloudinary public_id from one of our own
 * secure_urls, for the delete path. Cloudinary doesn't otherwise round-trip
 * the public_id back from a bare URL. */
export function publicIdFromUrl(url: string, folder = "nexoryn/uploads"): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
  if (!match) return null;
  const path = match[1];
  return path.startsWith(folder) ? path : `${folder}/${path.split("/").pop()}`;
}
