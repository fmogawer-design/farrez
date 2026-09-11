import { type FormEvent, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  BarChart2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  LineChart,
  Lock,
  Network,
  Package,
  Plus,
  Store,
  ThumbsUp,
  Trash2,
  Truck,
  Zap,
  Info,
  Search,
  BookOpen,
} from "lucide-react";
import { useLocation } from "wouter";
import { useCreateComparison, useListVendors } from "@workspace/api-client-react";
import {
  isCompleteQuote,
  type VendorQuote,
} from "@/lib/comparison";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";

const emptyQuote = (id: number): VendorQuote => ({
  id,
  vendorName: "",
  quotedPrice: "",
  additionalFees: "",
  deliveryTime: "",
  paymentTerms: "",
});

const money = (value: number) =>
  new Intl.NumberFormat("en-KW", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);

const numberFrom = (value: string) => {
  if (!value || value.trim() === "") return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

function Field({ id, label, value, onChange, placeholder, suffix, type = "text", hint }: any) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-label-md text-label-md text-on-surface-variant">
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          id={id}
          data-testid={`input-${id}`}
          className={`w-full h-12 rounded-2xl bg-surface-container font-headline-sm text-headline-sm text-on-surface outline-none focus:bg-surface-container-high focus:ring-2 focus:ring-primary/20 transition-all px-space-md ${
            suffix ? "pr-16" : ""
          }`}
          type={type}
          min={type === "number" ? "0" : undefined}
          step={type === "number" ? "0.01" : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
        />
        {suffix && (
          <span className="absolute right-4 font-label-md text-label-md text-primary font-semibold pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {hint && <span className="font-body-sm text-body-sm text-on-surface-variant px-1">{hint}</span>}
    </div>
  );
}

function FieldWithIcon({ id, label, value, onChange, placeholder, suffix, type = "text", icon: Icon, iconColor }: any) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-label-md text-label-md text-on-surface-variant">
        {label}
      </label>
      <div className="relative flex items-center">
        <span className={`absolute left-3.5 pointer-events-none ${iconColor}`}>
          <Icon size={18} />
        </span>
        <input
          id={id}
          data-testid={`input-${id}`}
          className={`w-full h-12 rounded-2xl bg-surface-container font-headline-sm text-headline-sm text-on-surface outline-none focus:bg-surface-container-high focus:ring-2 focus:ring-primary/20 transition-all pl-10 ${
            suffix ? "pr-14" : "pr-4"
          }`}
          type={type}
          min={type === "number" ? "0" : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
        />
        {suffix && (
          <span className="absolute right-4 font-label-md text-label-md text-on-surface-variant font-semibold pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function VendorCard({ quote, index, canRemove, onChange, onRemove, onSwap }: any) {
  const base = numberFrom(quote.quotedPrice) || 0;
  const fees = numberFrom(quote.additionalFees) || 0;
  const total = base + fees;
  const basePercent = total > 0 ? (base / total) * 100 : 0;
  const feesPercent = total > 0 ? (fees / total) * 100 : 0;

  return (
    <div
      data-testid={`card-vendor-${quote.id}`}
      className="flex flex-col p-space-lg rounded-3xl bg-surface-container-low shadow-xl transition-transform duration-300 border border-outline-variant/10"
    >
      <div className="flex items-start justify-between gap-space-sm mb-space-md">
        <div className="flex items-center gap-space-sm min-w-0">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              index === 0
                ? "bg-secondary/15 text-secondary"
                : index === 1
                ? "bg-primary/15 text-primary"
                : "bg-tertiary/15 text-tertiary"
            }`}
          >
            {index === 0 ? <Truck size={24} /> : index === 1 ? <Network size={24} /> : <Store size={24} />}
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-space-xs">
              <span className="font-headline-sm text-headline-sm text-on-surface truncate">
                {quote.vendorName || `Vendor ${String.fromCharCode(65 + index)}`}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-body-sm text-body-sm text-on-surface-variant truncate bg-surface-container px-2 py-0.5 rounded-full">
                {quote.vendorId ? "Saved Vendor" : "Ad-hoc Entry"}
              </span>
              <button 
                type="button" 
                onClick={onSwap}
                className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                <BookOpen size={12} /> Select Saved
              </button>
            </div>
          </div>
        </div>
        {canRemove && (
          <button
            type="button"
            data-testid={`button-remove-vendor-${quote.id}`}
            onClick={onRemove}
            className="w-8 h-8 rounded-full bg-error/15 text-error hover:bg-error/25 flex items-center justify-center shrink-0 transition-colors focus:outline-none focus:ring-2 focus:ring-error"
            title="Remove vendor"
            aria-label="Remove vendor"
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="p-space-md rounded-2xl bg-surface-container-high mb-space-md">
        <div className="flex items-baseline justify-between mb-space-sm">
          <span className="font-label-md text-label-md text-on-surface-variant">Total Audited Outlay</span>
          <div className="flex items-baseline gap-1">
            <span className="font-metric-xl text-metric-xl text-on-surface font-headline-xl" data-testid={`text-total-cost-${quote.id}`}>
              {money(total)}
            </span>
            <span className="font-label-sm text-label-sm text-secondary font-semibold">KWD</span>
          </div>
        </div>

        <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden flex">
          <div className="bg-primary h-full rounded-full transition-all duration-300" style={{ width: `${basePercent}%` }}></div>
          <div className="bg-tertiary h-full rounded-full transition-all duration-300" style={{ width: `${feesPercent}%` }}></div>
        </div>

        <div className="flex justify-between mt-space-xs font-label-sm text-label-sm">
          <span className="text-on-surface-variant flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary inline-block"></span> Base: {money(base)} KWD
          </span>
          <span className="text-tertiary flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-tertiary inline-block"></span> Fees: {money(fees)} KWD
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-space-sm">
        <Field
          id={`vendor-${quote.id}-name`}
          label="Vendor Name"
          value={quote.vendorName}
          onChange={(val: string) => onChange("vendorName", val)}
          placeholder="e.g. Al-Ghanim Logistics"
        />
        <Field
          id={`vendor-${quote.id}-price`}
          label="Quoted Base Price"
          value={quote.quotedPrice}
          onChange={(val: string) => onChange("quotedPrice", val)}
          type="number"
          suffix="KWD"
        />
        <Field
          id={`vendor-${quote.id}-fees`}
          label="Mandatory Surcharges & Handling"
          value={quote.additionalFees}
          onChange={(val: string) => onChange("additionalFees", val)}
          type="number"
          suffix="KWD"
          hint="Customs clearance & port handling"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm pt-space-xs">
          <FieldWithIcon
            id={`vendor-${quote.id}-delivery`}
            label="Delivery Window"
            value={quote.deliveryTime}
            onChange={(val: string) => onChange("deliveryTime", val)}
            type="number"
            suffix="Days"
            icon={Zap}
            iconColor="text-secondary"
          />
          <FieldWithIcon
            id={`vendor-${quote.id}-terms`}
            label="Payment Terms"
            value={quote.paymentTerms}
            onChange={(val: string) => onChange("paymentTerms", val)}
            suffix="Net"
            icon={Calendar}
            iconColor="text-primary"
          />
        </div>
      </div>
    </div>
  );
}

export default function Compare() {
  const [, setLocation] = useLocation();
  const [vendors, setVendors] = useState<(VendorQuote & { vendorId?: string })[]>([
    emptyQuote(1),
    emptyQuote(2),
  ]);
  const [error, setError] = useState("");
  const [activeVendorIndex, setActiveVendorIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  
  const comparisonMutation = useCreateComparison();
  const { data: savedVendors } = useListVendors();
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [vendorSearch, setVendorSearch] = useState("");
  const queryClient = useQueryClient();

  // For swapping a specific slot with a saved vendor
  const [swapSlotId, setSwapSlotId] = useState<number | null>(null);

  const updateVendor = (id: number, field: keyof VendorQuote, value: string) => {
    setVendors((current) =>
      current.map((vendor) => {
        if (vendor.id === id) {
          const updated = { ...vendor, [field]: value };
          if (field === "vendorName" && vendor.vendorId) {
            updated.vendorId = undefined; // clear saved identity if edited manually
          }
          return updated;
        }
        return vendor;
      })
    );
    setError("");
  };

  const addEmptyVendor = () => {
    if (vendors.length >= 3) return;
    setVendors((current) => {
      const next = [...current, emptyQuote(Date.now())];
      setTimeout(() => scrollToIndex(next.length - 1), 50);
      return next;
    });
    setIsAddVendorOpen(false);
  };

  const addSavedVendor = (savedVendor: any) => {
    if (swapSlotId !== null) {
      // Swapping an existing slot
      setVendors((current) =>
        current.map((v) =>
          v.id === swapSlotId
            ? {
                ...v,
                vendorId: savedVendor.id,
                vendorName: savedVendor.name,
              }
            : v
        )
      );
      setSwapSlotId(null);
    } else {
      // Adding a new slot
      if (vendors.length >= 3) return;
      setVendors((current) => {
        const next = [
          ...current,
          {
            ...emptyQuote(Date.now()),
            vendorId: savedVendor.id,
            vendorName: savedVendor.name,
          }
        ];
        setTimeout(() => scrollToIndex(next.length - 1), 50);
        return next;
      });
    }
    setIsAddVendorOpen(false);
  };

  const removeVendor = (id: number) => {
    setVendors((current) => {
      const filtered = current.filter((vendor) => vendor.id !== id);
      if (activeVendorIndex >= filtered.length) {
        setActiveVendorIndex(Math.max(0, filtered.length - 1));
      }
      return filtered;
    });
  };

  const scrollToIndex = (index: number) => {
    setActiveVendorIndex(index);
    if (trackRef.current) {
      const cardWidth = trackRef.current.offsetWidth;
      trackRef.current.scrollTo({ left: index * cardWidth, behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    if (trackRef.current) {
      const cardWidth = trackRef.current.offsetWidth;
      const index = Math.round(trackRef.current.scrollLeft / cardWidth);
      if (index !== activeVendorIndex && index >= 0 && index < vendors.length) {
        setActiveVendorIndex(index);
      }
    }
  };

  const compare = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const invalid = vendors.some((vendor) => !isCompleteQuote(vendor));

    if (invalid) {
      setError("Complete every field for each vendor before comparing.");
      return;
    }

    setError("");
    comparisonMutation.mutate(
      {
        data: {
          vendors: vendors.map((vendor) => ({
            id: vendor.id,
            vendorId: vendor.vendorId,
            vendorName: vendor.vendorName.trim(),
            quotedPrice: numberFrom(vendor.quotedPrice),
            additionalFees: numberFrom(vendor.additionalFees),
            deliveryTime: numberFrom(vendor.deliveryTime),
            paymentTerms: vendor.paymentTerms.trim(),
          })),
        },
      },
      {
        onSuccess: (comparison) => {
          queryClient.invalidateQueries();
          setLocation(`/analysis/${comparison.id}`);
        },
        onError: () => {
          setError("Farrez could not save this comparison. Please try again.");
        },
      }
    );
  };

  const filteredSavedVendors = savedVendors?.filter(v => 
    v.status === 'active' &&
    v.name.toLowerCase().includes(vendorSearch.toLowerCase()) && 
    (swapSlotId !== null || !vendors.some(activeV => activeV.vendorId === v.id))
  ) || [];

  const isFormValid = vendors.length >= 2 && vendors.every(isCompleteQuote);

  return (
    <div className="flex flex-col w-full gap-space-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-space-xs pt-space-xs">
        <div className="inline-flex items-center gap-space-xs self-start px-space-sm py-1 rounded-full bg-primary/10">
          <BadgeCheck size={16} className="text-primary" />
          <span className="font-label-sm text-label-sm text-primary tracking-wide">
            Procurement Matrix • Kuwait
          </span>
        </div>
        <h1 className="font-headline-xl-mobile text-headline-xl-mobile text-on-surface tracking-tight">
          Compare Vendor Quotations
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Evaluate commercial proposals with automated fee auditing (KWD).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
        <div className="flex flex-col p-space-md rounded-2xl bg-surface-container shadow-md border border-outline-variant/5">
          <div className="flex items-center justify-between mb-space-xs">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Active RFQ</span>
            <Package size={18} className="text-secondary" />
          </div>
          <span className="font-metric-md text-metric-md text-on-surface">RFQ-2025-084</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
            Industrial Hardware
          </span>
        </div>
        <div className="flex flex-col p-space-md rounded-2xl bg-surface-container shadow-md border border-outline-variant/5">
          <div className="flex items-center justify-between mb-space-xs">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Median Estimate</span>
            <BarChart2 size={18} className="text-primary" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-metric-md text-metric-md text-primary">4,720</span>
            <span className="font-label-sm text-label-sm text-primary/70">KWD</span>
          </div>
          <span className="font-body-sm text-body-sm text-secondary truncate">
            {vendors.length} Valid Offers
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <span className="font-headline-sm text-headline-sm text-on-surface">Bidders Carousel</span>
          <div className="flex items-center gap-space-xs">
            <button
              type="button"
              disabled={activeVendorIndex === 0}
              onClick={() => scrollToIndex(Math.max(0, activeVendorIndex - 1))}
              className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Previous Vendor"
              aria-label="Previous Vendor"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <span className="font-label-sm text-label-sm text-on-surface-variant px-1.5 min-w-[3rem] text-center">
              {activeVendorIndex + 1} of {vendors.length}
            </span>
            <button
              type="button"
              disabled={activeVendorIndex === vendors.length - 1}
              onClick={() => scrollToIndex(Math.min(vendors.length - 1, activeVendorIndex + 1))}
              className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Next Vendor"
              aria-label="Next Vendor"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-space-xs overflow-x-auto pb-2 -mb-2 no-scrollbar">
          {vendors.map((v, i) => (
            <button
              type="button"
              key={v.id}
              onClick={() => scrollToIndex(i)}
              className={`vendor-tab px-space-md py-2 rounded-full font-label-md text-label-md shrink-0 transition-all flex items-center gap-1.5 border ${
                activeVendorIndex === i
                  ? "bg-primary text-on-primary border-primary shadow-sm"
                  : "bg-surface-container text-on-surface-variant hover:text-on-surface border-transparent hover:border-outline-variant/20"
              }`}
            >
              {i === 0 ? <Truck size={16} /> : i === 1 ? <Network size={16} /> : <Store size={16} />}
              <span>{v.vendorName || `Vendor ${String.fromCharCode(65 + i)}`}</span>
            </button>
          ))}
          {vendors.length < 3 && (
            <button
              type="button"
              data-testid="button-add-vendor"
              onClick={() => { setSwapSlotId(null); setIsAddVendorOpen(true); }}
              className="px-space-md py-2 rounded-full font-label-md text-label-md bg-surface-container-high text-on-surface-variant hover:text-on-surface shrink-0 transition-all flex items-center gap-1.5 border border-dashed border-outline-variant/50 hover:border-outline-variant"
            >
              <Plus size={16} /> <span>Add Vendor</span>
            </button>
          )}
          
          <Dialog open={isAddVendorOpen} onOpenChange={(open) => { setIsAddVendorOpen(open); if(!open) setSwapSlotId(null); }}>
            <DialogContent className="sm:max-w-md bg-surface border-outline-variant/30">
              <DialogHeader>
                  <DialogTitle className="text-on-surface">
                    {swapSlotId !== null ? "Select Saved Vendor" : "Add Vendor to Comparison"}
                  </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 mt-4">
                  {swapSlotId === null && (
                    <>
                      <button 
                        onClick={addEmptyVendor}
                        className="flex flex-col items-start p-4 rounded-xl border border-outline-variant/30 bg-surface-container-low hover:bg-surface-container transition-colors text-left"
                      >
                        <span className="font-headline-sm text-on-surface font-semibold flex items-center gap-2">
                          <Plus size={18} className="text-primary"/> Ad-hoc Vendor
                        </span>
                        <span className="font-body-sm text-on-surface-variant mt-1">Enter a new vendor manually for this comparison only.</span>
                      </button>
                      
                      <div className="relative mt-2">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-outline-variant/20" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-surface px-2 text-on-surface-variant">Or select saved vendor</span>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-on-surface-variant" />
                    <input
                      type="text"
                      placeholder="Search vendors..."
                      className="w-full pl-9 pr-4 py-2 bg-surface-container rounded-lg border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={vendorSearch}
                      onChange={(e) => setVendorSearch(e.target.value)}
                    />
                  </div>

                  <div className="max-h-[200px] overflow-y-auto flex flex-col gap-1 -mx-2 px-2 no-scrollbar">
                    {filteredSavedVendors.length === 0 ? (
                      <div className="p-4 text-center text-on-surface-variant text-sm">
                        No available vendors found.
                      </div>
                    ) : (
                      filteredSavedVendors.map(v => (
                        <button
                          key={v.id}
                          onClick={() => addSavedVendor(v)}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container transition-colors text-left border border-transparent hover:border-outline-variant/20"
                        >
                          <div className="flex flex-col">
                            <span className="font-label-md text-on-surface font-semibold">{v.name}</span>
                            <span className="font-body-sm text-on-surface-variant text-xs">{v.category}</span>
                          </div>
                          <ChevronRight size={16} className="text-on-surface-variant opacity-50" />
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
        </div>
      </div>

      <form onSubmit={compare} className="flex flex-col gap-space-lg w-full relative">
        <div
          className="flex gap-space-md overflow-x-auto snap-x snap-mandatory scroll-smooth pb-space-sm pt-1 no-scrollbar"
          ref={trackRef}
          onScroll={handleScroll}
        >
          {vendors.map((v, i) => (
            <div key={v.id} className="min-w-full snap-center shrink-0">
              <VendorCard
                quote={v}
                index={i}
                canRemove={vendors.length === 3 && i === vendors.length - 1}
                onChange={(f: any, val: any) => updateVendor(v.id, f, val)}
                onRemove={() => removeVendor(v.id)}
                onSwap={() => { setSwapSlotId(v.id); setIsAddVendorOpen(true); }}
              />
            </div>
          ))}
        </div>

        {error ? (
          <div
            className="p-space-sm rounded-xl bg-error/15 flex items-center gap-space-xs text-error font-label-sm text-label-sm font-bold animate-in fade-in"
            data-testid="status-validation-error"
          >
            <AlertCircle size={18} />
            {error}
          </div>
        ) : (
          <div className="p-space-md rounded-2xl bg-surface-container flex items-center justify-between border border-outline-variant/10">
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center">
                <ThumbsUp size={20} className="text-secondary" />
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-on-surface">Auto-Audit Ready</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Fill details to compare</span>
              </div>
            </div>
            <Info size={20} className="text-on-surface-variant" />
          </div>
        )}

        <div className="pt-space-xs flex flex-col gap-space-xs relative z-10">
          <button
            type="submit"
            disabled={!isFormValid || comparisonMutation.isPending}
            data-testid="button-compare-quotes"
            className="w-full h-14 rounded-2xl bg-primary text-on-primary font-headline-sm text-headline-sm flex items-center justify-center gap-space-sm shadow-[0_0_24px_-4px_rgba(77,142,255,0.45)] hover:shadow-[0_0_32px_0px_rgba(77,142,255,0.6)] active:scale-[0.99] transition-all disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-[0_0_24px_-4px_rgba(77,142,255,0.45)]"
          >
            {comparisonMutation.isPending ? (
              <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin mr-1"></span>
            ) : (
              <LineChart size={22} />
            )}
            <span>
              {comparisonMutation.isPending ? "Comparing Vendors..." : `Compare ${vendors.length} Vendors`}
            </span>
            {!comparisonMutation.isPending && <ArrowRight size={20} />}
          </button>
          <div className="flex items-center justify-center gap-1 text-center mt-1">
            <Lock size={14} className="text-secondary" />
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Strictly Audited & Encrypted Kuwait Tender Portal
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}
