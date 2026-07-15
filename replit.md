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

- `artifacts/mobile` — Expo/React Native app (RailPass). All screens live under `app/`, design tokens in `constants/colors.ts`, mock data/services in `services/`, Zustand stores in `store/`.

## Architecture decisions

- RailPass has no backend by design (per spec: "Do NOT build backend, do NOT connect to any API"). All data comes from a mock service layer in `artifacts/mobile/services/` that simulates network latency and returns typed data, meant to be swapped for real APIs later.
- Local persistence uses AsyncStorage (auth session, applications, documents, theme) instead of the shared Postgres DB.

## Product

- RailPass: students submit railway concession applications through a multi-step wizard (personal, academic, journey, documents, review), track approval status on an animated timeline, and receive a digital certificate once approved. Colleges' verification/approval steps are represented as status states in the mock data. Also includes notifications, a document vault, help center, an AI assistant UI (canned responses), profile, and settings.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
