# Polimetre

> Understand politics through what representatives actually vote.

Polimetre is an experimental civic technology project focused on making French parliamentary politics easier to understand.

It is built in two phases:

1. **Kandidator** (MVP, working name): a short, playful, Akinator-style quiz ahead of the 2027 presidential election. A few adaptive Yes / Neutral / No questions, each backed by a real vote of the Assemblée nationale, show which parliamentary groups (and their associated candidates) voted most like you.
2. **Polimetre**: a deeper tool where each topic comes with context, arguments for and against, nuanced answers, and a live similarity score.

## Vision

Polimetre aims to answer a simple question:

> **Which political positions are closest to mine, based on what has actually been voted?**

The longer-term vision is an accessible civic information platform where citizens can:

* explore parliamentary votes;
* understand the context behind important legislation;
* compare political groups;
* compare their own positions with parliamentary voting records;
* follow political issues over time.

## Product Philosophy

Polimetre is not intended to tell people who they should vote for.

It should make the reasoning visible.

Instead of:

> "You should vote for X."

Polimetre should say:

> "Based on your answers to these questions, your positions are closest to X. Here are the votes and sources that explain the result."

Transparency, source attribution and explainability are core product requirements.

## MVP (Kandidator)

The MVP is deliberately small:

1. A mobile-first landing page with a short methodology and sources.
2. An adaptive quiz drawing ~8–12 questions from a pool of ~30.
3. Deterministic scoring against parliamentary groups' votes.
4. A shareable result: top 3 groups, associated candidates, and the votes behind it.

The MVP does not need:

* a database (the question pool is hard-coded);
* authentication;
* storage of user answers;
* a mobile application;
* real-time synchronization;
* a chatbot;
* an administration interface.

See `docs/PRODUCT.md` and `docs/ROADMAP.md`.

## Architecture

```text
                    ┌─────────────────┐
                    │    Next.js      │
                    │ React / UI      │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Application     │
                    │ / Server        │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Domain          │
                    │ scoring         │
                    │ political model │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Repositories    │
                    └────────┬────────┘
                             │
                ┌────────────┼────────────┐
                ▼            ▼            ▼
           PostgreSQL    Assembly API    LLM
```

## Technology

* Next.js
* React
* TypeScript
* PostgreSQL
* Drizzle ORM
* Tailwind CSS
* Zod
* Vitest
* Playwright
* Trigger.dev (later, for background jobs — not installed yet)

## Development

Requirements: Node 24 (`nvm use`) and pnpm 11.

```bash
pnpm install
pnpm exec playwright install chromium   # once, for E2E tests
cp .env.example .env.local              # once the database is introduced
```

```bash
pnpm dev        # development server
pnpm check      # typecheck + lint + unit tests
pnpm test:e2e   # end-to-end tests
```

## Project Documentation

See:

* `docs/ROADMAP.md` — current status, next tasks and open decisions
* `docs/PRODUCT.md` — product goals and scope
* `docs/ARCHITECTURE.md` — technical architecture
* `docs/METHODOLOGY.md` — political methodology and scoring
* `docs/DATA_SOURCES.md` — data sources and provenance
* `docs/EDITORIAL_GUIDELINES.md` — neutrality and political language
* `docs/DEVELOPMENT.md` — development workflow
* `docs/DECISIONS.md` — architecture decisions
* `docs/GLOSSARY.md` — domain vocabulary

## Status

Polimetre is currently an experimental MVP.

The project prioritizes learning and validation over completeness.

## License

License to be defined.
