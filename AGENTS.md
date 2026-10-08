<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# POLIMETRE — Agent Instructions

Polimetre helps French citizens compare their own views with what Parliament actually voted.
The MVP is **Kandidator** (working name): a mobile-first, Akinator-style quiz for the 2027 presidential election. It asks a few adaptive Yes / Neutral / No questions drawn from a hard-coded pool backed by real scrutins. It then deterministically ranks parliamentary groups, shows candidates only through sourced group associations, and links to the votes. No database, no stored answers.

**Current status and next task: [`docs/ROADMAP.md`](docs/ROADMAP.md). Read it first.**

## Non-negotiable rules

1. **Never invent political data.** No made-up vote, scrutin number, group position, quote or source. If data is missing, leave a visible `TODO` and stop — do not fill it with a plausible guess.
2. **Official parliamentary data is the source of truth** for votes. An LLM is never a source.
3. **Scoring is deterministic** pure code, unit tested. No LLM in the scoring path. Question *order* may be random (injected random source); the score of a given set of answers never is.
4. **Neutral wording.** Results are a similarity measure ("Your answers are closest to X on these questions"), never a recommendation. See `docs/EDITORIAL_GUIDELINES.md`.
5. **Every score is explainable**: question → user answer → group position → scrutin → source URL.
6. **A candidate is not a group.** Never derive a candidate's position from a group without an explicit, sourced association.
7. **Preserve vote nuance**: for / against / abstention / non-voting / absent are distinct. Never collapse them silently.
8. **Validate every external input with Zod** (APIs, files, LLM output, env vars) before it reaches `src/domain/`.
9. **Smallest correct change.** No speculative abstractions, no dependency without justification, no unrelated refactor. MVP scope is in `docs/PRODUCT.md`.

## Where to look

| You are working on… | Read |
|---|---|
| What to build next, open decisions | `docs/ROADMAP.md` |
| Product scope, user journey, quiz format | `docs/PRODUCT.md` |
| Scoring, group positions, question design | `docs/METHODOLOGY.md` |
| Any user-visible text (questions, results, explanations) | `docs/EDITORIAL_GUIDELINES.md` |
| Importing or citing parliamentary data | `docs/DATA_SOURCES.md` |
| Layers, folders, repositories, DB | `docs/ARCHITECTURE.md` |
| Domain vocabulary (scrutin, non-votant…) | `docs/GLOSSARY.md` |
| Why a technical choice was made | `docs/DECISIONS.md` |
| Setup, branches, PRs | `docs/DEVELOPMENT.md` |
| Next.js APIs | `node_modules/next/dist/docs/` |

If the docs do not answer a product or methodology question, **ask** rather than decide.

## Stack & layout

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind 4 · Zod 4 · Vitest · Playwright · Drizzle + PostgreSQL (not yet introduced). Node 24 (`.nvmrc`), pnpm 11.

```text
src/app/         routes & pages — composition only, no business logic
src/components/  UI components — receive data via props, never fetch it
src/server/      server-only orchestration (queries, actions)
src/domain/      pure business logic — no React/Next/DB/HTTP/LLM imports
src/data/        static datasets (MVP) & external adapters (Zod validation lives here)
src/db/          Drizzle schema & migrations (phase 2, not used by the MVP)
scripts/         manual dev-only data scripts, never imported by the app
e2e/             Playwright tests
```

Unit tests sit next to the code as `*.test.ts`.

## Conventions

- **Responsive is mandatory, mobile first.** Every screen must work on a phone; E2E runs a mobile project.
- User answers never leave the browser except encoded in a share URL.
- UI text in **French**. Code, comments and docs in **English**, except domain terms with no exact equivalent (`scrutin`), see `docs/GLOSSARY.md`.
- No `any`, no type-system bypass to make code compile.
- Small pure functions, explicit types, simple control flow.

## Commands

```bash
pnpm dev          # dev server
pnpm check        # typecheck + lint + unit tests
pnpm test:e2e     # Playwright (desktop + mobile)
pnpm db:generate  # Drizzle migration from src/db/schema.ts
pnpm db:migrate   # apply migrations (DATABASE_URL from .env.local)
```

## Definition of done

1. `pnpm check` passes; `pnpm test:e2e` passes if UI changed.
2. Non-trivial domain logic has unit tests.
3. No unsourced political claim was introduced.
4. Diff reviewed: no unrelated changes.
5. `docs/ROADMAP.md` status updated; other docs updated if behavior changed.
6. Scoring formula or parameter changed → `METHODOLOGY.md`, its unit tests and the public methodology page updated in the same change.
