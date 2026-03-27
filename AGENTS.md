# Sponge SDK package instructions

## Canonical source

- This directory is the canonical SDK source: `mobwallet/packages/spongewallet-sdk`
- Do not recreate or edit a second in-repo SDK copy elsewhere
- The separate open-source SDK repo is synced by automation; treat this package as the place to make changes first

## Terminology and naming

- Use the brand name **Sponge** in prose
- Use `@paysponge/sdk` as the package name
- `SpongeWallet` and `SpongePlatform` are code identifiers, not product names

## CLI contract

- The curated CLI surface is defined in `src/cli.ts`
- The current wallet workflows are direct top-level commands, not a `wallet` subgroup:
  - `balance`
  - `send`
  - `history`
  - `tokens`
  - `search-tokens`
  - `onramp`
- Raw tool-style commands stay under `advanced`
- If you change the command tree, help text, or command grouping, update the tests and docs in the same change

## Files that must stay aligned

- CLI implementation: `src/cli.ts`
- Command-tree expectations: `tests/cli-commands.test.ts`
- CLI output rendering expectations: `tests/cli-render.test.ts`
- README CLI examples: `README.md`
- Public CLI docs: `../../../../docs/cli.mdx`
- Other docs that often mention CLI flows:
  - `../../../../docs/authentication.mdx`
  - `../../../../docs/quickstart-ai-agents.mdx`
  - `../../../../docs/quickstart-payments.mdx`
  - `../../../../docs/quickstart-trading.mdx`

## Examples contract

- Examples in `examples/` are part of the package contract, not scratch files
- If you change public API shape or CLI-adjacent flows, check whether the examples need to change too
- Example typechecking is enforced by `tsconfig.examples.json`

## Required verification

- For CLI-only changes, run:
  - `bun test tests/cli-commands.test.ts`
  - `bun test tests/cli-render.test.ts`
- For SDK surface or examples changes, run:
  - `bun run typecheck`
  - `bun run typecheck:examples`
- Before finishing any non-trivial change in this package, run:
  - `bun run check`

## Editing guidance

- Prefer changing tests to match intentional product decisions rather than preserving stale expectations
- If a CLI command moves from grouped to top-level or vice versa, update both the command-tree test and docs in the same patch
- Keep examples and docs honest: do not leave deprecated command shapes in README or docs after changing the CLI
