## Why

The project currently relies exclusively on `bun` as the JS/TS package manager and runtime. However, in some environments or devices, `bun` may not be available or supported, and only `npm` and standard `node` are present. This change provides fallback mechanisms to ensure the project can still be installed, run, and built using `npm` if `bun` is unavailable, improving accessibility for contributors and deployment environments without sacrificing `bun` as the primary/preferred option.

## What Changes

- Update `package.json` to ensure scripts can be run via `npm run`.
- If the backend uses Hono's Bun-specific APIs or server (`Bun.serve`), add an alternative entry point or adapter (e.g., `@hono/node-server`) for standard Node.js.
- Provide documentation on how to run the project using `npm` instead of `bun`.

## Capabilities

### New Capabilities
- `npm-fallback`: Provides the ability to install dependencies and run the development environment using `npm` and standard Node.js.

### Modified Capabilities

## Impact

- **Affected Code**: `package.json` in both `/frontend` and `/backend`, and backend entry points (to support standard Node.js).
- **Dependencies**: May need to install `@hono/node-server` for the backend if it currently relies exclusively on `Bun.serve`.
- **UX**: Development workflow is smoother for environments without `bun`.
