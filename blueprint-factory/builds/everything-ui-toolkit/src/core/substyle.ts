export const SUBSTYLE = {
  shape: { square: "", rounded: "rounded-lg", circle: "rounded-full" },
  aspect: {
    "1:1": "aspect-square",
    "4:3": "aspect-[4/3]",
    "16:9": "aspect-video",
  },
  orientation: {
    vertical: "flex flex-col",
    horizontal: "flex flex-col sm:flex-row",
  },
  grid: {
    1: "grid grid-cols-1",
    2: "grid grid-cols-1 sm:grid-cols-2",
    3: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  },
};
export function resolveSubstyle(s?: any) {
  if (!s) return "";
  return [
    s.shape && (SUBSTYLE.shape as any)[s.shape],
    s.aspect && (SUBSTYLE.aspect as any)[s.aspect],
    s.orientation && (SUBSTYLE.orientation as any)[s.orientation],
    s.grid && (SUBSTYLE.grid as any)[s.grid],
  ]
    .filter(Boolean)
    .join(" ");
}
