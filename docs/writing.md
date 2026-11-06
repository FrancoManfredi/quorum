# Writing guide

This guide covers prose in `apps/wiki/content` (the player wiki and the design record), the README, and ADRs. Game vocabulary comes from `CONTEXT.md`. UI copy and code comments follow the same rules.

A reader should enjoy the page, not only extract facts from it. The wiki reads flat today: short declarative sentences, the same headings on every page, and no sign that a person who cares about this game wrote it. Write like a knowledgeable friend who is in a hurry. Be plain and specific, and have an opinion where the page type allows one.

## Choose the page type first

Each type has its own job and voice ([Diátaxis](https://diataxis.fr/start-here/)).

| Type          | Where                 | Voice                                                                                                                   |
| ------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Tutorial      | `tutorials/`          | A guide at the reader's side. Short steps, one result per step, and what the reader will see.                           |
| How-to        | `guides/`             | Terse and direct. The reader is competent and in a hurry. Goal first, then steps.                                       |
| Reference     | `components/`, tables | Neutral and complete. What a thing does, nothing else. Components share one fixed layout (see below).                   |
| Explanation   | `explanation/`        | The only type with a point of view. Say why, name the alternatives, and say which one the game chose and what it costs. |
| Design record | `design/`             | Explanation for developers. Present tense, one decision per paragraph, tradeoffs named.                                 |

## Rules

1. **Answer first.** The first sentence of a page or section says what it is or what to do. Context comes after. A reader who stops after one sentence should have the point.
2. **Show a case.** After a claim, give one concrete example: a number from the game, a named incident, a specific card. "A GC pause adds 150 ms to 2% of requests, so the p99 moves and the mean barely does" beats "tail events affect percentiles".
3. **Vary sentence length.** Aim for 8 to 20 words. Allow a short sentence for emphasis and a long one when the logic needs it, but split anything over 30 words. Five sentences of the same shape in a row read as machine-written.
4. **Connect sentences.** Use "so", "but", "though", "because" and "which means" when one sentence follows from the last. Do not stack facts side by side and leave the reader to guess how they relate.
5. **Name the actor.** Say what the player, the Node or the Simulation does. Do not write "The game computes…" five times a page.
6. **Use plain words.** Write "use", "help", "show", "so". Skip "leverage", "utilize", "robust", "seamless", "crucial", "ecosystem" and "simply".
7. **Cut headings that have nothing to say.** Outside Component pages, a section needs content to earn its heading. Component pages follow the fixed layout below.
8. **One idea per list item.** A list of ten nouns inside a sentence is a table or a bulleted list. A table cell holds one fact, not a paragraph.
9. **Link once, where it helps.** Link a term the first time it matters on a page. Do not link every capitalized word.
10. **Present tense, no history.** Describe what the game does. Do not write "now", "no longer", "since M5" or "batch B3". The commit log keeps history.

## Component page layout

Component pages are reference. A reader who wants one answer, such as when to place a Component, must find it without reading the definition. Every Component page uses the same sections in the same order, split by what the reader came for, like a Terraria wiki page.

```md
One sentence: what it is and the real product it stands for.

## When to place it

- Place it when ...
- Skip it when ... (only if the facts exist)
- Resize or copy it when ...

## How it works

What it does and what sets its capacity or behavior. Short paragraphs or a list.

## Options (omit when the Component has none)

One short entry per setting, strategy, or engine: what it changes and what it costs.

## How it fails

- [Incident](/incidents/x): what causes it, and the fix.

## Tips

- One imperative line each.
```

Rules for the layout:

- The one-sentence lead is the only text above the first heading.
- "When to place it" comes first because it is what most readers need. Keep each bullet to one condition and its signal, such as a gauge or symptom the reader can see.
- Keep the headings exactly as written so readers learn where to look. Only "Options" and "Tips" may be absent, and only when the page has no such facts.
- A `::Sandbox` directive goes at the end of the section it demonstrates.
- Link to the glossary and design pages from "How it works", not from the lead.

## Patterns to cut

These habits make prose read as machine-written. One use is fine. A repeat is a tell.

- **"Not X, it's Y."** Also "This isn't about X. It's about Y." State Y.
- **Dramatic reveals.** "The catch: …", "The result? …", "Here's the thing: …".
- **Countdown lists.** "Not a tool. Not a platform. A system."
- **Trailing "-ing" analysis.** "…, highlighting how important it is", "…, reflecting a broader trend".
- **Three of everything.** More than one rule-of-three per page.
- **The same opener three times in a row.** Check how your sentences start.
- **Synonym cycling.** Pick one name for a thing and keep it. Use the `CONTEXT.md` term.
- **Promotional words.** "powerful", "rich", "comprehensive", "ensures", "key".
- **Signposting.** "In conclusion", "It is worth noting", "Importantly". Say the thing.
- **Bold in the middle of a sentence** for emphasis. Bold marks the first mention of a defined term and the UI labels a reader clicks.
- **Em dashes as a rhythm device.** Use a period, comma or colon. In a table cell, write "None" or leave it empty.
- **"Real companies do X" as a stock opener.** If a real case matters, name it: who, when, what happened.

## Where voice belongs

Put personality where the reader feels it: incidents, guides, tutorial outcomes, and the opening of an explanation. A retry storm taking down a service at 3 AM is a story, so tell it in one sentence. Keep reference tables and design formulas neutral. Do not add jokes, puns or exclamation marks. A dry observation is enough.

## Numbers

Player pages (`tutorials/`, `guides/`, `explanation/`, `components/`) take every game number from the catalog. Do not type one by hand. `design/` is the one place that states numbers by hand, as the record of the design.

## Check before you commit

- Does the first sentence of each section carry the point?
- Is there a concrete example next to each claim?
- Do three sentences in a row share a length or an opener?
- Does any sentence run past 30 words?
- Is every heading there because it has content?
- Did you search the page for the patterns above?
