---
name: Expo design subagent package gaps
description: The design subagent can write Expo/React Native code that imports packages it never added to package.json, causing a bundling crash on first restart.
---

On a full first-build RailPass Expo app, the design subagent wrote `app/(auth)/login.tsx` importing `react-hook-form` (and used `zustand` in stores) without adding either to `package.json`. Metro failed with "Unable to resolve" until the deps were added and `pnpm install` was run.

**Why:** The subagent's code generation and its dependency-file edits aren't always in lockstep — it can use a library conceptually (per the brief, e.g. "use Zustand", "use React Hook Form") without remembering to declare it.

**How to apply:** After a design subagent finishes an Expo first build, before restarting the workflow, grep the new screens/stores for third-party import names (`grep -rhoE "from '[a-zA-Z@][^']*'" app store hooks services` style) and diff against `package.json` dependencies. Add any missing ones and `pnpm install --filter @workspace/<slug>` before the first restart, rather than discovering it via a bundling error.
