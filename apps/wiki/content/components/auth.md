The Auth Provider checks passwords so your App Servers do not have to, as a hosted identity service such as Auth0.

## When to place it

- Place it when logins eat your App Server CPU.
- Place it when p99 jumps on an event-loop runtime such as Node.js. A hash on the event loop stalls every request queued behind it, and the [Event Loop Stall](/sandboxes/event-loop-stall) Sandbox shows it.

## How it works

Link an App Server to it, and that server sends each login to the Auth Provider as an auth call. Your CPU stops paying for password hashing, which is slow on purpose. See [bcrypt](/glossary/bcrypt). An App Server without a link to the Auth Provider still hashes its own logins.

It is a Managed Component: it costs nothing to place, has no capacity limit, and serves every region. It adds a fixed delay to each login. Its Burn grows with your user count, not with logins, so it is cheap early and grows into a large line on the bill.

## How it fails

The Auth Provider itself does not fail in the game. It prevents two incidents:

- [Event loop block](/incidents/loop): the hashing cost goes up, and every login takes four times the CPU. The Auth Provider and the [libuv thread pool](/research/libuv-pool) both take the hash off the loop.
- [Credential stuffing](/incidents/stuffing): bots try leaked passwords, and every attempt is a hash. A [WAF](/components/waf) blocks most of them, and the Auth Provider hashes the rest.

Its own failure is cost.

## Tips

- Watch its Burn in the Ledger as users grow.
- On Node.js, compare it with the libuv thread pool Research, which costs no Burn.
