import { Router, type IRouter } from "express";
import mongoose from "mongoose";
import {
  CreateVendorBody, CreateVendorResponse, DeleteVendorResponse, GetVendorResponse,
  ListVendorsQueryParams, ListVendorsResponse, UpdateVendorBody, UpdateVendorResponse,
} from "@workspace/api-zod";
import { connectMongoDB } from "../lib/mongodb";
import { VendorModel } from "../models/vendor";
import { ComparisonModel } from "../models/comparison";

const router: IRouter = Router();
const serialize = (v: any) => ({ id: v._id.toString(), name: v.name, commercialLicense: v.commercialLicense, category: v.category, status: v.status, notes: v.notes ?? null, createdAt: v.createdAt.toISOString(), updatedAt: v.updatedAt.toISOString() });
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").trim().slice(0, 100);

router.get("/vendors", async (req, res): Promise<void> => {
  const q = ListVendorsQueryParams.safeParse(req.query);
  if (!q.success) { res.status(400).json({ error: q.error.message }); return; }
  await connectMongoDB();
  const filter: Record<string, unknown> = {};
  if (q.data.search?.trim()) { const search = escapeRegex(q.data.search); filter.$or = [{ name: { $regex: search, $options: "i" } }, { commercialLicense: { $regex: search, $options: "i" } }, { category: { $regex: search, $options: "i" } }]; }
  if (q.data.status) filter.status = q.data.status;
  const field = q.data.sort === "updatedAt" ? "updatedAt" : q.data.sort === "createdAt" ? "createdAt" : "name";
  const rows = await VendorModel.find(filter).sort({ [field]: q.data.order === "desc" ? -1 : 1 }).limit(100).lean();
  res.json(ListVendorsResponse.parse(rows.map(serialize)));
});

router.post("/vendors", async (req, res): Promise<void> => {
  const parsed = CreateVendorBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  await connectMongoDB();
  try { const v = await VendorModel.create(parsed.data); res.status(201).json(CreateVendorResponse.parse(serialize(v))); }
  catch (e: any) { if (e?.code === 11000) res.status(409).json({ error: "Vendor name already exists." }); else throw e; }
});

async function insights(id: string) {
  const rows = await ComparisonModel.find({ "vendors.vendorId": id }).sort({ createdAt: -1 }).lean();
  const quotes = rows.flatMap((c) => c.vendors.filter((v) => v.vendorId === id).map((v) => ({ comparisonId: c._id.toString(), date: c.createdAt.toISOString(), quotedPrice: v.quotedPrice, totalCost: v.totalCost, deliveryDays: v.deliveryTime, outcome: v.isRecommended ? "recommended" : "notRecommended" as const })));
  const count = quotes.length, recommended = quotes.filter((q) => q.outcome === "recommended").length;
  const avg = (key: "quotedPrice" | "totalCost" | "deliveryDays") => count ? quotes.reduce((s, q) => s + q[key], 0) / count : 0;
  const latest = quotes[0], previous = quotes[1];
  return { comparisonCount: count, recommendationCount: recommended, recommendationRate: count ? recommended / count : 0, averageQuotedPrice: avg("quotedPrice"), averageTotalCost: avg("totalCost"), averageDeliveryDays: avg("deliveryDays"), latestQuote: latest ?? null, previousQuotes: quotes.slice(1), pricePercentageChange: previous && latest && previous.quotedPrice !== 0 ? ((latest.quotedPrice - previous.quotedPrice) / previous.quotedPrice) * 100 : null, totalCostPercentageChange: previous && latest && previous.totalCost !== 0 ? ((latest.totalCost - previous.totalCost) / previous.totalCost) * 100 : null };
}

router.get("/vendors/:id", async (req, res): Promise<void> => {
  if (!mongoose.isValidObjectId(req.params.id)) { res.status(400).json({ error: "Invalid vendor identifier." }); return; }
  await connectMongoDB(); const v = await VendorModel.findById(req.params.id).lean();
  if (!v) { res.status(404).json({ error: "Vendor not found." }); return; }
  res.json(GetVendorResponse.parse({ ...serialize(v), insights: await insights(req.params.id) }));
});

router.patch("/vendors/:id", async (req, res): Promise<void> => {
  const parsed = UpdateVendorBody.safeParse(req.body);
  if (!mongoose.isValidObjectId(req.params.id) || !parsed.success) { res.status(400).json({ error: parsed.success ? "Invalid vendor identifier." : parsed.error.message }); return; }
  await connectMongoDB();
  try { const v = await VendorModel.findByIdAndUpdate(req.params.id, parsed.data, { new: true, runValidators: true }).lean(); if (!v) { res.status(404).json({ error: "Vendor not found." }); return; } res.json(UpdateVendorResponse.parse(serialize(v))); }
  catch (e: any) { if (e?.code === 11000) res.status(409).json({ error: "Vendor name already exists." }); else throw e; }
});

router.delete("/vendors/:id", async (req, res): Promise<void> => {
  if (!mongoose.isValidObjectId(req.params.id)) { res.status(400).json({ error: "Invalid vendor identifier." }); return; }
  await connectMongoDB(); const result = await VendorModel.findByIdAndUpdate(req.params.id, { status: "inactive" }, { new: true });
  if (!result) { res.status(404).json({ error: "Vendor not found." }); return; }
  res.json(DeleteVendorResponse.parse({ id: req.params.id, deleted: true }));
});
export default router;