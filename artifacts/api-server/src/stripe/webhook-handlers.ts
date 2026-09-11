import { getUncachableStripeClient, getStripeWebhookSecret } from "./stripe-client";
import { logger } from "../lib/logger";

export class WebhookHandlers {
  static async processWebhook(
    payload: Buffer,
    signature: string,
  ): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error("Stripe webhook payload must be a Buffer.");
    }

    const stripe = getUncachableStripeClient();
    const webhookSecret = getStripeWebhookSecret();

    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );

    // Handle relevant Stripe events
    switch (event.type) {
      case "checkout.session.completed":
        logger.info(
          { sessionId: event.data.object.id },
          "Checkout session completed",
        );
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        logger.info(
          { subscriptionId: event.data.object.id, status: event.data.object.status },
          `Subscription ${event.type}`,
        );
        break;

      case "invoice.paid":
      case "invoice.payment_failed":
        logger.info(
          { invoiceId: event.data.object.id },
          `Invoice ${event.type}`,
        );
        break;

      default:
        logger.debug({ type: event.type }, "Unhandled Stripe event");
    }
  }
}