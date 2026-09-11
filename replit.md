# Farrez

Farrez compares two or three vendor quotations and recommends the lowest-total-cost option, using faster delivery as the tie-breaker.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the Express API server
- `pnpm --filter @workspace/farrez run dev` — run the Farrez frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite with TanStack Query and generated API hooks
- API: Express 5 on Node.js
- Database: MongoDB through Mongoose

## Where things live

- `artifacts/farrez/src/App.tsx` — Farrez screens and editable vendor flow
- `artifacts/farrez/src/lib/comparison.ts` — client-side quotation validation and result types
- `artifacts/farrez/src/index.css` — Stitch-derived theme and responsive styling
- `artifacts/farrez/.stitch-reference/` — supplied Stitch screenshots, HTML exports, and design tokens
- `artifacts/api-server/src/routes/comparisons.ts` — comparison persistence and retrieval endpoints
- `artifacts/api-server/src/models/comparison.ts` — MongoDB comparison model
- `artifacts/api-server/src/lib/compare-vendors.ts` — server-owned recommendation rules
- `lib/api-spec/openapi.yaml` — Farrez API contract

## Architecture decisions

- Comparisons are calculated by the Express API and persisted in MongoDB.
- The frontend uses the generated API client rather than duplicating network request code.
- Recommendation order is total cost first, then faster delivery for equal totals.
- The Compare and Results views follow the supplied Google Stitch exports rather than a custom reinterpretation.

## Product

- Enter and edit two or three vendor quotations.
- Calculate total cost from quoted price plus additional fees.
- Compare cost, fees, delivery, and payment terms.
- Show lowest cost, fastest delivery, and the recommended vendor.

## User preferences

- Preserve the supplied Stitch visual design exactly unless explicitly asked to redesign it.
- Keep MongoDB persistence limited to quotation comparisons unless explicitly asked to add history features.
- Do not add authentication, payments, uploads, supplier history, or unrelated features in the core release.

## Gotchas

- Keep the comparison algorithm server-owned and independent from presentation changes.
- `MONGODB_URI` must be configured as a Replit secret, and Atlas Network Access must allow the running Replit environment.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
