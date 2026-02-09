export async function loadImageFileToDataUrl(file: File): Promise<string> {
  if (!file) throw new Error("No file");
  if (!file.type.startsWith("image/")) throw new Error("File is not an image");
  const maxMb = 20;
  if (file.size > maxMb * 1024 * 1024) throw new Error(`Image too large (> ${maxMb}MB)`);

  const dataUrl = await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result || ""));
    r.onerror = () => rej(new Error("File read failed"));
    r.readAsDataURL(file);
  });

  if (!dataUrl.startsWith("data:image/")) throw new Error("Invalid dataUrl");
  return dataUrl;
}

export async function hashString(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
