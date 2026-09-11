import { useListComparisons } from "@workspace/api-client-react";
import { History as HistoryIcon, Search, Calendar, ChevronRight, Activity, ArrowRight, TrendingDown, Timer, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

const money = (value: number) =>
  new Intl.NumberFormat("en-KW", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (isoString: string) => {
  return new Intl.DateTimeFormat("en-KW", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
};

export default function History() {
  const [search, setSearch] = useState("");
  const { data: comparisons, isLoading } = useListComparisons({ search });
  const [, setLocation] = useLocation();

  return (
    <div className="flex flex-col w-full gap-space-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-space-xs pt-space-xs">
        <div className="inline-flex items-center gap-space-xs self-start px-space-sm py-1 rounded-full bg-primary/10">
          <HistoryIcon size={16} className="text-primary" />
          <span className="font-label-sm text-label-sm text-primary tracking-wide">
            Decision Records
          </span>
        </div>
        <h1 className="font-headline-xl-mobile text-headline-xl-mobile text-on-surface tracking-tight">
          Comparison History
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Access previously audited quotes and recommendation snapshots.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-3.5 h-5 w-5 text-on-surface-variant" />
        <input
          type="text"
          placeholder="Search comparisons by vendor name..."
          className="w-full h-12 pl-12 pr-4 bg-surface-container rounded-xl border border-outline-variant/20 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-space-sm pb-8">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
          </div>
        ) : comparisons?.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/30 text-on-surface-variant">
            <HistoryIcon size={32} className="mb-2 opacity-50" />
            <p className="font-medium text-on-surface">No history found</p>
            <p className="text-sm mt-1 text-center">Start by comparing vendor quotations.</p>
            <Link href="/" className="mt-4 px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition-colors">
              New Comparison
            </Link>
          </div>
        ) : (
          comparisons?.map((c) => {
            const recommended = c.vendors.find(v => v.isRecommended) || c.vendors[0];
            const otherCount = c.vendors.length - 1;
            
            return (
              <button
                key={c.id}
                onClick={() => setLocation(`/analysis/${c.id}`)}
                className="flex flex-col bg-surface-container-low rounded-2xl border border-outline-variant/10 overflow-hidden shadow-sm hover:border-primary/30 hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-center justify-between p-space-md border-b border-outline-variant/10">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-on-surface-variant" />
                    <span className="font-label-md text-on-surface-variant">
                      {formatDate(c.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-primary group-hover:translate-x-1 transition-transform">
                    <span className="text-xs font-semibold uppercase tracking-wider">View Analysis</span>
                    <ArrowRight size={16} />
                  </div>
                </div>

                <div className="p-space-md flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Recommended Vendor</span>
                      <span className="font-headline-sm text-on-surface font-bold mt-1 text-lg">{recommended.vendorName || "Unknown"}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-metric-md text-primary font-extrabold">{money(recommended.totalCost)} KWD</span>
                      <span className="text-xs font-medium text-secondary bg-secondary/10 px-2 py-0.5 rounded-full mt-1">Winning Bid</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="bg-surface-container rounded-lg p-2.5 flex items-center gap-2 border border-outline-variant/5">
                      <TrendingDown size={14} className="text-secondary shrink-0"/>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Base Price</span>
                        <span className="font-label-sm text-on-surface font-bold truncate">{money(recommended.quotedPrice)} KWD</span>
                      </div>
                    </div>
                    <div className="bg-surface-container rounded-lg p-2.5 flex items-center gap-2 border border-outline-variant/5">
                      <Timer size={14} className="text-primary shrink-0"/>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Delivery</span>
                        <span className="font-label-sm text-on-surface font-bold truncate">{recommended.deliveryTime} Days</span>
                      </div>
                    </div>
                    <div className="bg-surface-container rounded-lg p-2.5 flex items-center gap-2 border border-outline-variant/5">
                      <AlertTriangle size={14} className={recommended.additionalFees > 0 ? "text-error shrink-0" : "text-on-surface-variant shrink-0"}/>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Audit Fees</span>
                        <span className={`font-label-sm font-bold truncate ${recommended.additionalFees > 0 ? "text-error" : "text-on-surface"}`}>
                          {recommended.additionalFees > 0 ? `+${money(recommended.additionalFees)}` : "None"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {otherCount > 0 && (
                    <div className="flex items-center gap-2 text-sm text-on-surface-variant pt-2 border-t border-outline-variant/5">
                      <Activity size={14} />
                      <span>Compared against <strong className="text-on-surface">{otherCount}</strong> other {otherCount === 1 ? "vendor" : "vendors"}</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
