# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start Express server (port 3001) + Vite dev server (port 5173) concurrently
npm run dev:server   # server only (node --watch)
npm run dev:client   # Vite only
npm run build        # compile React app to dist/
npm start            # production: Express serves API + built frontend on port 3001
```

No test suite or linter configured.

## Architecture

Full-stack single-user-per-session activity tracker. Two separate processes in dev, one in production.

### Backend (`server/`)
- **`server/index.js`** — Express entry point. Registers session middleware, auth routes, API routes, and serves `dist/` in production.
- **`server/db.js`** — Initialises lowdb with a `JSONFile` adapter at `data/activities.json`. Top-level `await db.read()` runs on import, so all route files import `db` after this resolves.
- **`server/auth.js`** — Reads `data/users.json` (plain-text credentials) on every login request. Exposes `registerAuthRoutes()` for login/logout/change-password/me, and `requireAuth` middleware.
- **`server/routes/activities.js`** / **`server/routes/categories.js`** — REST CRUD. Visibility rule: own items always accessible; others' items accessible only if the category has `isPrivate: false`. Category deletion is owner-only; everything else in a public category is editable by any authenticated user.

### Data files
- **`data/activities.json`** — lowdb JSON store with `{ activities: [], categories: [] }`.
- **`data/users.json`** — manually managed array of `{ id, username, password }`. Username matching is case-insensitive; passwords are plain text.

### Frontend (`src/`)
- **`src/types.ts`** — single source of truth for `Activity`, `Category`, `HistoryEntry`, `User` interfaces. `Activity.userId` and `Category.userId` track ownership; `Category.isPrivate` controls visibility.
- **`src/api.ts`** — all `fetch` calls to `/api/*` with `credentials: 'include'`. Throws on non-ok responses.
- **`src/context/AuthContext.tsx`** — provides `{ user, setUser }`. Wrapped around the router in `App.tsx` after `/api/me` resolves.
- **`src/App.tsx`** — checks session via `GET /api/me` on mount; shows `LoginPage` or the router depending on result.
- **`src/pages/CategoryPage.tsx`** — main screen and nested category screen (same component, driven by `:id` param). Owns all data-fetching (`refresh` callback) and mutation handlers passed down to modals/cards.
- **`src/pages/EditActivityPage.tsx`** — full-page edit form; fetches activity by id on mount. Shows delete button only for own activities (server also enforces this).

### Key logic
- **Progress ratio**: `1 - daysSinceDone / (intervalWeeks * 7)`, clamped to `[0, 1]`. Calculated in `src/utils/time.ts`.
- **Category colour**: recursively finds the worst (lowest) ratio among all activities in the category and its subcategories (`worstRatio` in `CategoryCard.tsx`). Colour thresholds: >50% green, 10–50% orange, <10% red.
- **History**: max 10 entries per activity, newest first. Each entry stores date, 0–5 star rating, optional note and base64 photo.
- **Vite proxy**: `/api` proxied to `http://localhost:3001` in dev (`vite.config.ts`), so cookies work correctly across the two dev servers.
