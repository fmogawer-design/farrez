---
name: Atlas TLS alert 80
description: How to interpret a misleading MongoDB Atlas TLS failure from Replit environments.
---

Treat `ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR` / SSL alert 80 from an Atlas shared cluster as a likely IP access-list rejection before changing application TLS settings.

**Why:** The error persisted before authentication even after a broad rule was reportedly enabled, then cleared immediately when the actual Replit development egress CIDR became Active in the correct Atlas project.

**How to apply:** Confirm the current environment's outbound IP is explicitly Active under Atlas Network Access for the project containing the target cluster. Replit egress addresses can differ between environments, so do not assume a developer's own IP or an unverified broad rule covers the app.