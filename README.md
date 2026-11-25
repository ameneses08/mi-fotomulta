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

State lives in memory only. **A full page reload resets the demo**; navigate with the in-app
links and buttons. Staff and demo pages have a **Demo controls** button (bottom right) to reset.

## Folder structure

```
src/
  routes/       TanStack Start file routes (thin: params, page title, one screen)
  screens/      screen components – home/, citizen/, staff/, demo/
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

| Route                          | Screen                                                 |
| ------------------------------ | ------------------------------------------------------ |
| `/`                            | Home: choose citizen, staff or the split-screen demo   |
| `/citizen`                     | C1 My fines and "Money to recover"                     |
| `/citizen/fines/:id`           | C2 Fine detail with data sources and "Explain my fine" |
| `/citizen/fines/:id/challenge` | C3 Four-step guided challenge                          |
| `/citizen/cases/:id`           | C4 Case tracker                                        |
| `/citizen/refunds/:id`         | C5 Refund with bank account and separate consent       |
| `/staff`                       | S1 Queue with legal clocks, rule flags and grouping    |
| `/staff/cases/:id`             | S2 Case detail: claim, AI brief, rule checks, decision |
| `/staff/legal-acts`            | S3 Bulk-revocation act (Scenario B → A)                |
| `/demo`                        | D1 Citizen phone and inspector screen for case C-1042  |

## Demo script (launch video, ~5 minutes)

Before recording: open `/staff`, click **Demo controls → Reset to before Marta's challenge**,
then click **Switch role** to return home. Record at 1440×900.

1. **Home** – read the tagline, click **I'm a citizen**.
2. **My fines (C1)** – six fines with statuses derived by the rules engine. Point out
   F-2042 "Under review", F-2044 "Refund on hold", F-2046 "Another authority".
3. Open **F-2041 (C2)** – data rows tagged _From SIMIT / RUNT / ANSV_ and "We already have
   this information". Show the **Explain my fine** AI panel. Click **Challenge this fine**.
4. **Challenge (C3)** – reason _I wasn't driving_ → Continue. Paste any sentence into "Paste
   text from your own AI assistant" → **Turn into a structured claim** → Continue. **Use
   sample documents** (AI evidence check updates) → Continue. Review the AI-drafted request →
   **Submit challenge**.
5. **Tracker (C4)** – "Received", then after ~3 seconds automatic checks finish: "Being
   checked", held by Inspector Laura Gómez, expected date in working days.
6. Click the logo → **Open split-screen demo (D1)**. Left: Marta's phone. Right: S2 for C-1042.
   Walk through the AI brief, the rules it relied on and the A/S/H rule checks (R7 is
   human-only).
7. In the decision panel keep **Revoke** (AI suggestion), edit the citizen message if you like,
   click **Use the AI's suggested reason**, then **Confirm decision**. The phone updates
   instantly with a highlight: "Decision: Revoked…", hearing shown as skipped. Open the
   **Audit log** tab: status change plus "AI suggestion accepted".
8. **Demo controls → Reset demo data**, go to **Queue (S1)** via Switch role → I'm SDM staff:
   summary cards, legal clocks ("6/10 days"), flags, then **Group similar** → "5 similar cases –
   LegalRápido S.A.S." with the note that each case is decided individually.
9. **Legal acts (S3)** – Scenario B banner. **Register act as in force** → 8 fines, COP 1,300,000
   → type a name → **Sign and register**. Banner flips to Scenario A.
10. Switch role → **I'm a citizen**: F-2042 and F-2044 are now "Revoked", Money to recover shows
    "Eligible". Open the refund (C5), enter a fictional account, tick the separate consent,
    **Confirm bank account** → "Verifying" → automatically "Approved" with an expected
    payment date.

## Built with Lovable

The project started in [Lovable](https://lovable.dev) and syncs from the `main` branch. Keep
`main` buildable and never rewrite its history.
