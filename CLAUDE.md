# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Easy Peasy (v6.1.1) is a React state management library built on Redux + Immer. Source is JavaScript with handwritten TypeScript definitions in `index.d.ts`.

## Commands

```bash
yarn install              # Install dependencies
yarn build                # Rollup build (ESM + CJS → dist/)
yarn lint                 # ESLint with auto-fix
yarn test                 # Vitest (jsdom)
yarn test -- tests/actions.test.js          # Single test file
yarn test -- --testNamePattern="some test"  # Single test by name
yarn test:watch           # Watch mode
yarn test:coverage        # Coverage report
yarn dtslint              # TypeScript type tests (tests/typescript/)
```

## Architecture

**Redux wrapper with symbol-based type detection.** Models are plain JS objects; helpers (`action`, `thunk`, `computed`, etc.) tag properties with symbols (`$_a`, `$_t`, `$_c`, etc.) that `extract-data-from-model.js` uses to build dispatch routing and metadata maps during store creation.

### Middleware chain (in order)

Computed properties → user middleware → Redux Thunk → listeners → effects → persistence

### Key source files

- `src/create-store.js` — Store factory. Assembles middleware, initializes state, handles `addModel`/`removeModel`/`reconfigure`.
- `src/hooks.js` — React hooks (`useStoreState`, `useStoreActions`, etc.) using `useSyncExternalStoreWithSelector`.
- `src/helpers.js` — Public model definition API (`action`, `thunk`, `computed`, `effectOn`, `persist`, `reducer`, `debug`, `generic`).
- `src/extract-data-from-model.js` — Recursive model traversal; builds action/thunk/listener/effect metadata and lookup maps.
- `src/computed-properties.js` — Lazy evaluation via `Object.defineProperty` getters with memoization (`fast-deep-equal`).
- `src/persistence.js` — Async/sync storage adapters, transformation pipeline, migration support.
- `src/lib.js` — Internal utilities (`get`, `set`, `clone`, `createSimpleProduce` wrapping Immer with `autoFreeze: false`).

### Type definitions

All TypeScript types live in the root `index.d.ts` (not generated — hand-maintained). Uses `ts-toolbelt` for advanced type manipulation. Type tests are in `tests/typescript/` and run via `tsc --noEmit`.

## Conventions

- Node >= 18 (`.nvmrc` specifies 18), Yarn for package management
- Babel transpiles source (classic JSX transform); no TypeScript compiler for source code
- Tests use `@testing-library/react` and Vitest with jsdom
- ESLint 9 flat config (`eslint.config.js`) with prettier
- Husky pre-commit hooks run lint and tests
- Immer configured with `autoFreeze: false` for mixed mutability
