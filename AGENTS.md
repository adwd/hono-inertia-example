# Repository Guidelines

## Project Structure & Module Organization

This is a TypeScript ESM app using Hono, Inertia, React, and Vite. Server-side routes and in-memory sample data live in `app/`, with the Hono entry point at `app/server.ts`. Inertia page components are under `app/pages/`; shared page chrome is in `app/pages/Layout.tsx`, and post pages are grouped in `app/pages/Posts/`. Client bootstrapping and global styles live in `src/client.tsx`, `src/renderer.tsx`, and `src/style.css`. Static assets belong in `public/`.

## Build, Test, and Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: start the Vite dev server with the Hono server adapter.
- `npm run build`: build the client bundle, then build the server bundle into `dist/`.
- `npm run start`: run the built server from `dist/index.js`.
- `npm run preview`: build and start the production bundle in one command.

Run `npm run build` before handing off changes that affect routing, rendering, or TypeScript types.

## Coding Style & Naming Conventions

Use TypeScript with `strict` mode. Keep modules ESM-compatible and use extensionless imports as shown in the existing code. Follow the current style: two-space indentation, single quotes, no semicolons, and concise React function components. Name React page components in PascalCase, such as `Home.tsx` or `Posts/Show.tsx`. Keep route/data helpers close to the server code in `app/`, and keep browser-only code in `src/`.

## Testing Guidelines

No test framework or test script is currently configured. For now, validate changes with `npm run build` and, when behavior changes, manual checks through `npm run dev`. If adding tests, add an explicit `npm test` script and place tests near the code they cover using a clear pattern such as `*.test.ts` or `*.test.tsx`.

## Commit & Pull Request Guidelines

Recent commits use short, imperative summaries, including Japanese descriptions, for example `404ページを追加` and `Migrate app to Node server`. Keep commit subjects brief and focused on one change. Pull requests should include a short description, the commands run for verification, and screenshots or screen recordings for visible UI changes. Link related issues when available and mention any fixture changes when applicable.

## Security & Configuration Tips

Do not commit secrets or local environment files. Treat `public/` as fully exposed static content. Keep generated build output in `dist/` out of source control unless the project explicitly changes that policy.
