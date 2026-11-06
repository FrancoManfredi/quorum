# Quorum

- Read `docs/guardrails.md` for the enforced rules, and `CONTEXT.md` for the vocabulary code and copy use.
- Follow `docs/writing.md` for any prose in the wiki, README, and ADRs.
- Verify with `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm build`.
- Never run `pnpm deploy` without explicit approval.
- Use only `tsrs` and `effect-tsrs` for diagnostics. Never run `tsc`, `tsgo`, or `vp lint --type-check`; do not add `typescript` or turn on `typeCheck` in `vite.config.ts`.
- If `vp lint` fails after an install that skipped scripts, run `pnpm exec effect-tsrs patch --oxlint`.
- Alchemy and infrastructure live only in the root `alchemy.run.ts`; `src/worker.ts` files never import Alchemy.
- Game rules, catalog, and Game schema live in `packages/simulation`; rendering, input, and storage live in `apps/web`.
- Never type a catalog number into `apps/wiki/content`; wiki facts come from the catalog. The exception is `apps/wiki/content/design`, the game design document (ADR 0014), which may state numbers by hand.
- `packages/ui` views take data and Messages, never an app's Model.
- Agent tools only read. Names and protocol live in `packages/mcp-relay`; implementation lives in `apps/web/src/game/agent-tools.ts`.
- RPC schemas and errors live in `packages/rpc`; handlers live in `apps/backend`.
- Retained remote data uses Foldkit Query; loading decisions belong in update handlers.
- Do not add a workspace package, domain package, or Cloudflare service without a concrete need.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
