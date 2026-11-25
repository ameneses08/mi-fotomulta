# CLAUDE.md – Mi Fotomulta Clara

Guidance for anyone (human or AI) working in this repository. Keep it current.

## Project brief (condensed)

University project "AI-Ready Public Services". We redesign one real public service for the AI
era, with a citizen view and an administration view.

- Administration: Secretaría Distrital de Movilidad de Bogotá (SDM), Colombia.
- Service: challenging photo-fines and claiming refunds for revoked fines.
- Prototype name: **Mi Fotomulta Clara**. All UI text in English.
- Academic prototype: no backend, no auth, mock data only. Every AI output is **simulated**
  (scripted) and labelled as such.
- Live URL: https://mifotomulta.lovable.app – Lovable syncs from `main` of this repo.
- Used for a 5-minute screen-recorded launch video: reliability and polish beat feature count.

Priority if time runs short: S2 decision flow updating the citizen tracker on `/demo` >
S3 bulk revocation > S1 full queue > everything else.

## Phase 0 audit (25 Nov 2026)

Stack found: Vite + React 19 + TypeScript (strict) + Tailwind v4 + shadcn/ui + lucide-react,
on **TanStack Start** with file-based routes in `src/routes/` (not React Router). Zustand is
already installed and used.

| Screen / component                | State   | Notes                                                                                     |
| --------------------------------- | ------- | ----------------------------------------------------------------------------------------- |
| Home `/`                          | Done    | Tagline and three entry points present.                                                   |
| C1 `/citizen`                     | Done    | Fine statuses are hard-coded strings in mock data, not derived.                           |
| C2 `/citizen/fines/:id`           | Done    | SourceTags, note, camera placeholder, AIPanel all present.                                |
| C3 `/citizen/fines/:id/challenge` | Partial | 4 steps work. Submit sets a numeric "stage", not Received → Validating; no audit.         |
| C4 `/citizen/cases/:id`           | Partial | Tracker uses a stage index, not the status model; no skipped hearing, no spec messages.   |
| C5 `/citizen/refunds/:id`         | Partial | Form + separate consent OK. Refund status hard-coded "On hold"; tracker not status-based. |
| D1 `/demo`                        | Partial | Split view exists; no phone frame, no top bar, staff side is a reduced panel.             |
| S1 `/staff`                       | Partial | One case, no summary cards, tabs, legal clocks, flags or grouping.                        |
| S2 `/staff/cases/:id`             | Missing | Only a "Move to …" button inside the queue.                                               |
| S3 `/staff/legal-acts`            | Wrong   | Shows a decision draft instead of the bulk-revocation act.                                |
| StatusBadge / AIPanel / SourceTag | Done    | StatusBadge has icon + text + colour.                                                     |
| StageTracker                      | Partial | See C4.                                                                                   |
| Rules engine, transitions, audit  | Missing |                                                                                           |
| Working-day SLA                   | Missing | "Expected by" dates are hard-coded strings.                                               |
| Bulk revocation, demo reset, sync | Missing | `/demo` already shares one store, so sync is structurally possible.                       |

Deviations from the standards:

- All screens live in three files (`src/components/prototype/*`), each component written on a
  single line of up to ~4,000 characters. Unreadable and not reviewable – rewritten.
- Status copy is duplicated across mock data, the store (`advanceCase` arrays) and components.
- No `src/types/`; entity types are inline in mock data. No business logic in `src/lib/`.
- Design tokens are oklch approximations, not the specified hex palette.
- Banner text said "…simulated unless marked Live" although there is no live AI.

Check status at audit time: typecheck ✅, tests ✅ (10/10), build ✅, **lint ❌** (185 Prettier
formatting errors, 7 react-refresh warnings inside generated shadcn/ui files).

## Architecture

```
src/routes/       TanStack file routes – thin: params + head + render one screen
src/screens/      one folder per area (home, citizen, staff, demo) with screen components
src/components/   reusable UI (StatusBadge, StageTracker, AIPanel, SourceTag, layouts)
src/components/ui shadcn/ui primitives (generated, Lovable template)
src/types/        domain entities and status unions
src/data/         mockData.ts, statusMessages.ts, aiScripts.ts – all copy and fixtures
src/lib/          pure, typed business logic + unit tests (rules, transitions, sla, format…)
src/store/        appStore.ts – Zustand state; actions call src/lib and write audit entries
```

Data flow: components read state through selectors/hooks and call store actions. Store actions
call pure functions in `src/lib/` and commit the result. Derived values (fine status, refund
eligibility, rule checks, legal clocks) are computed from state, never stored as strings.

## Conventions

- Prettier config in `.prettierrc` (double quotes, 100 cols). `npm run lint` must be clean.
- PascalCase component files in `src/components` and `src/screens`; camelCase for `src/lib`,
  `src/data`, `src/store`. Route files follow TanStack naming.
- Components aim for under ~150 lines; extract sub-components/hooks instead of growing.
- No `any`, no `@ts-ignore`, no `console.log`, no commented-out code.
- Every status change goes through `changeStatus()` in `src/lib/transitions.ts`.
- Conventional Commits; run typecheck, lint, tests and build before every commit.

## Decisions and assumptions

- **No `src/pages/`.** TanStack Start owns `src/routes/` and its README forbids `src/pages/`
  (it confuses the router conventions). Screen components live in `src/screens/` instead and
  route files stay thin. This is the only deviation from the target architecture.
- `npm install` is used locally; `package-lock.json` is not committed because Lovable uses
  `bun.lock`. No dependencies were added or removed, so `bun.lock` stays valid.
- Unused shadcn/ui primitives and template dependencies (recharts, embla, etc.) are left in
  place: they belong to Lovable's template and removing them would require regenerating
  `bun.lock` with bun. The Lovable error-reporting files in `src/lib/` are kept for the same
  reason.
