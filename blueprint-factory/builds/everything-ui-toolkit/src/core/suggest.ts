import { PRESET } from "../presets/components.preset";
export function suggest(prefix: string) { return Object.keys(PRESET).filter(k => k.toLowerCase().startsWith(prefix.toLowerCase())).slice(0, 8); }