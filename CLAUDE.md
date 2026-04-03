# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server (proxies /api to http://localhost:8080)
npm run build      # TypeScript check (tsc -b) + Vite production build
npm run lint       # Run ESLint
npm run preview    # Preview production build locally
```

No test framework is configured.

## Architecture

**Groundhug Studio** is a React SPA for attendance/time-tracking — clock in/out, work session labels, and monthly salary summaries (currency: TWD).

**Feature-driven layout under `src/`:**

- `api/axios.ts` — Axios instance with Bearer token injection and automatic 401 → token-refresh interceptors. All API calls go through this instance; tokens live in `localStorage`.
- `features/auth/` — Login logic, token storage, auth hooks.
- `features/attendance/` — Core domain: clock-in/out, active session state, label management (CRUD), work summaries. Business logic lives in hooks here.
- `features/users/` — Registration API call.
- `routes/` — `ProtectedRoute` (redirects to `/login` if no token) and `GuestRoute` (redirects to `/attendance` if already authenticated).
- `layouts/` — `MainLayout` (header + outlet) and `AuthLayout` (centered form wrapper).
- `pages/` — Thin page components that compose feature hooks and components.
- `components/` — Shared UI: `LabelSelect`, `LabelDialog`, `LabelChip`, `Header`.

**Path alias:** `@` resolves to `src/` (configured in both `vite.config.ts` and `tsconfig.app.json`).

**Backend:** Expects a REST API at `http://localhost:8080/api`. Key endpoint groups: `/auth`, `/attendance`, `/work-summary`.

## TypeScript

Strict mode is on. `noUnusedLocals` and `noUnusedParameters` are enforced — the build will fail on unused variables.
