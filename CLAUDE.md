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

Mobile-first activity tracker web app. Multi-user, runs on a home server (NUC). Two processes in dev (Vite + Express), one in production (Express serves `dist/`).

### Backend (`server/`)

- **`server/index.js`** — Express entry point. Initialises session middleware, registers auth routes, mounts API routers, starts the hourly backup scheduler, and serves `dist/` in production.
- **`server/db.js`** — lowdb with `JSONFile` adapter at `data/activities.json`. Uses top-level `await db.read()`, so route files must be imported after `db.js` resolves (handled via `await import('./db.js')` in `index.js`).
- **`server/auth.js`** — reads `data/users.json` on every request (plain-text passwords). Exposes `registerAuthRoutes()` (login, logout, me, setup, change-password, change-username) and `requireAuth` middleware. Username matching is case-insensitive.
- **`server/settings.js`** / **`server/backup.js`** — load/save `data/settings.json`; backup copies `data/*.json` to a timestamped subfolder. Scheduler runs every hour and checks `lastBackup` + interval.
- **`server/routes/`** — activities, categories, settings. Visibility rule: own items always accessible; others' items only if `category.isPrivate === false`. Category deletion is owner-only; everything else in a public category is editable by any user.

### Data files (not in git)

- **`data/activities.json`** — lowdb store: `{ activities: [], categories: [] }`.
- **`data/users.json`** — `[{ id, username, password }]`. Manually edited to add users. IDs are arbitrary strings and must stay stable (activities/categories reference them via `userId`).
- **`data/settings.json`** — backup config: `{ backup: { enabled, location, interval, lastBackup } }`.

### Frontend (`src/`)

- **`src/types.ts`** — canonical interfaces. `Activity` has `interval` + `intervalUnit` ('days'|'weeks'); `intervalWeeks` is kept as a deprecated fallback for existing data. `Category.isPrivate` controls visibility. Both have `userId`.
- **`src/api.ts`** — all `fetch` calls to `/api/*` with `credentials: 'include'`. Also exports `Settings`/`BackupSettings` types.
- **`src/context/AuthContext.tsx`** — provides `{ user, setUser }`, wraps the router in `App.tsx`.
- **`src/App.tsx`** — calls `GET /api/me` on mount; shows `LoginPage` (or first-time setup via `GET /api/setup-needed`) or the router.
- **`src/pages/CategoryPage.tsx`** — handles both the root screen and nested category screens (same component, `id` param optional). Owns all data fetching via a `refresh` callback and passes handlers down to modals/cards. Header shows ⚙️ (settings), 🔑 (account), and logout.
- **`src/pages/EditActivityPage.tsx`** — full-page edit; fetches on mount. Delete is allowed for any user with access (server enforces category visibility).

### Key logic

- **Interval in days**: `intervalToDays(interval, unit)` in `src/utils/time.ts`. Falls back to `intervalWeeks * 7` for old data.
- **Progress ratio**: `1 - daysSinceDone / intervalDays`, clamped `[0, 1]`. 0 if never done.
- **Category colour**: `worstRatio()` in `CategoryCard.tsx` recurses through subcategories and returns the lowest ratio. Thresholds: >50% green, 10–50% orange, <10% red. Displayed as a coloured left border on the card.
- **History**: max 10 entries per activity, prepended on each "done". Each entry: timestamp, 0–5 rating, optional note, optional base64 photo.
- **Vite proxy**: `/api` → `http://localhost:3001` in dev so session cookies work across ports.
# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
