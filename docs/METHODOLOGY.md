# Political Methodology

## 1. Purpose

Polimetre compares user responses with documented political positions.

The objective is not to determine which political position is correct.

The objective is to measure similarity according to an explicit methodology.

---

## 2. Primary Evidence

The preferred hierarchy is:

1. Actual parliamentary vote.
2. Official parliamentary document.
3. Official political group or party statement.
4. Public statement by an identifiable political representative.
5. Other reputable sources.

Inferences should be avoided whenever possible.

**Kandidator (MVP) uses only level 1**: public votes (scrutins) of the **current legislature** of the Assemblée nationale. Older legislatures are excluded because group composition changes between legislatures.

---

## 3. Parliamentary Votes

A vote should preserve the original parliamentary information.

At minimum:

* date;
* legislature and scrutin number;
* title;
* result;
* vote breakdown per group;
* individual votes when available;
* source URL.

---

## 4. Group Position

A group position should not simply be represented as:

```text
FOR
AGAINST
```

when individual voting data is available.

The underlying distribution should be preserved.

For example:

```text
FOR: 72
AGAINST: 5
ABSTAIN: 3
NON-VOTING: 1
ABSENT: 12
```

Absences are not published directly: they are derived from the group size at the date of the vote. See `docs/GLOSSARY.md`.

The application may derive a majority position from this distribution, but should not discard the underlying information.

---

## 5. Abstention and Absence

Abstention is not equivalent to opposition.

Absence is not equivalent to abstention.

Non-voting (e.g. presiding officer, members of the government) is neither abstention nor absence.

The data model must preserve these distinctions.

The scoring methodology should explicitly document how these cases affect comparison (see §8).

---

## 6. Candidate Associations

Candidates who are not members of Parliament cannot automatically be assigned parliamentary votes.

Kandidator compares the user with **parliamentary groups**. Candidates are displayed next to a group only through an explicit association:

```text
Candidate
    ↓
Association (type + source URL + date)
    ↓
Group
    ↓
Parliamentary voting record
```

Rules:

* Only declared candidates, with a source for the declaration.
* Each association has a type (e.g. "member of the party forming the group", "supported by the group") and a source.
* A group may have zero, one or several associated candidates. A candidate may have no group.
* The result page always says that the comparison is based on the group's votes, not on the candidate's own votes or programme.

---

## 7. Question Construction

Questions should be:

* understandable without specialist knowledge;
* politically relevant;
* neutral in wording;
* linked to a concrete source;
* answerable on a spectrum.

Avoid questions that embed an argument.

Bad:

> "Should France finally stop wasting money on inefficient public programs?"

Better:

> "Should public spending be reduced in order to lower taxation?"

Each Kandidator question references exactly one scrutin and a **polarity**:

* `polarity = +1`: answering "Yes" means agreeing with a vote **for** the scrutin;
* `polarity = -1`: answering "Yes" means agreeing with a vote **against** it (e.g. the scrutin is on an amendment that deletes the measure the question asks about).

---

## 8. Kandidator Scoring (v0)

> Status: **validated**. Thresholds (`UPPER_CASE`) are provisional and will be tuned after play-testing. They live in a single parameters file (see `ARCHITECTURE.md`), and every formula below has its own function and unit tests.

### 8.1 Group position on a scrutin

For group `g` on scrutin `s`, with `for`, `against`, `abstention` the number of the group's members who voted that way:

```text
expressed = for + against + abstention
position(g, s) = (for - against) / expressed          ∈ [-1, +1]
```

* Non-voting members and absent members are **excluded**: they did not express a position.
* Abstentions are **included** in the denominator: they pull the position toward 0.
* A split group naturally gets a position near 0, so it is no longer clearly "for" or "against".
* If `expressed < MIN_EXPRESSED` (default `3`), the position is **unknown** and the question is ignored for that group.

### 8.2 Group stance on a question

```text
stance(g, q) = polarity(q) × position(g, scrutin(q))   ∈ [-1, +1]
```

### 8.3 User answer

```text
Yes      → +1
Neutral  →  ignored (not counted)
No       → -1
```

### 8.4 Agreement and score

For each question answered Yes or No where the group's stance is known:

```text
agreement(g, q) = 1 - |answer(q) - stance(g, q)| / 2   ∈ [0, 1]
```

```text
score(g) = mean of agreement(g, q) over those questions   → displayed as a percentage
```

