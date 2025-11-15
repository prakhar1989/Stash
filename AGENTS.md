# Repository Guidelines

## Project Structure & Module Organization

`/app` holds Next.js routes and server actions; colocate UI logic with route segments and keep shared layouts in `app/(site)/layout.tsx`. Store reusable UI primitives in `/components`, and domain helpers (auth, data fetching, feature flags) inside `/lib`. Database schema, migrations, and Drizzle snapshots stay in `/drizzle`; run migrations before shipping schema changes. Static assets and screenshots belong in `/images`.

## Build, Test, and Development Commands

- `npm run dev` — start the Next.js dev server with hot reload; ensure `.env.local` is ready first.
- `npm run build` — create an optimized production bundle and run type checks.
- `npm run start` — serve the production build locally for smoke tests.
- `npm run drizzle:generate` / `npm run drizzle:migrate` — generate and apply schema migrations; rerun whenever models in `/drizzle` or `/lib/db` change.
- `npm run lint` and `npm run format` — enforce ESLint + Prettier rules before pushing.

## Coding Style & Naming Conventions

1. Use `npm run format` to format code.
2. Use `npm run lint` to check for linting errors.

## Testing Guidelines

Component and hook tests should use Vitest plus Testing Library; import `@testing-library/jest-dom` for matchers. Snapshot only leaf components. Name spec files `*.test.ts(x)` and colocate next to the unit under test. Execute suites with `npx vitest run --coverage` until a script alias is added. Cover auth flows, database utilities, and UI states touched by the PR.

## Commit & Pull Request Guidelines

Commits follow the repo’s initial imperative-mood style (`first commit`); keep them scoped and reference domain areas, e.g., `Add todo filters` or `Fix drizzle migration`. Each PR must include a change summary, screenshots for UI work (`/images` is a handy drop zone), manual test notes, and links to related issues. Confirm migrations were generated/applied and mention any new env vars in the PR description.

## Environment & Configuration

Copy the Neon Auth secrets (`NEXT_PUBLIC_STACK_PROJECT_ID`, etc.) into `.env.local`; never commit this file. For new contributors, document extra secrets inside `README.md` and reference Neon Console instructions. Rotate keys if they appear in logs or PR discussions.
