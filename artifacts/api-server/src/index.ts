import app from "./app";
import { logger } from "./lib/logger";
import { connectMongoDB } from "./lib/mongodb";

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

async function initialize(): Promise<void> {
  // Connect to MongoDB
  await connectMongoDB();
  logger.info("MongoDB connected");

  // Verify Stripe credentials are available (fail fast)
  const stripeKey = process.env["STRIPE_SECRET_KEY"];
  if (!stripeKey) {
    logger.warn("STRIPE_SECRET_KEY is not set — Stripe features will fail");
  } else {
    logger.info("Stripe credentials available");
  }
}

await initialize();

app.listen(port, () => {
  logger.info({ port }, "Server listening");
});
