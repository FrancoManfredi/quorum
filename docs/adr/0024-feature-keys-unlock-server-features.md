# Feature keys unlock server features

Online Rooms are the first feature a player can only use with a key. The game has no accounts, so a
key is the only thing that says who may use a feature that costs the deployment money.

A Room costs a Durable Object and a socket, and anyone who can reach the site can publish one. Rate
limits already cap how fast a caller can do that, but not how many Rooms a day. A key puts a list of
accepted codes between the button and the Room, and the same list can later gate another feature
without inventing an account.

The player enters the key in Settings, under **Feature keys**. `AccessRpc.featureKeyCheck` answers
what it unlocks, and the browser keeps that answer beside its settings in `quorum.access.v1`. The API
Worker checks the key again on every gated call, so a key that an operator turned off stops working
at the next publish even in a tab that was loaded before.

D1 keeps the whitelist. Each row holds the key's SHA-256 hash, the features it unlocks, a note for
the operator, and an optional end date or revocation time. A copy of the table therefore opens
nothing, and no endpoint reads keys back out.

Considered options:

- **Accounts.** The real answer, and the one the game waits for ([ADR 0016](./0016-challenges-stay-in-the-browser-until-accounts.md)).
  A login, a password reset, email, and personal data to look after, all to gate one feature.
  Rejected for now.
- **A client-side switch.** No server check, so the first person to open the developer tools has
  every feature. Rejected.
- **A signed token the browser mints.** The secret that signs it would ship in the bundle, so anyone
  could mint one, and a leaked key could not be revoked. Rejected.
- **A key stored and checked in the browser.** The same problem as the switch: the whitelist would
  travel to the player. Rejected.
- **A key in D1, checked on every gated call.** One more table in the database the Exit survey
  already uses, bound to the Worker a second time as `ACCESS`. Chosen.

## Consequences

- `apps/backend/migrations/0005_feature_keys.sql` adds `feature_keys`, keyed by the hash of the key.
- `apps/backend/src/contexts/access` owns the whitelist and the decision: `FeatureGate.check` answers
  what a key unlocks, and `FeatureGate.require` refuses a gated call. `roomPublish` is the first
  caller and requires `multiplayer`. `apps/backend/src/platform/d1-access-store.ts` hashes the key
  and reads the row.
- This narrows [ADR 0019](./0019-anonymous-multiplayer-rooms.md): a Room is still anonymous and needs
  no account, but the owner needs an active key to publish one. A guest who joins by code needs
  none.
- Settings reads the same `Model.access` on both surfaces, so the title's page and the board's panel
  cannot disagree about the key. The Room panel says what is missing, and its button opens the
  section that takes a key.
- An operator makes a key with `pnpm --filter @quorum/backend feature-key`, which prints the key and
  the row to insert. `--features` names what it unlocks, `--days` gives it an end, and `--note` says
  who it is for. Nothing in the game creates a key, and there is no read API: the rows are read in
  D1.
- The browser trusts its last check. After the API Worker answers, Settings says what the key
  unlocks until the player removes it or a gated call is refused. There is no refresh, so a key that
  is turned off reads as active until the player tries the feature.
- A key is a bearer secret, shared by anyone who reads it. It gates a feature, not a person.
- What would change it: accounts. A Seat needs an identity anyway, and a key typed into one browser
  cannot follow a player to the next one.
