import type { AxiosResponse } from "axios";

export function downloadAxiosBlob(
  response: AxiosResponse<Blob>,
  fallbackFilename: string,
) {
  const disposition = response.headers["content-disposition"] as
    string | undefined;
  const encodedName = disposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  const plainName = disposition?.match(/filename="?([^";]+)"?/i)?.[1];
  const filename = encodedName
    ? decodeURIComponent(encodedName)
    : plainName || fallbackFilename;
  const url = URL.createObjectURL(response.data);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
