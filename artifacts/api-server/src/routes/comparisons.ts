import { Router, type IRouter } from "express";
import mongoose from "mongoose";
import {
  CreateComparisonBody,
  CreateComparisonResponse,
  GetComparisonParams,
  GetComparisonResponse,
  ListComparisonsQueryParams,
  ListComparisonsResponse,
} from "@workspace/api-zod";
import { compareVendors } from "../lib/compare-vendors";
import { connectMongoDB } from "../lib/mongodb";
import { ComparisonModel } from "../models/comparison";
import { VendorModel } from "../models/vendor";

const router: IRouter = Router();
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").trim().slice(0, 100);

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
  const linkedIds = parsed.data.vendors.map((v) => v.vendorId).filter((id): id is string => Boolean(id));
  if (linkedIds.some((id) => !mongoose.isValidObjectId(id))) {
    res.status(400).json({ error: "Invalid vendor identifier." }); return;
  }
  const persisted = await VendorModel.find({ _id: { $in: linkedIds }, status: "active" }).lean();
  if (persisted.length !== new Set(linkedIds).size) {
    res.status(404).json({ error: "One or more active vendors were not found." }); return;
  }
  const names = new Map(persisted.map((v) => [v._id.toString(), v.name]));
  const input = parsed.data.vendors.map((v) => v.vendorId ? { ...v, vendorName: names.get(v.vendorId)! } : v);
  const vendors = compareVendors(input);
  const comparison = await ComparisonModel.create({
    vendors: vendors.map(({ id, ...vendor }, index) => ({
      ...vendor,
      clientId: id,
      vendorId: input[index]?.vendorId,
    })),
  });

  res.status(201).json(
    CreateComparisonResponse.parse({
      id: comparison.id,
      vendors: vendors.map((v, index) => ({ ...v, vendorId: input[index]?.vendorId })),
      createdAt: comparison.createdAt.toISOString(),
    }),
  );
});

router.get("/comparisons", async (req, res): Promise<void> => {
  const query = ListComparisonsQueryParams.safeParse(req.query);
  if (!query.success) { res.status(400).json({ error: query.error.message }); return; }
  await connectMongoDB();
  const filter = query.data.search?.trim()
    ? { "vendors.vendorName": { $regex: escapeRegex(query.data.search), $options: "i" } } : {};
  const sortField = query.data.sort === "vendorName" ? "vendors.vendorName" : "createdAt";
  const comparisons = await ComparisonModel.find(filter).sort({ [sortField]: query.data.order === "asc" ? 1 : -1 }).limit(100).lean();
  res.json(ListComparisonsResponse.parse(comparisons.map((comparison) => ({
    id: comparison._id.toString(),
    vendors: comparison.vendors.map((vendor) => ({ id: vendor.clientId, vendorId: vendor.vendorId, vendorName: vendor.vendorName, quotedPrice: vendor.quotedPrice, additionalFees: vendor.additionalFees, deliveryTime: vendor.deliveryTime, paymentTerms: vendor.paymentTerms, totalCost: vendor.totalCost, isRecommended: vendor.isRecommended, isLowestCost: vendor.isLowestCost, isFastestDelivery: vendor.isFastestDelivery })),
    createdAt: comparison.createdAt.toISOString(),
  }))));
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
        vendorId: vendor.vendorId,
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