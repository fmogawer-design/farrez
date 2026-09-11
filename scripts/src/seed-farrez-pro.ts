import { getUncachableStripeClient } from "./stripe-client";

const PLAN_KEY = "pro";
const UNIT_AMOUNT = 5_500;
const CURRENCY = "aed";

async function seedFarrezPro(): Promise<void> {
  const stripe = await getUncachableStripeClient();
  const products = await stripe.products.search({
    query: `metadata['farrez_plan']:'${PLAN_KEY}' AND active:'true'`,
  });

  const product =
    products.data[0] ??
    (await stripe.products.create({
      name: "Farrez Pro",
      description: "Unlimited vendor comparisons and full analysis access",
      metadata: { farrez_plan: PLAN_KEY },
    }));

  const prices = await stripe.prices.list({
    product: product.id,
    active: true,
    type: "recurring",
    limit: 100,
  });
  const matchingPrice = prices.data.find(
    (price) =>
      price.currency === CURRENCY &&
      price.unit_amount === UNIT_AMOUNT &&
      price.recurring?.interval === "month",
  );

  const price =
    matchingPrice ??
    (await stripe.prices.create({
      product: product.id,
      currency: CURRENCY,
      unit_amount: UNIT_AMOUNT,
      recurring: { interval: "month" },
      metadata: { farrez_plan: PLAN_KEY },
    }));

  console.log(
    `Farrez Pro ready: ${price.unit_amount} ${price.currency.toUpperCase()} per month.`,
  );
}

seedFarrezPro().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : "Unable to seed Farrez Pro.",
  );
  process.exit(1);
});