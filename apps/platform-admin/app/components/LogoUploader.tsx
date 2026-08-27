// src/app/components/LogoUploader.tsx
//
// Reusable logo picker for entity create forms.
// Runs the signed Cloudinary upload flow (see lib/api/files.ts) and reports the
// resulting secure_url back through `onChange` so the parent form can send it
// as the entity's `logo` field.

"use client";

import React, { useRef, useState } from "react";
import { Image as ImageIcon, Loader2, Plus, X } from "lucide-react";
import { uploadEntityLogo } from "@/lib/api/files";

interface LogoUploaderProps {
  /** Current logo URL - empty/null when no logo has been uploaded yet. */
  value?: string | null;
  onChange: (url: string | null) => void;
  /** Cloudinary folder signed by the API, e.g. "logos". */
  folder: string;
  label?: string;
  disabled?: boolean;
}

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_LOGO_SIZE = 5 * 1024 * 1024;

export default function LogoUploader({
  value,
  onChange,
  folder,
  label = "Logo",
  disabled = false,
}: LogoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset so selecting the same file again still triggers onChange.
    event.target.value = "";
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      alert("Logo must be JPEG, PNG, or WebP.");
      return;
    }

    if (file.size > MAX_LOGO_SIZE) {
      alert("Logo cannot exceed 5 MB.");
      return;
    }

    setUploading(true);
    try {
      const { url } = await uploadEntityLogo(file, folder);
      onChange(url);
    } catch (error: any) {
      console.error("Logo upload failed:", error);
      alert(error?.message || "Failed to upload logo. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="flex items-center gap-3">
        {value ? (
          <div style={{ position: "relative", flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Logo preview"
              style={{
                width: 64,
                height: 64,
                borderRadius: 12,
                objectFit: "cover",
                border: "1px solid var(--border)",
                background: "#f8fafc",
              }}
            />
            {!disabled && !uploading && (
              <button
                type="button"
                title="Remove logo"
                onClick={() => onChange(null)}
                className="flex items-center justify-center"
                style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  border: "none",
                  cursor: "pointer",
                  background: "#ef4444",
                  color: "#fff",
                }}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ) : (
          <div
            className="flex items-center justify-center text-slate-300"
            style={{
              width: 64,
              height: 64,
              borderRadius: 12,
              border: "1.5px dashed var(--border)",
              flexShrink: 0,
            }}
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-[#1a5cff]" />
            ) : (
              <ImageIcon className="w-5 h-5" />
            )}
          </div>
        )}

        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            style={{ display: "none" }}
            onChange={handleSelect}
            disabled={disabled || uploading}
          />
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" /> Uploading...
              </>
            ) : (
              <>
                <Plus className="w-3 h-3" />
                {value ? "Replace Logo" : "Upload Logo"}
              </>
            )}
          </button>
          <p className="text-xs text-slate-400 mt-1">
            JPEG, PNG, or WebP • max 5 MB • square ~256×256 recommended
          </p>
        </div>
      </div>
    </div>
  );
}