* All questions have the same weight in Kandidator.
* Equal scores are displayed as tied. For a stable display order, ties are sorted by group identifier.
* A group compared on fewer than `MIN_COMPARED` questions (default `3`) is flagged as "not enough data" rather than ranked.

### 8.5 Determinism

Given the same questions, answers and group positions, the score is always identical.

**Question order may vary between sessions** (to make replay interesting), but it never affects the score of a given set of answers.

---

## 9. Kandidator Adaptive Question Selection (v0)

> Status: **validated**, thresholds provisional (same as §8).

Goal: reach a stable top 3 in few questions.

1. **Candidate pool**: questions not yet asked.
2. **Discrimination power** of question `q`:
   * before any Yes/No answer: spread of `stance(g, q)` across all groups (max − min);
   * afterwards: spread across the current `TOP_K` groups (default `3`).
3. Pick at random among questions whose power is at least `RANDOM_BAND` (default `90%`) of the best one. The random source is injected, so tests are reproducible.
4. **Stop** when one of these is true:
   * at least `MIN_QUESTIONS` (default `6`) Yes/No answers **and** the gap between the 1st and 2nd group is at least `STOP_GAP` (default `15` points);
   * `MAX_QUESTIONS` (default `12`) questions have been asked;
   * the pool is exhausted.

### Mandatory guardrail tests

* **Reachability**: for every group, a simulated user who answers exactly like that group (Yes if stance > 0, No if stance < 0) gets that group ranked first.
* **Determinism**: the same answers always produce the same scores.
* **Neutral answers only**: produces no ranking and an explicit message instead.

---

## 10. Question Weights (Polimetre, phase 2)

Not all questions need equal importance.

In Polimetre, the user may set how important a topic is to them; that value becomes the question weight.

Weights should be:

* explicit;
* visible to the user;
* documented;
* deterministic.

The product should avoid secretly changing weights based on user behavior.

---

## 11. Selecting Questions

The pool should prioritize scrutins that are:

* politically meaningful;
* **discriminating**: groups vote differently, and different scrutins split the groups in different ways (not only along a single left/right axis);
* **cohesive**: the groups concerned voted clearly (position far from 0);
* understandable to a general audience;
* balanced across topics.

Process (see `DATA_SOURCES.md`):

1. A deterministic script ranks the scrutins of the current legislature by discrimination and cohesion.
2. The maintainer picks the scrutins and writes or validates a neutral question for each. An LLM may draft the wording; a human validates it.

### 11.1 Shortlist ranking (v0)

Implemented in `scripts/kandidator/rank.ts`; constants in `scripts/kandidator/config.ts`. It only orders candidates for human review: it is not part of the user score.

For each scrutin, using the group position of §8.1 (`MIN_EXPRESSED` included) over parliamentary groups only (non-inscrits are excluded):

```text
eligible        at least MIN_KNOWN_GROUPS_RATIO (2/3) of the groups have a known position
discrimination  = max(position) − min(position)              ∈ [0, 2]
cohesion        = mean of |position| over known groups         ∈ [0, 1]
score           = discrimination × cohesion                    ∈ [0, 2]
participation   = expressed votes / members, over the groups   (tie-break only)
```

Diversity: two scrutins have the **same split** when no group known in both has a different sign (`+`, `−` or `0`); unknown positions never make two splits different. The shortlist is built greedily: at each step, the scrutin with the best `score / (1 + number of kept scrutins with the same split)` is kept. Ties go to the highest participation, then to the lowest scrutin number. `SHORTLIST_SIZE` (150) scrutins are kept.

Scrutins with known upstream data issues (e.g. placeholder group reference `PO0`) are excluded and listed in the shortlist file, never corrected by hand.

Known limitation: texts adopted without a vote (Article 49.3) cannot appear in the pool.

---

## 12. Result Interpretation

The result should be described as a similarity measure.

Preferred:

> "Your answers are 82% aligned with the votes of Group X on the questions asked."

Avoid:

> "Group X represents your political beliefs."

The first is a measurement.

The second is an unsupported psychological or political claim.

---

## 13. Methodology Transparency

The public methodology page should explain:

* which votes are included;
* how questions are written;
* how positions are calculated;
* how abstentions are treated;
* how candidates are associated with groups;
* how scores are calculated;
* how AI is used;
* how human review works.

Users should be able to understand the methodology without reading source code.

For Kandidator, the methodology page details **every formula of §8–9**, in plain French with a worked example. It must import the parameter values from the domain parameters file rather than hard-coding them, so the page can never drift from the code. Any change to a formula or parameter must update this document, the tests and the page in the same change.
