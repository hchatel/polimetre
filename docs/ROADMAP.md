# Roadmap

Single source of truth for **what is done, what is next, and what is blocked**.
Agents: pick the first `todo` session whose blockers are resolved, and update this file when you finish.

Status: `done` · `in progress` · `todo` · `blocked`

Current phase: **Kandidator MVP** (see `PRODUCT.md`). Polimetre (phase 2) is out of scope until the MVP ships.

---

## Decisions

Decisions are made by the maintainer. Agents must not resolve open ones on their own.

| ID | Decision | Status | Recorded in |
|---|---|---|---|
| D1 | Scoring formula & adaptive selection (v0) | decided (thresholds provisional, tuned after play-testing) | `METHODOLOGY.md` §8–9 |
| D2 | Result = parliamentary groups; candidates via sourced associations | decided | ADR-011 |
| D3 | Question pool: ~30 scrutins + neutral wording | **open: editorial work** | `src/data/kandidator/` |
| D4 | Hard-coded pool, no database in MVP | decided | ADR-010 |
| D5 | No storage of answers; anonymous counters only | decided (analytics tool open) | ADR-013 |
| D6 | Hosting target | **open: Vercel proposed** | `DECISIONS.md` |
| D7 | Product name ("Kandidator" is a working name) | **open** | `PRODUCT.md` |
| D8 | List of declared candidates and their group associations, with sources | **open: editorial work** | `src/data/kandidator/` |
| D9 | Scope: current legislature only | decided | ADR-012 |

---

## Sessions

### S0 — Tooling baseline · `done`

Node 24 / pnpm 11, scripts, Vitest, Playwright (desktop + mobile), Drizzle config, agent docs.

### S1 — Product docs alignment · `done`

Two-product vision, Kandidator methodology v0, ADR-009 to ADR-013.

### S2 — Scrutin shortlist script · `todo`

- `scripts/`: download scrutins + groups of the current legislature (see `DATA_SOURCES.md`), validate with Zod, normalize per-group distributions.
- Rank by discrimination and cohesion (`METHODOLOGY.md` §11), output a committed shortlist (number, title, date, per-group positions, source URL, retrieval date).
- No question wording here: that is D3.

### S3 — Domain: scoring & adaptive selection · `todo`

- `src/domain/kandidator/`, one file per formula as laid out in `ARCHITECTURE.md` ("Scoring code layout"): parameters, types, scoring (§8), question selection and stop rule (§9), injected random source.
- Unit tests, including the guardrails of §9 (reachability, determinism, neutral-only).
- Uses an obviously fictional test fixture (groups `A`, `B`, `C`…), never real political data.

### S4 — Real question pool · `blocked` (S2, D3, D8)

- `src/data/kandidator/`: questions, groups, scrutin breakdowns, candidate associations.
- Zod schemas + test: every question references a scrutin in the dataset, every scrutin and association has a source URL.
- Reachability test passes on the real data.

### S5 — Quiz & result UI · `blocked` (S3)

- Mobile-first. Quiz (one question per screen, Yes / Neutral / No), result (top 3 + associated candidates), "why this result" with links to scrutins.
- Can start with the fixture data, then switch to S4 data.
- E2E: full journey on desktop and mobile.

### S6 — Landing, methodology page, sharing · `todo` (after S5)

- Landing page with pitch, short method and sources.
- Public methodology page: every formula of `METHODOLOGY.md` §8–9 in plain French, with a worked example; parameter values imported from `parameters.ts`.
- Result encoded in the URL; social preview image.

### S7 — Deployment & analytics · `blocked` (D6)

- Deploy; anonymous counters only (sessions started, completed, shared).
