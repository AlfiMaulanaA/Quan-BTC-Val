## ADDED Requirements

### Requirement: Project installation fallback
The project MUST allow installing dependencies using standard `npm` in all relevant directories (root, `/frontend`, `/backend`) without forcing the user to install or use `bun`.

#### Scenario: Root workspace installation
- **WHEN** a developer runs `npm install` in the root directory
- **THEN** all dependencies defined in `package.json` are successfully installed

#### Scenario: Sub-package installation
- **WHEN** a developer runs `npm install` inside the `/frontend` or `/backend` directory
- **THEN** the dependencies for those specific components are successfully installed

### Requirement: Frontend scripts fallback
The frontend MUST support standard npm commands for running the Vite development server and creating production builds.

#### Scenario: Frontend dev server via npm
- **WHEN** a developer runs `npm run dev` in the `/frontend` directory
- **THEN** the Vite development server starts successfully and serves the app on `localhost`

#### Scenario: Frontend build via npm
- **WHEN** a developer runs `npm run build` in the `/frontend` directory
- **THEN** Vite compiles the application successfully and outputs static files to the `dist` directory

### Requirement: Backend runtime fallback adapter
The backend MUST provide a mechanism to run the Hono application natively on Node.js using `@hono/node-server` when `Bun.serve` is unavailable.

#### Scenario: Backend dev server via Node.js
- **WHEN** a developer runs the Node.js specific script (e.g., `npm run dev:node`) in the `/backend` directory
- **THEN** the Hono backend initializes using `@hono/node-server` and correctly serves the API endpoints on the designated port

#### Scenario: Graceful degradation of Bun specifics
- **WHEN** the backend runs via Node.js
- **THEN** it MUST gracefully handle or avoid calls to strictly Bun-only APIs (like `Bun.file()`), using standard Node `fs` equivalents where necessary
