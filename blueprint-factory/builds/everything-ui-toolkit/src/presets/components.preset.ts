export const PRESET = {
  AppRoot: "min-h-screen bg-bg text-detail font-sans antialiased",
  Container: "w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-[1260px] xl:max-w-[1440px]",
  Section: "py-10 sm:py-12 lg:py-16",
  Stack: "flex flex-col gap-4 sm:gap-6",
  Row: "flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4",
  Grid1: "grid grid-cols-1 gap-4",
  Grid2: "grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6",
  Grid3: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6",
  H1: "font-th text-title font-semibold text-2xl sm:text-3xl lg:text-4xl",
  Paragraph: "text-detail text-sm sm:text-base",
  Image: "w-full h-40 sm:h-48 lg:h-56 object-cover rounded-md bg-muted",
  Image16x9: "w-full aspect-video object-cover rounded-md bg-muted",
  Card: "bg-surface border border-border rounded-lg shadow-sm p-4 sm:p-5 lg:p-6",
  CardClickable: "bg-surface border border-border rounded-lg shadow-sm p-4 sm:p-5 lg:p-6 transition-shadow hover:shadow-md",
  ButtonPrimary: "inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-fg hover:bg-primary/90",
  Table: "w-full bg-surface border border-border rounded-lg overflow-hidden",
  Badge: "inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-muted text-detail",
  ChartContainer: "bg-surface border border-border rounded-lg shadow-sm p-4",
  Calendar: "bg-surface border border-border rounded-lg shadow-sm overflow-hidden"
} as const;
export type ComponentKey = keyof typeof PRESET;