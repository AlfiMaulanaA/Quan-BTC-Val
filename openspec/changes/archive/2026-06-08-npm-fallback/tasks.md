## 1. Backend Node.js Fallback

- [x] 1.1 Install `@hono/node-server` (and `tsx` if not present) as dependencies in the `/backend` directory.
- [x] 1.2 Create `src/index.node.ts` in `/backend` that imports the core Hono app (e.g., from `app.ts`) and serves it using `@hono/node-server`.
- [x] 1.3 Add `"dev:node": "tsx watch src/index.node.ts"` and `"start:node": "tsx src/index.node.ts"` to `/backend/package.json`.
- [x] 1.4 Write unit tests in `/backend` to ensure endpoints respond correctly when the app is initialized with the Node adapter.
- [x] 1.5 Manual user validation: Start the backend using `npm run dev:node` and manually verify the API responds.

## 2. Frontend NPM Compatibility

- [x] 2.1 Verify and update `/frontend/package.json` scripts to ensure they work natively via `npm run` (e.g., `npm run dev`, `npm run build`).
- [x] 2.2 Add basic tests in `/frontend` to verify the application renders and builds correctly, ensuring no bun-exclusive syntax breaks standard Node tools.
- [x] 2.3 Manual user validation: Start the frontend using `npm run dev` and build using `npm run build` to confirm everything works without Bun.

## 3. Root Workspace & Documentation

- [x] 3.1 Review root `package.json` and ensure any workspace-level scripts can gracefully run with `npm`. (Note: no root package.json exists, updated run.sh instead).
- [x] 3.2 Update `README.md` to document the fallback commands (e.g., how to use `npm install` and `npm run dev:node` instead of Bun).
- [x] 3.3 Manual user validation: Run `npm install` from the project root in a clean environment to ensure dependencies resolve correctly.

## 4. Verification

- [x] 4.1 Auto-verification: 1. Read all artifacts (proposal, design, specs, tasks) to ensure zero gaps. 2. Verify every SHALL/MUST requirement against the code. 3. Launch the Hono server locally using Node and run E2E verification with `curl`. 4. Spawn parallel reviewer subagents to audit the implementation for correctness, conventions, and style consistency.
