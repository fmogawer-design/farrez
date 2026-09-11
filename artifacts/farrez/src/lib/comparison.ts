export type VendorQuote = {
  id: number;
  vendorName: string;
  quotedPrice: string;
  additionalFees: string;
  deliveryTime: string;
  paymentTerms: string;
};

export type QuoteResult = VendorQuote & {
  totalCost: number;
  isRecommended: boolean;
  isLowestCost: boolean;
  isFastestDelivery: boolean;
};

const parseRequiredNumber = (value: string) => {
  if (value.trim() === '') return Number.NaN;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

export const isCompleteQuote = (quote: VendorQuote) =>
  quote.vendorName.trim() !== '' &&
  quote.paymentTerms.trim() !== '' &&
  !Number.isNaN(parseRequiredNumber(quote.quotedPrice)) &&
  !Number.isNaN(parseRequiredNumber(quote.additionalFees)) &&
  !Number.isNaN(parseRequiredNumber(quote.deliveryTime));

export function compareVendorQuotes(vendors: VendorQuote[]): QuoteResult[] {
  if (vendors.length < 2 || vendors.length > 3) {
    throw new Error('Farrez requires two or three vendor quotations.');
  }

  if (vendors.some((vendor) => !isCompleteQuote(vendor))) {
    throw new Error('Complete every field for each vendor before comparing.');
  }

  const calculated = vendors.map((vendor) => ({
    ...vendor,
    totalCost:
      parseRequiredNumber(vendor.quotedPrice) +
      parseRequiredNumber(vendor.additionalFees),
    isRecommended: false,
    isLowestCost: false,
    isFastestDelivery: false,
  }));

  const winner = calculated.reduce((best, vendor) => {
    if (vendor.totalCost < best.totalCost) return vendor;
    if (
      vendor.totalCost === best.totalCost &&
      parseRequiredNumber(vendor.deliveryTime) <
        parseRequiredNumber(best.deliveryTime)
    ) {
      return vendor;
    }
    return best;
  });

  const lowestCost = Math.min(
    ...calculated.map((vendor) => vendor.totalCost),
  );
  const fastestDelivery = Math.min(
    ...calculated.map((vendor) =>
      parseRequiredNumber(vendor.deliveryTime),
    ),
  );

  return calculated.map((vendor) => ({
    ...vendor,
    isRecommended: vendor.id === winner.id,
    isLowestCost: vendor.totalCost === lowestCost,
    isFastestDelivery:
      parseRequiredNumber(vendor.deliveryTime) === fastestDelivery,
  }));
}