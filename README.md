# farrez

Farrez compares two or three vendor quotations and recommends the lowest-total-cost option, using faster delivery as the tie-breaker.

## Overview

Farrez simplifies vendor procurement and comparison by calculating total landing cost, factoring in delivery speed, and presenting clear comparison insights.

### Key Features
- **Vendor Quotation Comparison**: Compare 2 or 3 vendor quotes side-by-side.
- **Intelligent Recommendations**: Evaluates lowest total cost and uses delivery lead time as a tie-breaker.
- **Vendor Management**: Create, update, archive, and inspect vendor profiles and historical performance.
- **Historical Analysis**: Review supplier price, lead time, and outcome trends.
- **Report Export**: Export vendor comparison decision reports to CSV.
- **Theme Support**: Dark, light, and system theme preferences.
- **Farrez Pro**: Stripe Checkout subscription integration.

## Tech Stack

- **Monorepo**: pnpm workspaces, Node.js, TypeScript
- **Frontend**: React + Vite with TanStack Query and generated OpenAPI hooks
- **Backend API**: Express 5 on Node.js
- **Database**: MongoDB via Mongoose
- **Billing**: Stripe Checkout and PostgreSQL sync (`stripe-replit-sync`)

## Project Structure

```
├── artifacts/
│   ├── api-server/    # Express API server & MongoDB models
│   └── farrez/        # React + Vite frontend application
├── lib/
│   ├── api-spec/      # OpenAPI specification and contract
│   ├── api-zod/       # Generated TypeScript types and Zod schemas
│   └── db/            # Database configurations and schemas
└── scripts/           # Automation scripts (Stripe seeding, etc.)
```

## Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- pnpm (`npm install -g pnpm`)
- MongoDB instance (local or MongoDB Atlas)

### Installation

```bash
pnpm install
```

### Running Locally

Run the Express API server:
```bash
pnpm --filter @workspace/api-server run dev
```

Run the frontend application:
```bash
pnpm --filter @workspace/farrez run dev
```

### Building and Typechecking

```bash
pnpm run typecheck
pnpm run build
```
