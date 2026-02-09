# Tailwind v4 Rules (arty)

- Mobile-first always
- Breakpoints allowed: sm, md, lg only
- Baseline:
  - `container mx-auto w-full px-4`
  - `grid grid-cols-12`
- Avoid collisions:
  - choose ONE width system per element (w-full OR w-[..px])
  - do not combine conflicting display utilities
- Prefer semantic structure: header/main/section
