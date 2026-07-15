# RailPass

RailPass digitizes the student railway concession approval workflow between students and colleges, replacing paper forms with a fully digital apply → review → approve → certificate flow.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/mobile` — Expo/React Native app (RailPass), the student-facing app. Screens under `app/`, design tokens in `constants/colors.ts`, mock data/services in `services/`, Zustand stores in `store/`.
- `artifacts/admin-portal` — React + Vite web app (LocalOne Admin Portal), the college-staff-facing app. Pages in `src/pages`, mock API layer in `src/lib/mock-api/`, Zustand stores in `src/store`, shared UI in `src/components`.

## Architecture decisions

- Both RailPass and the LocalOne Admin Portal have no backend by design — data comes from mock service layers (`artifacts/mobile/services/`, `artifacts/admin-portal/src/lib/mock-api/`) that simulate network latency and return typed data, meant to be swapped for real APIs later.
- RailPass persists locally via AsyncStorage (auth session, applications, documents, theme). The Admin Portal persists session/theme via Zustand + localStorage. Neither uses the shared Postgres DB yet.
- Admin Portal demo login: username `admin`, password `admin123`.

## Product

- RailPass (mobile, student-facing): students submit railway concession applications through a multi-step wizard (personal, academic, journey, documents, review), track approval status on an animated timeline, and receive a digital certificate once approved. Also includes notifications, a document vault, help center, an AI assistant UI (canned responses), profile, and settings.
- LocalOne Admin Portal (web, college-staff-facing): college admins review, approve/reject, and remark on student concession applications, browse a student directory with application history, view dashboard KPIs/analytics and reports (monthly applications, approval rate), and manage notifications/profile/settings (incl. dark/light mode).

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
