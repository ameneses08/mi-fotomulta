# Mi Fotomulta Clara

University prototype for the "AI-Ready Public Services" project. It redesigns how people in
Bogotá challenge photo-fines and claim refunds for revoked fines, from two sides: the citizen
(Marta) and the Secretaría Distrital de Movilidad (inspector Laura Gómez).

> **All people, plates, fines, cases and legal acts are fictional. Every AI response is
> simulated (scripted) and labelled. This is not an official service of the Alcaldía de
> Bogotá.** There is no backend, no login and no data leaves the browser.

Live: https://mifotomulta.lovable.app

## Run it

Requires Node.js 20+.

```sh
npm install
npm run dev        # http://localhost:5173 (or the port Vite prints)
npm run check      # typecheck, lint, unit tests and production build
```

Other scripts: `npm run test`, `npm run lint`, `npm run typecheck`, `npm run build`.

Demo state is saved in the browser tab (sessionStorage), so a reload keeps it. Staff and demo
pages have a **Demo controls** button (bottom right) with two resets.

## Folder structure

```
src/
  routes/       TanStack Start file routes (thin: params, page title, one screen)
  screens/      screen components – signin/, citizen/, staff/, demo/
  components/   reusable UI – StatusBadge, StageTracker, AIPanel, SourceTag, layouts…
  components/ui shadcn/ui primitives (from the Lovable template)
  types/        domain entities and status unions
  data/         mockData.ts, statusMessages.ts, aiScripts.ts, ruleCatalogue.ts
  lib/          pure business logic with unit tests (rules, transitions, sla, decision…)
  store/        Zustand store (state + actions) and selectors
  test/         store integration tests and shared fixtures
```

See [CLAUDE.md](CLAUDE.md) for the architecture, conventions and every design decision.

## Screens

| Route                          | Screen                                                         |
| ------------------------------ | -------------------------------------------------------------- |
| `/`                            | Mock sign-in: Citizen or SDM staff                             |
| `/citizen`                     | My fines: summary cards, fine grid, assistant                  |
| `/citizen/fines/:id`           | Fine detail with data sources, next action, "Explain my fine"  |
| `/citizen/fines/:id/challenge` | Four-step guided challenge                                     |
| `/citizen/cases`, `/:id`       | My cases and the case tracker                                  |
| `/citizen/refunds/:id`         | Refund with bank account and separate consent                  |
| `/citizen/help`                | Línea 195 and Centros de Servicios de Movilidad                |
| `/staff`                       | Inspector inbox: priority, groups, filters, assignment         |
| `/staff/cases/:id`             | Case view: original filing, AI summary, flags, decision        |
| `/staff/groups/:id`            | Group view: similar cases listed and decided one by one        |
| `/staff/refunds`               | Refund queue: auto-approved sample, held, fraud flags          |
| `/staff/cameras`               | Camera check: Authorised / Expired / Unauthorised              |
| `/staff/bulk-revocation`       | Legal act, affected fines, notification preview, one signature |
| `/staff/audit`                 | Read-only, filterable audit log                                |
| `/staff/ai-oversight`          | AI suggestions accepted/overridden, flag reviews, time saved   |
| `/demo`                        | Marta's phone and the inspector's case view for C-1042         |

## Demo script (launch video, ~5 minutes)

Before recording: open `/demo`, click **Demo controls → Reset to before Marta's challenge**, then
**Exit demo**. Record at 1440×900.

1. **Sign-in** – "Citizen" is selected. Click **Continue with Cédula Digital** (or show the
   document + 6-digit code path; everything is prefilled).
2. **My fines** – three summary cards and six fines, each with a status and its next step. In the
   assistant on the right, click **Give me a status check of my fotomultas**: the answer is built
   from the same live data. Click **Why is F-2042 under review?**.
3. Open **F-2041** – sources (SIMIT / RUNT / ANSV) on the left, status and next action on the
   right, **Explain my fine** below. Click **Challenge this fine**.
4. **Challenge** – reason _I wasn't driving_ → Continue. Paste any sentence into "Paste text from
   your own AI assistant" → **Turn into a structured claim** → Continue. **Use sample documents**
   → Continue. Review the AI-drafted request → **Submit challenge**.
5. **Tracker** – "Received", then after ~3 s "Being checked" by Inspector Laura Gómez with an
   expected date in working days.
6. User menu → **Sign out** → **Presenter: open split-screen demo**. Left: Marta's phone
   (narrow layout, "Ask the assistant" button). Right: the case view of C-1042. Walk through the
   AI summary (it never replaces the original filing), the flags with A/S/H levels, the camera
   status, then **Approve suggestion** → the reason is prefilled, the citizen message is an AI
   draft from that reason → **Approve message and send decision**. The phone updates instantly.
   Open **Audit log**: decision, "AI suggestion accepted", AI draft and approval.
7. **Exit demo** → sign in as **SDM staff**. **Inbox**: priorities, legal clocks, flags and the
   "LegalRápido group · 5" label → open the **group view**: five cases listed individually, one
   marked "New evidence", no approve-all ("Grouping saves reading time, not review").
8. **Cameras**: CAM-NQS13 unauthorised, CAM-AN170 expired → **Open affected fines**.
9. **Bulk revocation**: Scenario B, 8 fines and their total, the notification preview → **Register
   act as in force** → type a name → **Sign and register**. Scenario A.
10. **Refunds**: auto-approved sample, R-1050 held above COP 1,000,000, fraud flags (holder
    mismatch, duplicate claim, one account for three claimants). Reject one with a reason.
11. **Audit log**: filter by actor "AI assistant", then by case C-1042.
12. Sign out → citizen: F-2042 and F-2044 now "Revoked"; ask the assistant **When will I get my
    refund?** → "ready". Open the refund, add a fictional account, tick the separate consent →
    "Verifying" → "Approved" with an expected payment date.

## AI analysis segment (~1 minute)

All analyses are mock and deterministic: every take is identical.

1. Open **`/demo`** → **Demo controls → Replay Marta's submission**. Left: Marta's phone shows
   "Received – Automatic checks". Right: the case view runs the AI intake step by step (Reading
   documents → … → Summary ready, ~4 s); then the phone moves to "Being checked".
2. In the right pane read the **AI analysis – an inspector decides** report: filed on time,
   statement signed and dated, names consistent, licence valid, and "Driver can be identified –
   decision on the merits is human only (R7)". Open a **Why?**. Open the **Documents** tab:
   extracted fields highlighted, tick **Verified by inspector** on one.
3. Exit demo → sign in as staff → **Inbox**: the "AI intake today" banner. Open **C-1049** and
   **Dismiss as false positive** the photo-metadata flag with a reason (e.g. "Original photo
   checked at the counter"). Open **C-1048** and **Confirm flag** on the late notification (R5).
4. Back on C-1042 (or in `/demo`): **Approve suggestion → Approve message and send decision**.
5. Open **AI oversight**: suggestions accepted vs overridden, flags confirmed vs dismissed (the
   dismissal you just made is listed), reading time saved, and the note that a named official
   decides.

## Built with Lovable

The project started in [Lovable](https://lovable.dev) and syncs from the `main` branch. Keep
`main` buildable and never rewrite its history.
