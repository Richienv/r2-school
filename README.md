# R2·SCHOOL

> Know what's due. Know what matters.

GMBA academic tracker — part of the R2·OS ecosystem.

## Stack

- Next.js 14 App Router
- AI SDK v4 + `@ai-sdk/anthropic` (Claude Sonnet 4)
- Local storage persistence (v1)
- Mobile-first, fixed-viewport (100dvh) design

## Screens

1. **Home** — urgent banner, week strip, upcoming assignments
2. **Timeline** — grouped by week with filter pills
3. **Courses** — 2×2 grid with course detail
4. **Assignment Detail** — status, notes, checklist
5. **AI Catch Up** — paste slides → key concepts + exam topics
6. **Add Assignment** — bottom sheet

## Run locally

```bash
npm install
cp .env.example .env.local   # add ANTHROPIC_API_KEY
npm run dev
```

## Deploy

Designed for Vercel. Set `ANTHROPIC_API_KEY` in project env vars.

```bash
vercel
```
