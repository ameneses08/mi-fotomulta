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
src/screens/      signin/, citizen/ (+ challenge/), staff/{inbox,case,group,cameras,bulk,
                  refunds,audit}/, demo/
src/components/   reusable UI: StatusBadge, StageTracker, ProgressSteps, AIPanel, SourceTag,
                  DataRow, RuleCheckList, LevelBadge, LegalClockBar, AuditLog, Notice;
                  assistant/ (citizen chat panel + launcher); layout/ holds SiteHeader,
                  BrandFooter, CitizenLayout/Nav, UserMenu, StaffLayout/Nav, DemoControls
src/components/ui shadcn/ui primitives (generated, Lovable template)
src/types/        entities.ts (Fine, Camera, LegalAct, ChallengeCase, RefundCase, AuditEntry,
                  Consent, RuleCheck…) and status.ts (all status/union types)
src/data/         mockData.ts (fixtures + DEMO_TODAY), mockEvidence.ts (documents with
                  AI-extracted fields), statusMessages.ts (citizen copy, tones),
                  aiScripts.ts (every simulated AI text), ruleCatalogue.ts (R1–R12 titles/levels)
src/lib/          pure functions + *.test.ts:
                  transitions.ts  changeStatus + transition tables + audit entries
                  rules.ts        derived fine status, refund eligibility, rule checks R1–R12
                  sla.ts          working days, legal clocks, expected dates (SLA_CONFIG)
                  decision.ts     inspector decisions → changeStatus + AI accepted/overridden
                  revocation.ts   bulk act preview and registration (one audit entry per fine)
                  refund.ts       bank details, consent, R12 auto-verification, refund decisions
                  challenge.ts    wizard validation, request drafting, submission, auto-checks
                  queue.ts        inbox triage (priority), groups, filters, summary
                  refundQueue.ts  refund sections and fraud flags
                  assistant.ts    citizen assistant intents and answers from live state
                  citizenSummary  dashboard cards; cameras.ts camera status and range
                  audit.ts        audit-log filters; assignment.ts; signIn.ts mock validation
                  analysis/       mock AI engine: dates, documents, registry, similarity,
                                  fraud, review; index.ts = analyseCase / analyseRefund
                  intake.ts       intake steps and the inbox "AI intake today" summary
                  oversight.ts    AI oversight figures from the audit log
                  fineActions.ts  which buttons a fine shows (R3, appeal)
                  messages.ts     status messages, holder label, tracker stages, citizen history
                  brief.ts        scripted AI case brief and citizen-message drafts
                  format.ts       money, dates, {placeholder} templates
src/store/        appStore.ts (state + actions), selectors.ts (memoised derived reads),
                  demoClock.ts (demo timestamps and cancellable simulated delays),
                  useDemoHydration.ts (restores sessionStorage after mount)
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
- **sessionStorage persistence (iteration 2).** The store is saved per tab so a reload keeps
  the demo; Demo controls → either reset overwrites it. This replaces the earlier "no browser
  storage" choice because a reload mid-recording must not lose state. Hydration runs after
  mount (`skipHydration`) so server HTML matches the first client render; interrupted
  simulations (automatic checks, refund verification) are rescheduled. `DEMO_DATA_VERSION` must
  be bumped whenever the seed changes; a saved demo from another version is replaced by the
  fresh seed.
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
- Refund bank form: the fields are **uncontrolled** and read with `FormData` at submit, so
  values the browser fills without change events (autofill, form restore, typing before the page
  finished loading) are never lost; changes are still mirrored to the store for reload safety,
  and the form remounts once after hydration to show restored values. Errors are per field.
  The account number ignores spaces, dots and dashes (6–20 digits). The form is prefilled with a
  fictional Bancolombia savings account (`MOCK_BANK_ACCOUNT`); consent always starts unticked.
- `payFine` simulates a payment (no money moves) – kept from the Lovable version.

Rules (R1–R12)

- Result semantics: Pass = nothing to act on; Flag = needs a human; Fail = requirement not met.
  No check closes a case or removes the right to challenge.
- Only applicable rules are listed: R7 for "I wasn't driving", R8 for "Vehicle sold", R10 only
  for fines on non-compliant cameras, R2 is applied at fine level (no case is created).
- R5 notice window: 3 working days after the **validation** of the infraction (Ley 1843 de
  2017, art. 8). Fines carry a `validationDate` (seed default: the infraction date; C-1048 was
  validated on 9 Oct 2026 and notified 6 working days later).
- R9: represented cases are flagged as templated unless they add evidence beyond the power of
  attorney ("New evidence"); grouping saves reading time, never replaces individual review.
- R12: human approval above **COP 1,000,000** (`RULES_CONFIG.refundHumanThreshold`, assumption
  pending P6) or when the holder is not the claimant.
- Refund fraud flags: holder ≠ claimant; a later claim on a fine already claimed (the first is
  legitimate); one account (bank + last 4) paying three or more claimants. Flags only route a
  refund to a person; every refund action needs a written reason.
- Decision "Request correction" uses the inspector's reason as `{what}`; "Schedule hearing" sets
  a virtual hearing 5 working days later at 09:30.

Iteration 2 (UX, assistant, P6 staff screens)

- Palette from the "Manual de uso de marca ciudad Bogotá" (June 2026): primary #225495, muted
  #595A5C, brand red #E4032E only for the 4px header strip and footer, Movilidad lime #BED000
  only behind dark text (header tag). No coat of arms or city logo. Contrast: primary on white
  7.6:1, white on red 4.8:1, text on lime 10.3:1, muted on white 6.9:1. Card borders stay
  #E5E7EB (decorative); form controls use #85878A (3.6:1) for WCAG 1.4.11.
