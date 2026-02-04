export async function sha256ArrayBuffer(buf: ArrayBuffer): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return [...new Uint8Array(hash)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function fileSha256(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  return sha256ArrayBuffer(buf);
}
