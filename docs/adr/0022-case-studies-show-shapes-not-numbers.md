# Case studies show shapes, not numbers

The Patterns section explains one idea at a time, on a board the Simulation solves. A reader asked to
see the same ideas in systems they know, at the scale those systems ran. A company history would not
teach that, and a board that claimed the company's traffic would lie: the Simulation is stylized on
purpose ([How real is Quorum](https://github.com/elianiva/quorum/blob/main/apps/wiki/content/explanation/how-real.md)).

## Decision

1. `patterns` gains a group, "Ran in production", after Cost and before Outside the game. Each page
   shows one shape a real system ran, names who and when, and draws the same shape on the game's board
   at game scale.
2. The title leads with the decision ("Shard by shop: Shopify"), so the section stays about patterns.
   The first sentence names the company, the year, and the change.
3. Real numbers appear in prose, with a source. The board's settings table and caption stay derived
   from the Design, so a game number never enters prose.
4. Every page has a "Where the game stops" section: the parts the board cannot show, and a sentence
   that the caption is Quorum's result, not the company's. The Design's `note` repeats the short form
   under the caption.
5. Sources are the company's own engineering post, paper, or postmortem, at least three, each with a
   line on what it is good for. Facts and numbers are cited. Diagrams are redrawn, not copied.
6. A second group, "When it broke", sits after Ran in production. A failure page shows the shape that
   failed, the incident that broke it, and the guardrail added. The board runs the closest game
   incident, and its note says the caption is the game's incident, not the company's outage. Its
   sections are "What broke" and "What changed" instead of "Why it works".

## Consequences

- A new case study is a page and a Design, like a pattern. `designs.test.ts` still checks that the
  Design solves, keeps its cards apart, and is placed on a page.
- A failure page does not need a healthy result. Its board runs the incident, so the caption can show
  errors or a low Apdex, and "Where the game stops" explains the gap.
- The group stays curated. A company with only a conference talk, or no number, does not get a page.
  It can be a reference on an existing pattern page.
- A change to the Simulation that alters a Design's result changes its caption, not its prose. A claim
  in the prose that depends on a result still needs a human read.
- Real numbers go stale. Each page dates its figure in the sentence, so a 2016 number cannot read as
  current.