- `/` is a mock sign-in (Cédula Digital button, CC/CE/PPT + 6-digit code, staff username and
  password), prefilled from `MOCK_SIGN_IN`. Nothing is validated against a server.
- Citizen screens use Tailwind container queries, not viewport media queries, so the same
  components render wide on desktop and narrow inside the `/demo` phone frame. In the frame the
  shell is "embedded" (no nav, which would leave `/demo`).
- The assistant is scripted: four intents matched by keywords, answers filled from derived
  statuses, SLA deadlines and the legal act at the moment of asking (so a later answer reflects
  a later state). Chat history is part of the persisted demo state. ~800 ms typing delay.
- P6 levels: A automated (camera check, per-fine application, notices, auto-approved refunds),
  S AI-supported (summary, suggestion, citizen message draft), H human only (final decision,
  signing the act, held and flagged refunds).
- Inspector responses to the AI are audited as "accepted" (same outcome), "overridden"
  (different final outcome, reason required) or "not followed" (correction or hearing instead).
  The AI draft and the inspector's approval of the citizen message are separate entries.
- Inbox priority: High if the legal clock is at risk/overdue or a check fails, Medium if any
  flag, Low otherwise. Assignment changes the holder and is audited; it never changes status.
- Camera CAM-AN170 now has an authorisation that expired on 30 Sep 2026 (for the "Expired"
  state); its fines after that date are still non-compliant.
- Refund queue seed adds R-1050–R-1053 (10 refunds in total) to populate the three sections.

Iteration 3 (mock AI analyses for the administration)

- **One source of truth:** every check and flag (R1–R12, groups, new evidence, refund fraud
  flags) is produced by `src/lib/analysis` (`analyseCase`, `analyseRefund`). The old
  `evaluateChallengeRules` / `evaluateRefundRules` / `fraudFlagsFor` were migrated and deleted.
  `rules.ts` now only derives fine status and refund eligibility.
- Findings are deterministic (no randomness, no clock except `DEMO_TODAY`) with stable ids
  `${caseId}:${key}`. Inspector reviews are stored separately (`findingReviews`) and merged in;
  a dismissed flag no longer counts for triage or "flagged" totals.
- Result semantics: Pass / Flag / Info. Former "Fail" results became Flags. Info is used when
  there is nothing to fix but a human must still decide (R7 when the driver is identified).
- Triage: High = deadline at risk or a high-confidence open flag on Dates or Fraud; Medium = any
  other open flag; Low = none. (Camera R4 flags alone are now Medium, not High.)
- Similarity (R9): Dice coefficient over word bigrams of the filing text, as a whole percentage.
  The LegalRápido template is long enough that filings score 96%. New evidence = any document
  other than a power of attorney.
- Fraud signals never reject: photo metadata (editing software or modified after capture),
  expired power of attorney (C-1044 is paused as Needs correction by the system, an audited
  routing step), duplicates, and the refund signals. A missing bank account is Info, not a flag.
- A refund's R11 check excludes the refund itself, so an already-paid refund stays eligible.
- Intake animation: six steps × 680 ms (~4 s), persisted per case in `intakeProgress` and resumed
  after a reload; the last step completes the automatic checks (Received → Validating). Because
  4 s is too short to switch screens by hand, Demo controls has **Replay Marta's submission**
  (demo only): it removes C-1042 and re-submits it with the sample documents.
- "AI intake today" counts open filings whose intake finished, split into non-overlapping
  "clear" and "with flags to review" (every analysed filing is ready for an inspector);
  "in groups" is a separate overview count.
- Iteration 3.1 recalibration: flags are a minority. A non-compliant camera (R4), no act in
  force yet (R10) and a templated filing (R9) are **Info**, not Flags, because they support the
  claim or only describe grouping. C-1051 and C-1052 now carry complete driver documents, and
  C-1052 moved to its own fine F-3112 (no longer a duplicate of C-1051). Flagged seed filings:
  C-1044 (expired power of attorney), C-1048 (late notice), C-1049 (edited photo), C-1050
  (plate mismatch), C-1053 (sold, not transferred).
- AI oversight assumption: **4 minutes of reading saved per summarised filing**
  (`OVERSIGHT_CONFIG.minutesPerSummary`). A few earlier decisions this month (C-1031–C-1039,
  cases no longer in the queue) are seeded in the audit log so the panel has history.
- Citizen side: while a challenge exists the fine shows only "Track my challenge" (R3, also
  enforced in the store); after a decision "Appeal the decision" moves Decided → Appealed.
- Process notes (history not rewritten): commit `15146c7` went in with a Prettier lint error
  because the check was piped through `grep`; `1d61299` (same message) fixes it. The iteration 2
  audit-log commit claimed exact nav matching that never applied; `c2cc7f8` adds it. `c2cc7f8`
  also missed the regenerated route tree, committed right after. Commits are now gated on the
  real exit code of `npm run check`.

Timing (`SLA_CONFIG` in `src/lib/sla.ts`)

- Validation 2, decision 10, refund payment 5 (after approval), appeal 10, correction 5, hearing
  notice 5 working days. "At risk" from 70% of the legal clock.
- **TODO:** Colombian public holidays (e.g. 16 Nov 2026) are not modelled – weekdays only.
