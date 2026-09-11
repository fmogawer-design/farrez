---
name: Stripe sync migration assets
description: A packaging and bundling constraint for Stripe-owned PostgreSQL migrations.
---

Keep `stripe-replit-sync` external to the API server bundle so the library resolves its SQL migration directory from the installed package at runtime.

**Why:** Bundling the library embedded its JavaScript but omitted the migration assets, causing startup to continue with no Stripe tables and then fail when synchronization queried them. A published package release also omitted these assets entirely, while the compatible pinned release includes them.

**How to apply:** When changing the API bundler or upgrading the sync library, confirm the installed package contains its migration directory and verify that Stripe tables are created before managed webhook setup runs.