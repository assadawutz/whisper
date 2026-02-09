# Whisper Prompt: UI Convert (Image/Spec -> Next.js + Tailwind v4)

## Hard Rules (arty)
- Tailwind v4 only
- Mobile-first; breakpoints sm/md/lg only
- Baseline wrapper: `container mx-auto w-full px-4` + `grid grid-cols-12`
- No "Card" abstractions by default
- If text unreadable -> placeholders like [TITLE_1]
- Always include loading + empty state + error-safe UI
- No crashing: guard null/undefined, Array.isArray+length, safe fallbacks

## Output
- Component-only by default
- Use semantic tags: header/main/section
- Prefer grid/flex; absolute positioning only if required
