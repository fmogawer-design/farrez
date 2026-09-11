import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

export type FarrezPlan = {
  productId: string;
  priceId: string;
  name: string;
  description: string;
  unitAmount: number;
  currency: string;
  interval: "month";
};

type PlanRow = {
  product_id: string;
  price_id: string;
  product_name: string;
  product_description: string | null;
  unit_amount: number;
  currency: string;
  recurring: { interval?: string } | string | null;
};

function recurringInterval(value: PlanRow["recurring"]): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") {
    try {
      return (JSON.parse(value) as { interval?: string }).interval;
    } catch {
      return undefined;
    }
  }
  return value.interval;
}

export async function getFarrezProPlan(): Promise<FarrezPlan | null> {
  const result = await db.execute(sql`
    SELECT
      p.id AS product_id,
      p.name AS product_name,
      p.description AS product_description,
      pr.id AS price_id,
      pr.unit_amount,
      pr.currency,
      pr.recurring
    FROM stripe.products p
    INNER JOIN stripe.prices pr ON pr.product = p.id
    WHERE p.active = true
      AND pr.active = true
      AND p.metadata->>'farrez_plan' = 'pro'
      AND pr.currency = 'aed'
    LIMIT 1
  `);

  const row = result.rows[0] as PlanRow | undefined;
  if (!row || recurringInterval(row.recurring) !== "month") {
    return null;
  }

  return {
    productId: row.product_id,
    priceId: row.price_id,
    name: row.product_name,
    description: row.product_description ?? "",
    unitAmount: Number(row.unit_amount),
    currency: row.currency,
    interval: "month",
  };
}