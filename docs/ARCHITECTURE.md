# Architecture

## 1. Goals

The architecture should optimize for:

1. Fast development.
2. Low operational complexity.
3. Strong type safety.
4. Testability.
5. Clear separation between political data and presentation.
6. Easy replacement of mock data with real data.
7. Future extensibility without premature abstraction.

---

## MVP scope (Kandidator)

The MVP is a static, client-heavy quiz. It has **no database, no external API call at runtime, and no background job**:

```text
src/data/kandidator/   hard-coded pool: questions, groups, scrutin breakdowns, candidates
                       validated against Zod schemas by a unit test
src/domain/kandidator/ pure scoring + adaptive question selection
src/app/               landing, quiz, result, methodology pages
scripts/               manual scrutin download + ranking (dev-only, never imported by the app)
```

Answers live in client state and in the shareable result URL only.

Routes (ROADMAP S5):

```text
/           minimal home page (full landing in S6)
/quiz       adaptive quiz, rendered on the client only (random question order)
/resultat   result from ?r=<questionId>:<o|n|0>,… (o = oui, n = non, 0 = neutre, in answer order)
```

`src/data/kandidator/share-url.ts` encodes the answers and validates the `r` parameter with Zod. The result page decodes it on the server, without storing or logging it, then `src/server/kandidator/result-view.ts` combines the domain score with the display data of the pool (group names, candidate associations, scrutin breakdowns and sources).

### Scoring code layout

Each formula of `METHODOLOGY.md` §8–9 is a small pure function in its own file, with a test file next to it, so it can be read, tested and changed in isolation:

```text
src/domain/kandidator/
├── parameters.ts          all tunable thresholds (MIN_EXPRESSED, STOP_GAP, …), nothing else
├── types.ts               Question, Answer, GroupVoteBreakdown, Stance, …
├── group-position.ts      §8.1  breakdown → position ∈ [-1, 1] | unknown
├── stance.ts              §8.2  polarity × position
├── agreement.ts           §8.4  answer vs stance → [0, 1]
├── score.ts               §8.4  per-group score, ranking, ties, "not enough data"
├── question-selection.ts  §9    discrimination power + random pick (injected random)
├── stop-rule.ts           §9    when to end the session
├── precision.ts           rounding of floating-point noise for ties and thresholds
├── test-support.ts        fictional fixture, seeded random, simulated sessions (tests only)
└── *.test.ts              guardrails.test.ts holds the mandatory tests of §9
```

Each function's doc comment names the METHODOLOGY section it implements. The methodology page imports `parameters.ts` to display the current values.

Do not create repository interfaces until a second implementation exists. The rest of this document describes the target architecture for Polimetre (phase 2).

---

## 2. High-Level Architecture

```text
┌─────────────────────────────────────────────┐
│                  Next.js                    │
│                                             │
│  Pages / Components / Server Components     │
│                                             │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│              Application Layer              │
│                                             │
│  Server actions / queries / orchestration   │
│                                             │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│                Domain Layer                 │
│                                             │
│  Quiz / Scoring / Political concepts        │
│                                             │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│             Repository Layer                │
│                                             │
│  ScrutinRepository                          │
│  PoliticalGroupRepository                   │
│                                             │
└───────────────┬─────────────────┬───────────┘
                │                 │
                ▼                 ▼
         PostgreSQL          External APIs
                              / LLMs
```

---

## 3. Source Code Organization

```text
src/
├── app/
├── components/
├── domain/
├── data/
├── db/
├── lib/
└── server/
```

### `app/`

Next.js routes and pages.

This layer should contain presentation and route composition.

It should not contain political business logic.

### `components/`

Reusable UI components.

Components should receive data rather than fetch political data directly.

* `components/ui/`: design-system primitives (`ButtonLink`, `Card`, `Chip`, `cn`). Colours, fonts and shadows are Tailwind theme tokens defined in `app/globals.css` (`paper`, `ink`, `muted`, `surface`, `primary`, `highlight`, `line`, `shadow-pop`…); components use these tokens, never raw palette colours. Groups all share the same colour: no party colour.
* `components/site/`: header, footer and the product name (`brand.ts`, working name, D7).
* `components/landing/`: home page sections. They receive `LandingView` (`server/kandidator/landing-view.ts`), in which every figure is derived from the pool.
* `components/kandidator/`: quiz and result.

### `domain/`

Pure business logic.

Examples:

* scoring;
* quiz models;
* political entities;
* position comparison.

This code should be easy to test without a database.

### `data/`

External data adapters and repositories.

Examples:

* Assembly API client;
* database repositories;
* mock repositories.

### `db/`

Database schema, migrations and database connection.

### `server/`

Server-only orchestration.

---

## 4. Repository Pattern

The application should depend on interfaces rather than concrete data providers.

Example:

```ts
interface ScrutinRepository {
  list(): Promise<Scrutin[]>;
  getById(id: string): Promise<Scrutin | null>;
}
```

Implementations may include:

```text
MockScrutinRepository
PostgresScrutinRepository
AssemblyScrutinRepository
```

This allows the MVP to use curated mock data before the external ingestion pipeline is complete.

---

## 5. Domain Independence

The domain layer must not import:

* Next.js;
* React;
* Drizzle;
* database clients;
* HTTP clients;
* LLM SDKs.

Dependencies should point inward toward the domain.

---

## 6. Data Flow

A parliamentary vote should follow approximately this pipeline:

```text
Official source
      ↓
External API adapter
      ↓
Raw response
      ↓
Schema validation
      ↓
Normalization
      ↓
Domain model
      ↓
Database
      ↓
Application layer
      ↓
UI
```

AI enrichment is a separate process:

```text
Verified source
      ↓
LLM
      ↓
Structured draft
      ↓
Validation
      ↓
Human review
      ↓
Published analysis
```

AI must never modify the authoritative vote data.

---

## 7. Database

PostgreSQL is the primary persistence layer.

Drizzle ORM is used for:

* schema definition;
* queries;
* migrations.

The initial schema should remain small.

Likely MVP entities:

```text
political_groups
scrutins
group_votes
sources
scrutin_analyses
```

Additional entities should be added only when required.

---

## 8. Background Jobs

Trigger.dev should be used for asynchronous or scheduled workloads.

Examples:

* importing new parliamentary votes;
* parsing external data;
* generating draft analyses;
* refreshing data.

For the MVP, manual scripts are acceptable.

Do not introduce scheduled automation until the manual workflow is understood.

---

## 9. Error Handling

External systems may fail.

The application should:

* validate all external responses;
* retry transient failures where appropriate;
* log failures;
* avoid corrupting existing data;
* expose useful errors to developers.

Do not silently replace missing data with guesses.

---

## 10. Security

Never expose:

* database credentials;
* API keys;
* LLM API keys;
* internal administrative endpoints.

Environment variables must be validated at application startup or access time.

---

## 11. Performance

Do not optimize prematurely.

Prioritize:

1. Correctness.
2. Simplicity.
3. User experience.

Caching can be introduced once actual performance requirements are known.
