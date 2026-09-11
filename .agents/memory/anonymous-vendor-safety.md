---
name: Anonymous vendor safety
description: Data-safety boundaries for Farrez while it remains an unauthenticated class project.
---

While Farrez has no authentication, vendor records must remain app-wide, contain no personal contact fields, and use inactive/archive status instead of hard deletion.

**Why:** Public CRUD cannot safely protect personal contact information or prevent arbitrary destructive changes. Historical comparisons also depend on stable vendor records.

**How to apply:** Keep vendor fields limited to business identity and procurement metadata. Preserve quote snapshots and supplier history when a vendor is removed from active use. Revisit ownership and hard-delete permissions only if authentication is explicitly added.