# Data Sources

## 1. Principle

Polimetre should prioritize primary sources.

For parliamentary voting data, official French parliamentary sources should be preferred whenever technically available.

---

## 2. Parliamentary Data

The primary source for voting records is the French National Assembly.

Relevant data may include:

* public votes;
* parliamentary groups;
* deputies;
* legislative texts;
* amendments;
* vote results.

### Endpoints

The Assemblée nationale publishes open data at <https://data.assemblee-nationale.fr>.
Download URLs change between legislatures: confirm them from the portal before scripting, and record the URL actually used.

| Data | Dataset | Notes |
|---|---|---|
| Scrutins | "Scrutins" of the current legislature (JSON archive, one file per scrutin) | Per-group breakdown (`for` / `against` / `abstention` / `non-voting`), group majority position, nominal votes |
| Groups & deputies | "Acteurs, mandats et organes" (AMO) | Group names, membership over time, group sizes (needed to derive absences) |
| Human-readable page | `https://www.assemblee-nationale.fr/dyn/{legislature}/scrutins/{number}` | Source URL shown to users |

### Kandidator pool workflow (MVP)

```text
scripts/ downloads the archives  → raw files (git-ignored)
          ↓ Zod validation
       normalization             → per-scrutin, per-group distribution
          ↓
       ranking (discrimination + cohesion, METHODOLOGY §11)
          ↓
       shortlist (committed, with source URLs and retrieval date)
          ↓ human selection + neutral wording
       src/data/ question pool   (hard-coded, Zod-validated in tests)
```

The script is run manually. No scheduled import in the MVP.

### Candidates

Candidate declarations and candidate ↔ group associations are curated by hand, each with a source URL and a date (see `METHODOLOGY.md` §6).

---

## 3. Secondary Sources

Secondary sources may be used for:

* additional context;
* explanations;
* historical information;
* cross-checking.

Secondary sources should not override official parliamentary voting records without explicit justification.

---

## 4. Source Provenance

For important data, store provenance information.

Recommended fields:

```text
source URL
source title
publisher
external identifier
publication date
retrieval date
```

---

## 5. Data Import

External data must be:

1. Retrieved.
2. Validated.
3. Parsed.
4. Normalized.
5. Stored.

Never insert raw external data directly into the domain model without validation.

---

## 6. External API Failures

An external API may:

* change format;
* become unavailable;
* return incomplete data;
* rate-limit requests.

Import jobs should fail safely.

A failed import must not corrupt existing verified data.

---

## 7. Data Corrections

If an upstream source corrects historical data:

* record the correction;
* update the normalized data;
* preserve enough metadata to understand what changed.

Do not silently rewrite political history without traceability.

---

## 8. LLM Sources

An LLM response is not considered a source.

If an LLM produces a statement about politics, the statement must be linked to an actual source before publication.

For example:

```text
LLM summary
    ↓
Source verification
    ↓
Human review
    ↓
Published content
```

---

## 9. Source Display

Whenever practical, users should be able to access the underlying source.

The interface should make a distinction between:

* official source;
* secondary source;
* editorial explanation;
* AI-assisted summary.
