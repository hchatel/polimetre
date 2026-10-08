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

```bash
pnpm kandidator:download    # archives → .cache/kandidator/ (git-ignored), with retrieval date and sha256
pnpm kandidator:shortlist   # → data/kandidator/shortlist-l17.json (+ .md), committed
```

Requires Node 24 (native TypeScript) and the `unzip` command. A failed download or an unexpected file format stops the run without touching the previous cache or shortlist.

URLs used for the 17th legislature (confirmed on 2026-10-08):

| Data | URL |
|---|---|
| Scrutins | `https://data.assemblee-nationale.fr/static/openData/repository/17/loi/scrutins/Scrutins.json.zip` |
| Groups | `https://data.assemblee-nationale.fr/static/openData/repository/17/amo/tous_acteurs_mandats_organes_xi_legislature/AMO30_tous_acteurs_tous_mandats_tous_organes_historique.json.zip` |

Notes from the data:

* Each scrutin gives, per group, the group size at the date of the vote (`nombreMembresGroupe`), so **absent = members − (for + against + abstention + non-voting)**. No membership history is needed.
* Use the historical AMO archive (AMO30): the "active deputies" archives (AMO10) lack groups dissolved during the legislature (e.g. UDR, `PO847173`), and AMO50 was a stale July 2024 snapshot.
* `nonVotantsVolontaires` is not a separate category: it overlaps other counts (often equal to abstentions). It is kept as published but never used.
* A few scrutins list the placeholder group `PO0` instead of real groups: they are excluded and listed in the shortlist file.
* The "non inscrits" (`PO840056`) appear like a group in breakdowns but are not one: kept in the data, excluded from ranking.
* The portal sometimes answers an HTML error page: the download checks the zip signature.

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
