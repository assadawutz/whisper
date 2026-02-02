import type { ComponentKey } from "../presets/components.preset";
export type Substyle = { shape?: "square"|"rounded"|"circle"; aspect?: "1:1"|"4:3"|"16:9"; orientation?: "vertical"|"horizontal"; grid?: 1|2|3 };
export type UINode = { id: string; type: ComponentKey; layer: "base"|"common"|"advanced"|"fancy"|"data"|"time"; interactive?: boolean; substyle?: Substyle; children?: UINode[] };