# Product Definition

## 1. Problem

Political information is often presented through:

* campaign promises;
* media summaries;
* partisan communication;
* complicated parliamentary documents;
* isolated political statements.

Citizens may find it difficult to understand how political groups actually behave when legislation is voted on.

Polimetre explores whether parliamentary voting records can provide a more concrete basis for understanding political positions.

---

## 2. Two Products, Two Phases

| | **Kandidator** (phase 1 — MVP) | **Polimetre** (phase 2) |
|---|---|---|
| Goal | Fast, fun entry point; shareable | Informed, nuanced reflection |
| Session | ~6–12 adaptive questions (18 at most), a few minutes | As many topics as the user wants |
| Answers | Yes / Neutral-don't know / No | 5-point scale + skip + personal importance |
| Content per question | One short neutral sentence | Topic, context, summary, arguments for and against |
| Data | Hard-coded curated pool in the repo | Database, ingestion pipeline, editorial back-office |
| Result | Top 3 closest parliamentary groups + associated candidates | Live similarity per group, updated after each topic |

*Kandidator* is a working name.

Kandidator is deliberately low-stakes: its result has limited value on its own. Its purpose is to attract users and lead them toward Polimetre.

**Only Kandidator is in scope for the MVP.** Polimetre is described in section 8 so that MVP choices do not block it.

---

## 3. Kandidator — User Journey

```text
Landing page (pitch, short methodology, sources)
    ↓
Start
    ↓
Adaptive questions (Yes / Neutral / No), one per screen
    ↓
Result: top 3 groups with percentages + associated candidates
    ↓
"Why this result?" — answers vs group votes, per question
    ↓
Parliamentary votes and sources
    ↓
Share  /  "Go further" (Polimetre teaser)
```

### Requirements

* **Responsive design is mandatory. Mobile first**: most traffic is expected from shared links opened on smartphones. Every screen must work on a phone and on a desktop.
* First result reachable in a few minutes.
* **Replayable**: the question pool (~30 questions) is larger than a session, and question order varies between sessions.
* Shareable result: the result is encoded in the URL and has a social preview image. Nothing is stored server-side.
* Landing page explains the method in a few lines and links to the full methodology and sources.
* UI in French.

---

## 4. Kandidator — Questions

Each question is backed by one scrutin of the current legislature of the Assemblée nationale (see `METHODOLOGY.md`).

Good question:

> "Should existing nuclear reactors be extended?"

Poor question:

> "Are you more progressive or conservative?"

Questions should:

* be understandable without specialist knowledge;
* describe the actual content of the vote accurately;
* avoid ideological labels and embedded arguments (see `EDITORIAL_GUIDELINES.md`);
* help tell parliamentary groups apart.

---

## 5. Kandidator — Answers

```text
Yes
Neutral / don't know
No
```

"Neutral / don't know" is not counted in the score.

---

## 6. Kandidator — Result

The result compares the user's answers with the **votes of parliamentary groups**. It is not a statement about candidates' programmes.

Preferred:

> "Your answers are closest to the votes of Group X (82%), then Group Y (74%) and Group Z (61%)."

Candidates are shown only through an explicit, sourced association with a group:

> "Candidate(s) associated with Group X: Y (source)."

The result page must make this distinction visible. See `METHODOLOGY.md` §6.

The result should never be framed as a voting recommendation.

---

## 7. Privacy

* Answers stay in the browser. They are never sent to or stored on the server.
* Analytics are limited to anonymous counters (sessions started, completed, results shared).
* Aggregate preferences ("X% of players are close to Y") are never published: close to an election, they could be read as an unregulated electoral poll.

---

## 8. Polimetre (phase 2 — not in MVP scope)

For each topic debated at the Assemblée nationale, the user sees:

* the topic and its context;
* a short description, with a longer one on demand;
* arguments for and against, **without saying which political side made them**, so the user can judge on the merits;
* a 5-point answer (No, Rather no, Neutral, Rather yes, Yes), or skip;
* how important the topic is to them (from "not important" to "very important"), used as the question weight.

After each answer, the user sees the actual vote result and their updated similarity with each group. The UI encourages answering enough topics for the result to stabilize.

The user can share the result or keep a session summary. No personal data is kept, except anonymous aggregate statistics.

Possible later features (most require user accounts):

* answer before a text is voted on;
* regular digests of debates and votes on topics the user follows.

Polimetre requires a database, parliamentary data ingestion, LLM-assisted drafting and human review before publication.

---

## 9. Product Principles

### Evidence over promises

Actual votes are the primary evidence.

### Explanation over recommendation

Explain why a result was produced.

### Nuance over binary labels

Political positions are often more complex than "left/right".

### Source over assertion

Important factual claims should be traceable.

### Small before complete

Validate the product before building the platform.
