import { PRESET } from "../presets/components.preset";
import { resolveSubstyle } from "./substyle";
import { guard } from "./interaction";
import { UINode } from "./types";
export function emitClass(n: UINode) {
  const cls = [PRESET[n.type] ?? "", resolveSubstyle(n.substyle)].filter(Boolean).join(" ");
  return guard(cls);
}