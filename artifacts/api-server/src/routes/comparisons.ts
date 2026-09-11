import { Router, type IRouter } from "express";
import mongoose from "mongoose";
import {
  CreateComparisonBody,
  CreateComparisonResponse,
  GetComparisonParams,
  GetComparisonResponse,
} from "@workspace/api-zod";
import { compareVendors } from "../lib/compare-vendors";
import { connectMongoDB } from "../lib/mongodb";
import { ComparisonModel } from "../models/comparison";

const router: IRouter = Router();

router.post("/comparisons", async (req, res): Promise<void> => {
  const parsed = CreateComparisonBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn(
      { errors: parsed.error.message },
      "Invalid vendor comparison request",
    );
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await connectMongoDB();
  const vendors = compareVendors(parsed.data.vendors);
  const comparison = await ComparisonModel.create({
    vendors: vendors.map(({ id, ...vendor }) => ({
      ...vendor,
      clientId: id,
    })),
  });

  res.status(201).json(
    CreateComparisonResponse.parse({
      id: comparison.id,
      vendors,
      createdAt: comparison.createdAt.toISOString(),
    }),
  );
});

router.get("/comparisons/:id", async (req, res): Promise<void> => {
  const params = GetComparisonParams.safeParse(req.params);
  if (!params.success || !mongoose.isValidObjectId(params.data.id)) {
    res.status(400).json({ error: "Invalid comparison identifier." });
    return;
  }

  await connectMongoDB();
  const comparison = await ComparisonModel.findById(params.data.id).lean();
  if (!comparison) {
    res.status(404).json({ error: "Comparison not found." });
    return;
  }

  res.json(
    GetComparisonResponse.parse({
      id: comparison._id.toString(),
      vendors: comparison.vendors.map((vendor) => ({
        id: vendor.clientId,
        vendorName: vendor.vendorName,
        quotedPrice: vendor.quotedPrice,
        additionalFees: vendor.additionalFees,
        deliveryTime: vendor.deliveryTime,
        paymentTerms: vendor.paymentTerms,
        totalCost: vendor.totalCost,
        isRecommended: vendor.isRecommended,
        isLowestCost: vendor.isLowestCost,
        isFastestDelivery: vendor.isFastestDelivery,
      })),
      createdAt: comparison.createdAt.toISOString(),
    }),
  );
});

export default router;