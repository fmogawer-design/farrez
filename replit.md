# Farrez

Farrez compares two or three vendor quotations and recommends the lowest-total-cost option, using faster delivery as the tie-breaker.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/farrez run dev` — run the Farrez frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, client-side state only
- API: Express 5

## Where things live

- `artifacts/farrez/src/App.tsx` — Farrez screens and editable vendor flow
- `artifacts/farrez/src/lib/comparison.ts` — quotation validation and recommendation rules
- `artifacts/farrez/src/index.css` — Stitch-derived theme and responsive styling
- `artifacts/farrez/.stitch-reference/` — supplied Stitch screenshots, HTML exports, and design tokens

## Architecture decisions

- The first release is frontend-only and stores comparison state in memory.
- Recommendation order is total cost first, then faster delivery for equal totals.
- The Compare and Results views follow the supplied Google Stitch exports rather than a custom reinterpretation.

## Product

- Enter and edit two or three vendor quotations.
- Calculate total cost from quoted price plus additional fees.
- Compare cost, fees, delivery, and payment terms.
- Show lowest cost, fastest delivery, and the recommended vendor.

## User preferences

- Preserve the supplied Stitch visual design exactly unless explicitly asked to redesign it.
- Do not add a database, authentication, payments, APIs, uploads, supplier history, or unrelated features in the core release.

## Gotchas

- Keep the comparison algorithm independent from presentation changes.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
