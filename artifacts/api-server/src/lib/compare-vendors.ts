type VendorInput = {
  id: number;
  vendorName: string;
  quotedPrice: number;
  additionalFees: number;
  deliveryTime: number;
  paymentTerms: string;
};

export type VendorResult = VendorInput & {
  totalCost: number;
  isRecommended: boolean;
  isLowestCost: boolean;
  isFastestDelivery: boolean;
};

export function compareVendors(vendors: VendorInput[]): VendorResult[] {
  const calculated = vendors.map((vendor) => ({
    ...vendor,
    totalCost: vendor.quotedPrice + vendor.additionalFees,
    isRecommended: false,
    isLowestCost: false,
    isFastestDelivery: false,
  }));

  const winner = calculated.reduce((best, vendor) => {
    if (vendor.totalCost < best.totalCost) return vendor;
    if (
      vendor.totalCost === best.totalCost &&
      vendor.deliveryTime < best.deliveryTime
    ) {
      return vendor;
    }
    return best;
  });

  const lowestCost = Math.min(...calculated.map((vendor) => vendor.totalCost));
  const fastestDelivery = Math.min(
    ...calculated.map((vendor) => vendor.deliveryTime),
  );

  return calculated.map((vendor) => ({
    ...vendor,
    isRecommended: vendor.id === winner.id,
    isLowestCost: vendor.totalCost === lowestCost,
    isFastestDelivery: vendor.deliveryTime === fastestDelivery,
  }));
}