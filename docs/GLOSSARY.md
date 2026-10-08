# Glossary

Domain vocabulary. French terms are kept in code when there is no exact English equivalent.

| Term (FR) | Code name | Meaning |
|---|---|---|
| Assemblée nationale | — | Lower house of the French Parliament. Primary data source for the MVP. |
| Législature | `legislature` | Parliamentary term, numbered (the 17th began in July 2024). Scrutin numbers restart at each legislature, so always store both. |
| Scrutin | `scrutin` | A recorded vote in the Assemblée, identified by legislature + number (e.g. scrutin n° 1234 of the 17th legislature). May concern a whole bill, an article, an amendment or a motion. |
| Scrutin public ordinaire / solennel | `scrutinType` | Two kinds of public vote. A *solennel* vote is scheduled in advance, usually on a whole bill, and has higher attendance. |
| Groupe parlementaire | `group` | Formal group of deputies. Composition changes over time: always use the group affiliation **at the date of the scrutin**. |
| Apparenté | — | Deputy attached to a group without being a full member. Counted with the group in official vote breakdowns. |
| Non-inscrit | — | Deputy who belongs to no group. |
| Pour / Contre / Abstention | `for` / `against` / `abstention` | Expressed positions in a scrutin. Abstention is an explicit choice, not opposition. |
| Non-votant | `nonVoting` | Present but recorded as not voting (e.g. the presiding officer, members of the government). Distinct from abstention and absence. |
| Absent | `absent` | Not listed in the scrutin. Not provided directly: derived from group size minus recorded votes. |
| Position majoritaire | `majorityPosition` | Majority position of a group in a scrutin, as published in the official breakdown. Keep the full distribution alongside it. |
| Mise au point | `voteCorrection` | A deputy's after-the-fact statement that they meant to vote differently. Does not change the official result; store it separately if used. |
| Question | `question` | A quiz item shown to the user, backed by one or more scrutins. |
| Polarité | `polarity` | Whether "agree" with a question corresponds to voting *for* or *against* the underlying scrutin. |
