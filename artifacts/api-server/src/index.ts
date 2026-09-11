import app from "./app";
import { logger } from "./lib/logger";
import { runMigrations } from "stripe-replit-sync";
import { getStripeSync } from "./stripe/stripe-client";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function initializeStripe(): Promise<void> {
  const databaseUrl = process.env["DATABASE_URL"];
  const domains = process.env["REPLIT_DOMAINS"];
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for Stripe synchronization.");
  }
  if (!domains) {
    throw new Error("REPLIT_DOMAINS is required for Stripe webhooks.");
  }

  await runMigrations({ databaseUrl });
  const stripeSync = await getStripeSync();
  const webhookUrl = `https://${domains.split(",")[0]}/api/stripe/webhook`;
  await stripeSync.findOrCreateManagedWebhook(webhookUrl, {
    enabled_events: ["*"],
  });
  await stripeSync.syncBackfill();
  logger.info("Stripe synchronization initialized");
}

await initializeStripe();

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
