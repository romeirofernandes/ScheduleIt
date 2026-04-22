# ScheduleIt Frontend

Next.js 16 frontend for ScheduleIt, a campus resource booking platform

## Stack

- Next.js (App Router)
- React 19
- Tailwind CSS v4
- NextAuth v5 beta
- Prisma + PostgreSQL

## Scripts

```bash
npm run dev        # Start local development server
npm run build      # Production build
npm run start      # Run production server
npm run lint       # Lint codebase
npm run db:studio  # Open Prisma Studio
npm run seed       # Seed development database
```

## Project Layout

- `src/app`: routes, layouts, and API handlers
- `src/components`: UI and page components
- `src/actions`: server actions for auth and schedule flows
- `src/lib`: shared utilities, Prisma client, and validations
- `prisma`: schema and migrations

## Notes

- Fonts are loaded with `next/font` in the root layout.
- Image optimization is configured in `next.config.mjs` for Unsplash-hosted team photos.
- Generated artifacts like `.next` should not be committed.
