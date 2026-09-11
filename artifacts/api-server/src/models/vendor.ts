import mongoose, { Schema, type Model } from "mongoose";

export type VendorRecord = {
  name: string;
  commercialLicense: string;
  category: string;
  status: "active" | "inactive";
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const vendorSchema = new Schema<VendorRecord>(
  {
    name: { type: String, required: true, trim: true },
    commercialLicense: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    notes: { type: String, default: null },
  },
  { timestamps: true },
);
vendorSchema.index({ name: 1 }, { unique: true });
vendorSchema.index({ commercialLicense: 1 }, { unique: true });
vendorSchema.index({ status: 1, name: 1 });

export const VendorModel: Model<VendorRecord> =
  (mongoose.models["Vendor"] as Model<VendorRecord> | undefined) ??
  mongoose.model<VendorRecord>("Vendor", vendorSchema);