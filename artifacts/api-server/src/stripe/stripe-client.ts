import Stripe from "stripe";

/**
 * Returns the Stripe secret key from environment variables.
 * On Render, set STRIPE_SECRET_KEY in the Environment Variables section.
 */
function getStripeSecretKey(): string {
  const secretKey = process.env["STRIPE_SECRET_KEY"];
  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY environment variable is required. " +
        "Set it in your Render dashboard under Environment Variables.",
    );
  }
  return secretKey;
}

/**
 * Returns the Stripe webhook signing secret from environment variables.
 * On Render, set STRIPE_WEBHOOK_SECRET after creating a webhook endpoint
 * in the Stripe Dashboard pointing to https://your-render-url.onrender.com/api/stripe/webhook
 */
export function getStripeWebhookSecret(): string {
  const webhookSecret = process.env["STRIPE_WEBHOOK_SECRET"];
  if (!webhookSecret) {
    throw new Error(
      "STRIPE_WEBHOOK_SECRET environment variable is required. " +
        "Create a webhook in your Stripe Dashboard and set the signing secret.",
    );
  }
  return webhookSecret;
}

/**
 * Creates a fresh Stripe client (not cached) for operations where
 * you always want the latest credentials.
 */
export function getUncachableStripeClient(): Stripe {
  return new Stripe(getStripeSecretKey());
}

/**
 * Creates a cached Stripe client for general use.
 */
let _cachedClient: Stripe | null = null;
export function getStripeClient(): Stripe {
  if (!_cachedClient) {
    _cachedClient = new Stripe(getStripeSecretKey());
  }
  return _cachedClient;
}