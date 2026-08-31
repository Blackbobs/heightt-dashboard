// src/lib/api/files.ts
//
// Signed direct-to-Cloudinary upload flow:
//   1. GET  /v1/files/upload-url   -> signed params (apiKey, cloudName,
//                                     folder, signature, timestamp)
//   2. POST https://api.cloudinary.com/v1_1/{cloudName}/image/upload
//                                  -> multipart upload straight to Cloudinary
//
// Returns the Cloudinary secure_url which is then stored on the entity
// (institution / faculty / department / organization) as its `logo` field.

import { axiosConfig } from "@/utils/axios-config";
import { getState } from "@/store/auth-store";

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
  const accessToken = getState().token;
  const response = await axiosConfig.get("/v1/files/upload-url", {
    params: { folder, purpose },
    headers:
      accessToken && accessToken !== "cookie-auth"
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined,
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

export interface EntityLogoUploadResult {
  /** Cloudinary secure_url - store this on the entity's `logo` field. */
  url: string;
  publicId: string;
}

/**
 * Full logo upload flow for an entity.
 *
 * @param file   JPEG, PNG, or WebP image validated by the picker.
 * @param folder Cloudinary folder, e.g. "logos".
 */
export async function uploadEntityLogo(
  file: File,
  folder: string,
): Promise<EntityLogoUploadResult> {
  // Step 1 - signed params
  const params = await getUploadUrl(folder, "logo");

  // Step 2 - direct Cloudinary upload
  const uploaded = await uploadToCloudinary(file, params);

  return { url: uploaded.secure_url, publicId: uploaded.public_id };
}
