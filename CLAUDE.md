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
src/screens/      home/, citizen/ (+ challenge/), staff/{queue,case,acts}/, demo/
src/components/   reusable UI: StatusBadge, StageTracker, ProgressSteps, AIPanel, SourceTag,
                  DataRow, RuleCheckList, LegalClockBar, AuditLog, Notice; layout/ holds
                  SiteHeader, CitizenLayout, StaffLayout, DemoControls
src/components/ui shadcn/ui primitives (generated, Lovable template)
src/types/        entities.ts (Fine, Camera, LegalAct, ChallengeCase, RefundCase, AuditEntry,
                  Consent, RuleCheck…) and status.ts (all status/union types)
src/data/         mockData.ts (fixtures + DEMO_TODAY), statusMessages.ts (citizen copy, tones),
                  aiScripts.ts (every simulated AI text), ruleCatalogue.ts (R1–R12 titles/levels)
src/lib/          pure functions + *.test.ts:
                  transitions.ts  changeStatus + transition tables + audit entries
                  rules.ts        derived fine status, refund eligibility, rule checks R1–R12
                  sla.ts          working days, legal clocks, expected dates (SLA_CONFIG)
                  decision.ts     inspector decisions → changeStatus + AI accepted/overridden
                  revocation.ts   bulk act preview and registration (one audit entry per fine)
                  refund.ts       bank details, consent, R12 auto-verification, refund decisions
                  challenge.ts    wizard validation, request drafting, submission, auto-checks
                  queue.ts        S1 rows, risk sorting, grouping, summary
                  messages.ts     status messages, holder label, tracker stages, citizen history
                  brief.ts        scripted AI case brief and citizen-message drafts
                  format.ts       money, dates, {placeholder} templates
src/store/        appStore.ts (state + actions), selectors.ts (memoised derived reads),
                  demoClock.ts (demo timestamps and cancellable simulated delays)
src/hooks/        useHighlightOnChange (tracker flash when the status changes)
```

Data flow: components read state through selectors and call store actions. Actions call pure
functions in `src/lib/`, which return the new entity plus audit entries; the store commits both.
Fine statuses, refund eligibility, rule checks and legal clocks are derived from state on every
render – nothing is stored as a display string. `/demo` renders the citizen `CaseView` and the
staff `ChallengeDetail` from the same store, so a decision on the right updates the phone.

## Conventions

- Prettier config in `.prettierrc` (double quotes, 100 cols). `npm run lint` must have 0 errors.
  The 6 remaining warnings are react-refresh hints inside generated shadcn/ui files.
- PascalCase component files in `src/components` and `src/screens`; camelCase for `src/lib`,
  `src/data`, `src/store`. Route files follow TanStack naming (`staff_.cases.$id.tsx`).
- Components aim for under ~150 lines; extract sub-components/hooks instead of growing.
- No `any`, no `@ts-ignore`, no `console.log`, no commented-out code.
- Every status change goes through `changeStatus()` in `src/lib/transitions.ts`.
- All citizen status copy in `statusMessages.ts`; all AI text in `aiScripts.ts`.
- Conventional Commits; run `npm run check` (typecheck, lint, tests, build) before every commit.

## Decisions and assumptions

Structure

- **No `src/pages/`.** TanStack Start owns `src/routes/` and its README forbids `src/pages/`.
  Screens live in `src/screens/` and route files stay thin. Only deviation from the target
  architecture. Extra lib modules (decision, revocation, refund, challenge, queue, messages,
  brief) keep `rules.ts` and `transitions.ts` small.
- `npm install` is used locally; `package-lock.json` is not committed because Lovable uses
  `bun.lock`. No dependencies were added or removed, so `bun.lock` stays valid.
- Unused shadcn/ui primitives and template dependencies (recharts, embla, etc.) are left in
  place: they belong to Lovable's template and removing them would require regenerating
  `bun.lock` with bun. The Lovable error-reporting files in `src/lib/` are kept for the same
  reason.
- The screen migration landed as one larger commit (`refactor: rebuild screens…`) because the
  old screens depended on the old data shapes; every other step is its own commit.
- Commit `126d18d` (sla) does not typecheck on its own: its test fixture imports a type from
  `rules.ts`, committed one commit later. Build and tests pass there; history was not rewritten.

Demo behaviour

- **Fixed demo date: 25 Nov 2026** (`DEMO_TODAY`). Legal clocks and expected dates are computed
  from it so the recording is deterministic. Audit timestamps use that date with the real time
  of day.
- **No persistence** (Lovable guidance: no browser storage). A full reload resets the demo.
- C-1042 is seeded in "Validating" so `/staff` and `/demo` work immediately. Demo controls →
  "Reset to before Marta's challenge" removes it so the citizen journey starts fresh.
  Submitting C3 always creates a new submission at "Received" (replacing any earlier C-1042);
  after 3 s simulated automatic checks move it to "Validating" held by Inspector Laura Gómez.
- Scenario A/B is not a flag: it is whether the bulk act is "In force". The rules engine
  re-derives everything from that. "Revert (demo only)" restores the refunds snapshot taken at
  registration and writes an audit entry.
- A second, older act (CAM-SUB100) is already in force so that staff refunds in "Verifying
  payment details" have a legal basis (R11 Pass).
- In Scenario A, confirming a bank account moves R-1044 to "Verifying payment details"; after
  2.5 s it is auto-approved when R11 and R12 pass at level A (R12 automation).
- `payFine` simulates a payment (no money moves) – kept from the Lovable version.

Rules (R1–R12)

- Result semantics: Pass = nothing to act on; Flag = needs a human; Fail = requirement not met.
  No check closes a case or removes the right to challenge.
- Only applicable rules are listed: R7 for "I wasn't driving", R8 for "Vehicle sold", R10 only
  for fines on non-compliant cameras, R2 is applied at fine level (no case is created).
- R5 notification window: 3 working days after the infraction (assumption).
- R9: cases filed by a representative are flagged as templated; grouping is overview only.
- R12: human approval above COP 2,000,000 (`RULES_CONFIG.refundHumanThreshold`) or when the
  holder is not the claimant.
- Decision "Request correction" uses the inspector's reason as `{what}`; "Schedule hearing" sets
  a virtual hearing 5 working days later at 09:30.

Timing (`SLA_CONFIG` in `src/lib/sla.ts`)

- Validation 2, decision 10, refund payment 5 (after approval), appeal 10, correction 5, hearing
  notice 5 working days. "At risk" from 70% of the legal clock.
- **TODO:** Colombian public holidays (e.g. 16 Nov 2026) are not modelled – weekdays only.
