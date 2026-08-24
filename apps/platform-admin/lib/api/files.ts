// src/lib/api/files.ts
//
// Signed direct-to-Cloudinary upload flow:
//   1. GET  /files/upload-url      -> signed params (apiKey, cloudName,
//                                     folder, signature, timestamp)
//   2. POST https://api.cloudinary.com/v1_1/{cloudName}/image/upload
//                                  -> multipart upload straight to Cloudinary
//   3. POST /files/upload-complete -> register the file record with the API
//
// Returns the Cloudinary secure_url which is then stored on the entity
// (institution / faculty / department) as its `logo` field.

import { axiosConfig } from "@/utils/axios-config";

export interface UploadUrlParams {
  apiKey: string;
  cloudName: string;
  folder: string;
  signature: string;
  timestamp: number;
  purpose: string;
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  bytes?: number;
  format?: string;
}

/**
 * Step 1 — Get signed upload parameters from the API.
 * The signature only signs folder + timestamp, so those values must be
 * forwarded to Cloudinary exactly as received here.
 */
export async function getUploadUrl(
  folder: string,
  purpose: string = "logo",
): Promise<UploadUrlParams> {
  const response = await axiosConfig.get("/files/upload-url", {
    params: { folder, purpose },
  });
  return response.data;
}

/**
 * Step 2 — Upload the file directly to Cloudinary (bypasses our API).
 */
export async function uploadToCloudinary(
  file: File,
  params: UploadUrlParams,
): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", params.apiKey);
  formData.append("timestamp", String(params.timestamp));
  // Must match what was signed in step 1.
  formData.append("folder", params.folder);
  formData.append("signature", params.signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${params.cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    let message = `Cloudinary upload failed (${response.status})`;
    try {
      const error = await response.json();
      if (error?.error?.message) message = error.error.message;
    } catch {
      // Non-JSON error body - keep the generic message.
    }
    throw new Error(message);
  }

  return response.json();
}

/**
 * Step 3 — Register the uploaded file record with the API.
 */
export async function completeFileUpload(payload: {
  url: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  folder: string;
  publicId: string;
  purpose: string;
}): Promise<unknown> {
  const response = await axiosConfig.post("/files/upload-complete", payload);
  return response.data;
}

export interface EntityLogoUploadResult {
  /** Cloudinary secure_url - store this on the entity's `logo` field. */
  url: string;
  publicId: string;
}

/**
 * Full logo upload flow for an entity (institution / faculty / department).
 *
 * @param file   PNG or JPEG image (PDFKit receipts can't embed webp/SVG).
 * @param folder Cloudinary folder, e.g. "institution-logos".
 */
export async function uploadEntityLogo(
  file: File,
  folder: string,
): Promise<EntityLogoUploadResult> {
  // Step 1 - signed params
  const params = await getUploadUrl(folder, "logo");

  // Step 2 - direct Cloudinary upload
  const uploaded = await uploadToCloudinary(file, params);

  // Step 3 - register the file record. The file itself is already uploaded at
  // this point, so a registration failure shouldn't lose the URL.
  try {
    await completeFileUpload({
      url: uploaded.secure_url,
      filename: `${uploaded.public_id}.${uploaded.format || "png"}`,
      originalName: file.name,
      mimeType: file.type || `image/${uploaded.format || "png"}`,
      size: uploaded.bytes ?? file.size,
      folder: params.folder,
      publicId: uploaded.public_id,
      purpose: params.purpose || "logo",
    });
  } catch (error) {
    console.error("Failed to register uploaded file:", error);
  }

  return { url: uploaded.secure_url, publicId: uploaded.public_id };
}