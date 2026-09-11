import { Router, type IRouter, type Request } from "express";
import {
  CreateBillingCheckoutResponse,
  GetBillingCheckoutSessionQueryParams,
  GetBillingCheckoutSessionResponse,
  GetBillingPlanResponse,
} from "@workspace/api-zod";
import { getFarrezProPlan } from "../stripe/billing-storage";
import { getUncachableStripeClient } from "../stripe/stripe-client";

const router: IRouter = Router();

function appOrigin(req: Request): string {
  const domain = process.env["REPLIT_DOMAINS"]?.split(",")[0];
  if (domain) {
    return `https://${domain}`;
  }
  return `${req.protocol}://${req.get("host")}`;
}

router.get("/billing/plan", async (_req, res): Promise<void> => {
  const plan = await getFarrezProPlan();
  if (!plan) {
    res.status(404).json({ error: "Farrez Pro plan not found." });
    return;
  }

  res.json(GetBillingPlanResponse.parse(plan));
});

router.post("/billing/checkout", async (req, res): Promise<void> => {
  const plan = await getFarrezProPlan();
  if (!plan) {
    res.status(404).json({ error: "Farrez Pro plan not found." });
    return;
  }

  const stripe = await getUncachableStripeClient();
  const origin = appOrigin(req);
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${origin}/pro?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pro?checkout=cancelled`,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    metadata: { farrez_plan: "pro" },
    subscription_data: {
      metadata: { farrez_plan: "pro" },
    },
  });

  if (!session.url) {
    throw new Error("Stripe did not return a Checkout URL.");
  }

  res.status(201).json(
    CreateBillingCheckoutResponse.parse({ url: session.url }),
  );
});

router.get(
  "/billing/checkout-session",
  async (req, res): Promise<void> => {
    const parsed = GetBillingCheckoutSessionQueryParams.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid Checkout Session identifier." });
      return;
    }

    const stripe = await getUncachableStripeClient();
    const session = await stripe.checkout.sessions.retrieve(
      parsed.data.sessionId,
      { expand: ["subscription"] },
    );
    const subscriptionStatus =
      session.subscription && typeof session.subscription !== "string"
        ? session.subscription.status
        : null;

    res.json(
      GetBillingCheckoutSessionResponse.parse({
        status: session.status,
        paymentStatus: session.payment_status,
        subscriptionStatus,
      }),
    );
  },
);

export default router;