export function safeText(v: any, fallback: string) {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length > 0 ? s : fallback;
}

function isObj(v:any){ return v && typeof v==="object" && !Array.isArray(v); }

export function normalizeErrorDetails(input: any): { message?: string; extra?: string } {
  if (input === null || input === undefined) return {};
  if (typeof input === "string") return { message: input };

  if (Array.isArray(input)) {
    const first = input.find((x) => typeof x === "string") || undefined;
    const more = input.length > 1 ? `(+${input.length - 1})` : undefined;
    return { message: first, extra: more };
  }

  if (isObj(input)) {
    const msg =
      (typeof input.message === "string" && input.message) ||
      (typeof input.error === "string" && input.error) ||
      (typeof input.detail === "string" && input.detail) ||
      (typeof input.title === "string" && input.title) ||
      undefined;

    const errors = Array.isArray((input as any).errors) ? (input as any).errors : undefined;
    if (errors && errors.length > 0) {
      const first = errors[0];
      const firstMsg =
        (typeof first === "string" && first) ||
        (isObj(first) && (typeof first.message === "string" ? first.message : typeof first.msg === "string" ? first.msg : "")) ||
        "";
      const more = errors.length > 1 ? `(+${errors.length - 1})` : undefined;
      return { message: firstMsg || msg, extra: more };
    }

    if (isObj((input as any).data)) return normalizeErrorDetails((input as any).data);
    if (isObj((input as any).result)) return normalizeErrorDetails((input as any).result);

    return { message: msg };
  }

  return { message: String(input) };
}

export function makeDedupeKey(parts: Array<string | number | undefined | null>) {
  return parts
    .map((p) => (p === null || p === undefined ? "" : String(p)))
    .join("|")
    .slice(0, 280);
}
