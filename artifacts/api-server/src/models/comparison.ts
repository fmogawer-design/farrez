import mongoose, { Schema, type Model } from "mongoose";

export type VendorResultRecord = {
  clientId: number;
  vendorId?: string;
  vendorName: string;
  quotedPrice: number;
  additionalFees: number;
  deliveryTime: number;
  paymentTerms: string;
  totalCost: number;
  isRecommended: boolean;
  isLowestCost: boolean;
  isFastestDelivery: boolean;
};

export type ComparisonRecord = {
  vendors: VendorResultRecord[];
  createdAt: Date;
  updatedAt: Date;
};

const vendorResultSchema = new Schema(
  {
    clientId: { type: Number, required: true },
    vendorId: { type: String, required: false, index: true },
    vendorName: { type: String, required: true, trim: true },
    quotedPrice: { type: Number, required: true, min: 0 },
    additionalFees: { type: Number, required: true, min: 0 },
    deliveryTime: { type: Number, required: true, min: 0 },
    paymentTerms: { type: String, required: true, trim: true },
    totalCost: { type: Number, required: true, min: 0 },
    isRecommended: { type: Boolean, required: true },
    isLowestCost: { type: Boolean, required: true },
    isFastestDelivery: { type: Boolean, required: true },
  },
  { _id: false },
);

const comparisonSchema = new Schema(
  {
    vendors: {
      type: [vendorResultSchema],
      required: true,
      validate: {
        validator: (vendors: unknown[]) =>
          vendors.length >= 2 && vendors.length <= 3,
        message: "A comparison must contain two or three vendors.",
      },
    },
  },
  { timestamps: true },
);

comparisonSchema.index({ "vendors.vendorId": 1, createdAt: -1 });

export const ComparisonModel: Model<ComparisonRecord> =
  (mongoose.models["Comparison"] as Model<ComparisonRecord> | undefined) ??
  mongoose.model<ComparisonRecord>("Comparison", comparisonSchema);