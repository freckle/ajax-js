# @freckle/ajax

## Install

```sh
pnpm add @freckle/ajax
```

The ajax helpers call jQuery through the global `$`, so consumers must install
jQuery on the global object before using them.

## Development

```sh
pnpm install
```

| Script              | What it does                                              |
| ------------------- | --------------------------------------------------------- |
| `pnpm build`        | Compiles `src/` to `dist/` via `tsconfig.build.json`      |
| `pnpm test`         | Runs the vitest suite                                     |
| `pnpm coverage`     | Runs the suite with v8 coverage, gated at 70%             |
| `pnpm typecheck`    | `tsc --noEmit`, including test files                      |
| `pnpm lint`         | ESLint                                                    |
| `pnpm knip`         | Reports unused files, dependencies and exports            |
| `pnpm format`       | Rewrites `src/**/*.ts` with prettier                      |
| `pnpm format-check` | Checks `src/**/*.ts` formatting without writing           |

`dist/` is committed. Run `pnpm build` and commit the result when you change
`src/`; CI fails otherwise.

## Release

See [RELEASE.md](./RELEASE.md).

## Ajax helpers

See [ajax.ts](./src/ajax.ts).

## Link header

See [link-header.ts](./src/link-header.ts).

---

[LICENSE](./LICENSE)
