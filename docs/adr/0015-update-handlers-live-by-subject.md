# Update handlers live by subject

One root `update.ts` routed every Message. It grew to 5,104 lines: 265 arms in one `Message.match`,
and about 2,000 lines of helpers above them. Every new Node option, panel, and gesture made the file
harder to navigate, and a review of one behaviour meant scrolling through unrelated ones.

Foldkit splits a large update two ways. A Submodel owns a Model slice, its own Messages, and its own
update. A feature that shares the parent Model splits its own `update/` folder into handler modules
(the typing-game Room does this). Quorum is one screen: a board action raises a toast, opens a panel,
or changes the route, and those belong to the shell. So the split is by subject, inside one boundary,
and the Submodels that already own state keep `Update.foldChild`.

## Decision

1. `apps/web/src/game/update.ts` keeps `init`, `initialModel`, the cross-cutting wrappers (`logged`,
   `withUrl`, `withBoard`, `connect`, `milestones`), and the Message router. It is 261 lines.
2. Each subject owns `game/update/<subject>.ts`: canvas gestures, Node options, the clock and tick,
   sessions and Challenges, Companies, the Team, Exits and Playbooks, Mirrors, Incidents, panels,
   the save text and playtest tools, Mail, keyboard shortcuts, and the Tradeoff card.
3. A module exports `<subject>Handlers(model[, route])` typed `MessageCases<UpdateResult, SubjectTag>`.
   The tag union is the module's Messages, so a handler that is missing, renamed, or typed for the
   wrong payload is a type error at the root match.
4. A handler that dispatches another Message (a Mail action, a key that presses a button) takes a
   `Dispatch` argument. No handler module imports `update.ts`, so the router has no cycle.
5. `game/update/shared.ts` holds what more than one subject uses: `UpdateResult`, `Dispatch`,
   `MessageCases`, `act`, `withToast`, `sync`, the save stamping, achievement detection, milestones,
   and `freshBoard`.
6. `game/message.ts` composes the Message union from `game/message/<subject>.ts` case records. Each
   record is a plain object: an annotation such as `satisfies Record<string, Schema.Struct.Fields>`
   gives it an index signature, which widens every tag to `string` and breaks the union.
7. Inbox, Dashboard, Team, Research, Prefs, and Glossary stay Submodels. Their Messages keep their
   own unions and the root folds them with `Update.foldChild`.
8. The Board is a Model slice, not a Submodel. Board handlers write toast or panel state 93 times and
   the route 26 times; `ExitTaken`, `PerkBought`, and the Playbooks write the Founder. A Board child
   would emit an OutMessage for each of those shell effects, and every toast would cross two levels.

## Consequences

- A behaviour is found by its subject: `grep -l ResizeChosen apps/web/src/game/update` names the
  module and its Message case, and the two lists are checked against each other by the type system.
- `update.ts` fell from 5,104 to 261 lines. The largest module is `options.ts` at 968 lines, which
  holds the 89 option arms; each arm is one `act` call, so they stay together.
- Behaviour did not change: the 280 tests pass, including the 85 that drive the root update.
- `Message` tags and payloads are unchanged, so the playlog, the analytics bridge, and the DevTools
  filter read the same entries as before.
- A new Message needs one case in `message/<subject>.ts` and one handler in `update/<subject>.ts`.
  Forgetting either fails the type check.
- What would change it: if toasts and panels move into a Board Model, the Board can become a
  Submodel and the shell effects become its OutMessages.
