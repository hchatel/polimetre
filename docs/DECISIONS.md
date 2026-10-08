# Architecture Decision Records

This document records important technical and product architecture decisions.

The goal is not to document every implementation detail.

It exists to prevent the project and future agents from repeatedly revisiting the same decisions.

---

## ADR-001 — Next.js as the application framework

### Decision

Use Next.js with React and TypeScript.

### Reason

The project is primarily a web application with:

* interactive UI;
* server-side data access;
* SEO requirements;
* relatively simple backend requirements.

A separate frontend and backend would add unnecessary complexity for the MVP.

---

## ADR-002 — PostgreSQL as the primary database

### Decision

Use PostgreSQL.

### Reason

The project contains relational data:

* political groups;
* scrutins;
* votes;
* sources;
* analyses.

PostgreSQL is well suited to these relationships and leaves room for future analytical queries.

---

## ADR-003 — Drizzle ORM

### Decision

Use Drizzle ORM.

### Reason

The project benefits from:

* TypeScript integration;
* explicit SQL-like queries;
* schema-as-code;
* migrations.

Avoid hiding the relational nature of the data behind excessive abstraction.

---

## ADR-004 — Deterministic scoring

### Decision

Political similarity scores are calculated using deterministic application code.

### Reason

Scores need to be:

* reproducible;
* explainable;
* testable;
* independent from LLM behavior.

---

## ADR-005 — AI is an editorial assistant

### Decision

LLMs may assist with content preparation but do not determine authoritative political facts.

### Reason

LLMs can produce plausible but incorrect political information.

The project requires traceability and human validation.

---

## ADR-006 — Mock data before full ingestion

### Decision

The MVP may use curated mock or manually imported data before the complete parliamentary ingestion pipeline is implemented.

### Reason

The primary early uncertainty is product usefulness, not data pipeline scalability.

The architecture should make it easy to replace the mock repository with a real repository later.

---

## ADR-007 — No authentication in the first MVP

### Decision

Do not require user accounts initially.

### Reason

Authentication introduces:

* privacy concerns;
* additional infrastructure;
* account management;
* additional UX friction.

None is required to validate the core quiz experience.

---

## ADR-008 — Small initial dataset

### Decision

Start with a curated set of major parliamentary votes rather than attempting comprehensive coverage.

### Reason

A small, high-quality dataset is sufficient to validate:

* question design;
* scoring;
* result interpretation;
* user interest.

Coverage can increase after validation.

---

## ADR-009 — Kandidator first, Polimetre second

### Decision

The MVP is Kandidator: a short adaptive quiz (Yes / Neutral / No). Polimetre (detailed topics, arguments, nuanced answers) is phase 2.

### Reason

Kandidator is cheap to build, topical before the 2027 presidential election and shareable. It validates interest and brings users to Polimetre, which needs a database, data ingestion and editorial review.

---

## ADR-010 — Hard-coded question pool, no database in the MVP

### Decision

The Kandidator pool (~30 questions) lives in the repository as typed data, validated by Zod in tests. PostgreSQL and Drizzle are introduced with Polimetre.

### Reason

A curated pool of a few dozen items does not need persistence. Supersedes the "mock repository" approach of ADR-006 for the MVP.

---

## ADR-011 — Result = parliamentary groups; candidates via sourced associations

### Decision

Kandidator ranks parliamentary groups by similarity of votes. Candidates are shown only through an explicit, sourced group association.

### Reason

Most candidates are not deputies and their 2027 programmes are not available yet. Votes belong to groups. Presenting a group's votes as a candidate's own would be an unsupported claim.

---

## ADR-012 — Current legislature only

### Decision

Only scrutins of the current legislature of the Assemblée nationale are used.

### Reason

Groups and their membership change between legislatures; mixing them would require a fragile mapping.

---

## ADR-013 — No storage of user answers

### Decision

Answers stay in the browser and in the shareable URL. Analytics are anonymous counters only. Aggregate preferences are never published.

### Reason

Political opinions are sensitive personal data under the GDPR (art. 9). Publishing aggregate preferences near an election could be mistaken for an electoral poll.

---

## ADR-014 — UDR left out of the Kandidator pool

### Decision

The UDR group (`PO847173`, until 2025-09-04) is left out of the Kandidator pool. Its successor UDDPLR (`PO872880`, from 2025-09-05) is kept. The two groups are never merged.

### Reason

Maintainer decision (2026-10-08). UDR no longer exists, so a result pointing to it would be of little use for 2027. Merging the two groups would assume a continuity that the data does not record. UDDPLR has no position on scrutins before 2025-09-05, so the pool includes enough later scrutins for it to be compared (`MIN_COMPARED`).
