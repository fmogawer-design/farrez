import { getUncachableStripeClient } from "./stripe-client";

export type FarrezPlan = {
  productId: string;
  priceId: string;
  name: string;
  description: string;
  unitAmount: number;
  currency: string;
  interval: "month";
};

export async function getFarrezProPlan(): Promise<FarrezPlan | null> {
  const stripe = await getUncachableStripeClient();
  
  // Find the product with metadata farrez_plan: pro
  const products = await stripe.products.search({
    query: `active:'true' AND metadata['farrez_plan']:'pro'`,
    limit: 1,
  });

  if (products.data.length === 0) {
    return null;
  }

  const product = products.data[0];

  // Find the active AED price for this product
  const prices = await stripe.prices.list({
    product: product.id,
    active: true,
    currency: "aed",
    limit: 1,
  });

  if (prices.data.length === 0) {
    return null;
  }

  const price = prices.data[0];
  const interval = price.recurring?.interval;

  if (interval !== "month") {
    return null;
  }

  return {
    productId: product.id,
    priceId: price.id,
    name: product.name,
    description: product.description ?? "",
    unitAmount: price.unit_amount ?? 0,
    currency: price.currency,
    interval: "month",
  };
}