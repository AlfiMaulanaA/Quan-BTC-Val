## Context

The BTC Cycle Valuation System relies heavily on the `bun` runtime and package manager for its JS/TS components, specifically the Vite frontend and Hono backend (using `Bun.serve`). In some environments, `bun` is unavailable, leaving `npm` and standard Node.js as the only options. We need to implement a fallback mechanism so the project can be run natively on Node.js using `npm` without losing `bun` as the primary workflow.

## Goals / Non-Goals

**Goals:**
- Enable installing JS/TS dependencies using `npm install`.
- Enable running and building the frontend via standard `npm` commands (`npm run dev`, `npm run build`).
- Enable running the Hono backend on a standard Node.js server.
- Keep the `bun` workflow as the primary, documented standard.

**Non-Goals:**
- Replacing `bun` entirely with `npm`.
- Rewriting core project logic just to avoid modern features; we will use adapters where necessary.

## Decisions

**1. Hono Node Server Adapter**
- *Decision:* Use `@hono/node-server` to serve the backend when running under standard Node.js.
- *Rationale:* Hono runs natively on Bun via `Bun.serve`. To support Node.js without duplicating app logic, we can keep the core application in a shared file (e.g., `app.ts`) and create a conditional or separate entry point for Node.js (e.g., `index.node.ts`) that uses `serve` from `@hono/node-server`.

**2. Package.json Script Adjustments**
- *Decision:* Maintain generic script names (`dev`, `build`, `start`) that work with both `bun run` and `npm run`, while adding explicit Node fallbacks if needed.
- *Rationale:* Scripts like `"dev": "vite"` work identically with both package managers. If the backend needs a specific Node runner, we might add `"dev:node": "tsx src/index.node.ts"` or similar, to clearly delineate the fallback.

**3. File System API Agnosticism**
- *Decision:* Avoid using Bun-specific APIs like `Bun.file()` and `Bun.write()` if standard Node `fs` / `fs/promises` provides equivalent functionality efficiently.
- *Rationale:* This reduces the amount of conditional code needed across the application.

## Risks / Trade-offs

- **Risk:** Node.js and Bun might have different performance characteristics or minor compatibility quirks in standard library polyfills.
  - *Mitigation:* The primary deployment target remains Bun; the Node.js fallback is explicitly for environments where Bun isn't feasible. Tests should ensure basic compatibility.
- **Risk:** Maintaining dual server entry points.
  - *Mitigation:* The actual route definitions and middleware will remain completely framework/runtime agnostic within Hono. Only the final `serve(...)` call will differ.
