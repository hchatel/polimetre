# Development Guide

## 1. General Philosophy

Polimetre is developed incrementally.

The preferred development strategy is:

```text
small feature
    ↓
working implementation
    ↓
test
    ↓
validate product behavior
    ↓
iterate
```

Do not build infrastructure for hypothetical future requirements.

---

## 2. Local Setup

Expected requirements:

* Node.js 24 (see `.nvmrc`)
* pnpm 11
* Git
* PostgreSQL, once the database is introduced (see `docs/ROADMAP.md`, decision D4)

Install dependencies:

```bash
pnpm install
pnpm exec playwright install chromium
cp .env.example .env.local
```

Run the application:

```bash
pnpm dev
```

---

## 3. Quality Checks

Before opening a PR:

```bash
pnpm check   # typecheck + lint + unit tests
```

For UI changes:

```bash
pnpm test:e2e
```

---

## 4. Branching

Use short-lived branches.

Examples:

```text
feature/quiz-results
feature/assembly-import
fix/scoring-rounding
chore/update-dependencies
```

Avoid long-lived feature branches.

---

## 5. Pull Requests

A PR should:

* solve one problem;
* have a clear description;
* contain relevant tests;
* avoid unrelated refactoring.

The PR description should explain:

```text
What changed?
Why?
How was it tested?
Any known limitations?
```

---

## 6. Agent Tasks

Agents should receive small, bounded tasks.

Good:

> Implement the deterministic scoring function and its unit tests.

Bad:

> Build the entire political recommendation system.

A good agent task has:

* a clear input;
* a clear output;
* explicit constraints;
* a testable result.

---

## 7. Database Changes

Database schema changes must include migrations.

Do not manually modify production schema.

Test migrations against a development database before deployment.

---

## 8. External APIs

External API calls should be isolated in adapters.

Do not call external political APIs directly from UI components.

Validate responses using Zod.

---

## 9. LLM Development

LLM prompts should be version-controlled.

LLM outputs should be structured.

Prefer:

```text
prompt
  ↓
JSON
  ↓
Zod validation
  ↓
domain object
```

over unstructured text parsing.

---

## 10. Product Validation

Technical completion is not product validation.

For important product decisions, prefer shipping a small experiment over building a complete system.

The most important MVP metrics are likely to be:

* quiz start rate;
* quiz completion rate;
* result share rate;
* result exploration;
* source exploration.

These should guide future development.
