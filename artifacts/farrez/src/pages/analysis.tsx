import { useGetComparison, getGetComparisonQueryKey } from "@workspace/api-client-react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BadgeCheck,
  Banknote,
  Building2,
  CheckCheck,
  Download,
  PenTool,
  Scale,
  ShieldCheck,
  Star,
  Timer,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "wouter";

const money = (value: number) =>
  new Intl.NumberFormat("en-KW", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);

const numberFrom = (value: string | number) => {
  if (typeof value === 'number') return value;
  if (!value || value.trim() === "") return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

function ResultCard({ result, lowestCost }: { result: any; lowestCost: number }) {
  const isRecommended = result.isRecommended;
  const isFastest = result.isFastestDelivery && !isRecommended;
  const diff = result.totalCost - lowestCost;
  const diffPercent = lowestCost > 0 ? (diff / lowestCost) * 100 : 0;
  const isHighFee = !isRecommended && !isFastest && diffPercent > 5;

  const base = numberFrom(result.quotedPrice) || 0;
  const fees = numberFrom(result.additionalFees) || 0;

  return (
    <div
      data-testid={`result-vendor-${result.id}`}
      className={`vendor-card flex flex-col w-full rounded-2xl p-space-md relative overflow-hidden transition-all duration-300 ${
        isRecommended
          ? "bg-surface-container shadow-2xl shadow-primary/10 border-primary/20"
          : "bg-surface-container shadow-md border-outline-variant/10"
      } border`}
    >
      {isRecommended && (
        <div className="absolute -top-24 -right-20 w-44 h-44 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
      )}

      <div className="flex items-center justify-between mb-space-sm relative z-10">
        {isRecommended ? (
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                Optimal Evaluation
              </span>
            </div>
            <div
              className="flex items-center gap-1 bg-primary text-on-primary px-3 py-1 rounded-full shadow-lg shadow-primary/30"
              data-testid={`status-recommended-vendor-${result.id}`}
            >
              <Star size={14} className="fill-current" />
              <span className="font-label-sm text-label-sm font-bold tracking-tight">
                Recommended Bid
              </span>
            </div>
          </>
        ) : isFastest ? (
          <>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
              Expedited Alternative
            </span>
            <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm font-medium border border-outline-variant/20">
              Solid Runner-Up
            </span>
          </>
        ) : isHighFee ? (
          <>
            <span className="font-label-sm text-label-sm text-error uppercase tracking-wider font-bold flex items-center gap-1">
              <AlertTriangle size={15} /> Audit Exception
            </span>
            <span className="px-2.5 py-1 rounded-full bg-error/15 text-error font-label-sm text-label-sm font-bold">
              High Risk
            </span>
          </>
        ) : (
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
            Standard Alternative
          </span>
        )}
      </div>

      <div className="flex items-start justify-between gap-space-sm relative z-10">
        <div className="flex items-center gap-space-sm min-w-0">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              isRecommended
                ? "bg-primary/10 text-primary"
                : isHighFee
                ? "bg-error/10 text-error"
                : "bg-surface-container-highest text-secondary"
            }`}
          >
            {isRecommended ? (
              <Building2 size={24} />
            ) : isHighFee ? (
              <AlertTriangle size={24} />
            ) : (
              <Truck size={24} />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold truncate">
              {result.vendorName}
            </h2>
          </div>
        </div>
        {isRecommended && (
          <div className="flex flex-col items-end shrink-0">
            <span className="font-label-sm text-label-sm text-secondary bg-secondary/10 px-2 py-0.5 rounded-full font-bold border border-secondary/20">
              Optimal Match
            </span>
          </div>
        )}
      </div>

      <div
        className={`mt-space-md p-space-md rounded-xl relative z-10 ${
          isRecommended
            ? "bg-surface-container-high/90 backdrop-blur-sm border border-outline-variant/10"
            : isHighFee
            ? "bg-error-container/20 border border-error/10"
            : "bg-surface-container-low border border-outline-variant/10"
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`font-label-sm text-label-sm uppercase tracking-wider font-semibold ${
              isHighFee ? "text-error font-bold" : "text-on-surface-variant"
            }`}
          >
            {isRecommended
              ? "Lowest Net Audited Cost"
              : isHighFee
              ? "Total Adjusted Cost"
              : "Audited Total Cost"}
          </span>
          {isHighFee && (
            <span className="font-label-sm text-label-sm text-error font-semibold">
              +{diffPercent.toFixed(1)}% vs Match
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span
            className={`font-metric-xl text-metric-xl font-extrabold tracking-tight ${
              isHighFee ? "text-error" : "text-on-surface"
            }`}
            data-testid={`text-total-cost-${result.id}`}
          >
            {money(result.totalCost)}
          </span>
          <span
            className={`font-headline-sm text-headline-sm font-bold ${
              isRecommended ? "text-primary" : isHighFee ? "text-error" : "text-on-surface-variant"
            }`}
          >
            KWD
          </span>
        </div>
        <div className="flex items-center justify-between text-body-sm font-body-sm mt-space-xs pt-space-xs text-on-surface-variant border-t border-outline-variant/10">
          <span>
            Base Quote:{" "}
            <strong className={`text-on-surface ${isHighFee ? "line-through" : ""}`}>
              {money(base)} KWD
            </strong>
          </span>
          <span data-testid={`text-fees-${result.id}`}>
            Verified Fees:{" "}
            <strong
              className={
                isRecommended
                  ? "text-secondary font-semibold"
                  : isHighFee
                  ? "text-error font-bold"
                  : "text-on-surface font-semibold"
              }
            >
              +{money(fees)} KWD
            </strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs mt-space-sm relative z-10">
        <div className="bg-surface-container-low/90 p-space-sm rounded-xl flex flex-col justify-between border border-outline-variant/5">
          <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
            <Truck size={15} className={isRecommended ? "text-primary" : isHighFee ? "" : "text-secondary"} /> Lead Time
          </span>
          <div className="mt-2 flex items-center gap-1.5">
            <span
              className={`font-headline-sm text-headline-sm font-bold ${
                isFastest ? "text-secondary" : "text-on-surface"
              }`}
              data-testid={`text-delivery-${result.id}`}
            >
              {result.deliveryTime} Days
            </span>
            {result.isFastestDelivery && (
              <span
                className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${
                  isRecommended
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-secondary/15 text-secondary font-bold border border-secondary/20"
                }`}
                data-testid={`status-fastest-delivery-${result.id}`}
              >
                Fastest
              </span>
            )}
          </div>
        </div>
        <div className="bg-surface-container-low/90 p-space-sm rounded-xl flex flex-col justify-between border border-outline-variant/5">
          <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
            <Banknote
              size={15}
              className={isRecommended ? "text-secondary" : isHighFee ? "text-tertiary" : "text-on-surface-variant"}
            />{" "}
            Payment Term
          </span>
          <div className="mt-2 flex items-center gap-1">
            <span
              className={`font-headline-sm text-headline-sm font-bold ${
                isHighFee ? "text-tertiary" : "text-on-surface"
              }`}
              data-testid={`text-terms-${result.id}`}
            >
              {result.paymentTerms} Net
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Analysis() {
  const params = useParams();
  const id = params.id as string;

  const { data: comparison, isLoading, isError } = useGetComparison(id, {
    query: {
      queryKey: getGetComparisonQueryKey(id),
      enabled: !!id,
    }
  });

  const [activeVendorIndex, setActiveVendorIndex] = useState(0);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center pt-24 text-on-surface-variant animate-pulse">
        <Activity size={48} className="mb-4 opacity-50 text-primary" />
        <p className="font-headline-md text-headline-md text-on-surface">Auditing Proposals...</p>
        <p className="font-body-md text-body-md mt-2 text-center">Processing vendor data through GCC matrix</p>
      </div>
    );
  }

  if (isError || !comparison) {
    return (
      <div className="flex flex-col items-center justify-center pt-24 text-on-surface-variant">
        <AlertCircle size={48} className="mb-4 opacity-50 text-error" />
        <p className="font-headline-md text-headline-md text-on-surface">Analysis Not Found</p>
        <p className="font-body-md text-body-md mt-2 mb-6 text-center">We couldn't find this comparison record.</p>
        <Link href="/" className="px-6 py-3 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
          New Comparison
        </Link>
      </div>
    );
  }

  const results = comparison.vendors;
  const lowestCostResult = results.find((r) => r.isLowestCost);
  const fastestResult = results.find((r) => r.isFastestDelivery);
  const highestFee = Math.max(...results.map((r) => numberFrom(r.additionalFees)));
  const highestFeeResult = results.find((r) => numberFrom(r.additionalFees) === highestFee);

  const exportReport = () => {
    // Generate a simple CSV for the real client-side download requirement
    const headers = ["Vendor Name", "Base Price (KWD)", "Fees (KWD)", "Total Cost (KWD)", "Delivery (Days)", "Payment Terms", "Recommendation"];
    const rows = results.map(r => [
      `"${r.vendorName}"`,
      r.quotedPrice,
      r.additionalFees,
      r.totalCost,
      r.deliveryTime,
      `"${r.paymentTerms}"`,
      r.isRecommended ? "Recommended" : r.isFastestDelivery ? "Fastest" : "Standard"
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `farrez_decision_report_${comparison.id.substring(0, 8)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div data-testid="section-results" className="flex flex-col w-full space-y-space-md animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative w-full rounded-2xl bg-surface-container-low p-space-md overflow-hidden shadow-xl border border-outline-variant/10">
        <div className="absolute -top-16 -right-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col gap-1">
          <div className="flex items-center gap-space-xs">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary border border-primary/20">
              <Activity size={14} />
            </span>
            <span className="font-label-sm text-label-sm tracking-wider uppercase text-primary font-semibold">
              Saved comparison
            </span>
            <span className="w-1 h-1 rounded-full bg-outline"></span>
            <span className="font-label-sm text-label-sm text-secondary font-medium">
              Cost + delivery rule
            </span>
          </div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold tracking-tight">
            Procurement Decision Matrix
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Audited comparison across {results.length} supplier bids (All amounts in KWD)
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-space-xs mt-space-md pt-space-xs">
          <div className="flex flex-col bg-surface-container-high/70 backdrop-blur-md rounded-xl p-space-sm border border-outline-variant/10">
            <div className="flex items-center gap-1 text-on-surface-variant">
              <Banknote size={15} className="text-secondary" />
              <span className="font-label-sm text-label-sm">Lowest Cost</span>
            </div>
            <span className="font-metric-md text-metric-md text-on-surface font-extrabold mt-1">
              {lowestCostResult ? money(lowestCostResult.totalCost) : "-"}
            </span>
            <span className="font-label-sm text-label-sm text-secondary font-medium tracking-tight truncate">
              {lowestCostResult?.vendorName || "-"}
            </span>
          </div>
          <div className="flex flex-col bg-surface-container-high/70 backdrop-blur-md rounded-xl p-space-sm border border-outline-variant/10">
            <div className="flex items-center gap-1 text-on-surface-variant">
              <Timer size={15} className="text-primary" />
              <span className="font-label-sm text-label-sm">Fastest Delivery</span>
            </div>
            <span className="font-metric-md text-metric-md text-on-surface font-extrabold mt-1">
              {fastestResult?.deliveryTime} Days
            </span>
            <span className="font-label-sm text-label-sm text-primary font-medium tracking-tight truncate">
              {fastestResult?.vendorName}
            </span>
          </div>
          <div className="flex flex-col bg-surface-container-high/70 backdrop-blur-md rounded-xl p-space-sm border border-outline-variant/10">
            <div className="flex items-center gap-1 text-on-surface-variant">
              <PenTool size={15} className="text-error" />
              <span className="font-label-sm text-label-sm">Fee Surcharges</span>
            </div>
            <span className="font-metric-md text-metric-md text-error font-extrabold mt-1">
              +{highestFee ? money(highestFee) : "0"}
            </span>
            <span className="font-label-sm text-label-sm text-error font-medium tracking-tight truncate">
              {highestFeeResult?.vendorName}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-space-xs px-1">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
          {results.map((r, i) => (
            <button
              key={r.id}
              onClick={() => setActiveVendorIndex(i)}
              className={`tab-pill px-3 py-1.5 rounded-full font-label-sm text-label-sm flex items-center gap-1.5 transition-all duration-200 border ${
                activeVendorIndex === i
                  ? "bg-primary text-on-primary shadow-md shadow-primary/20 font-semibold border-primary"
                  : "bg-surface-container-high text-on-surface-variant hover:text-on-surface border-transparent hover:border-outline-variant/30"
              }`}
            >
              {r.isRecommended && <BadgeCheck size={15} />}
              {!r.isRecommended && r.totalCost > lowestCostResult!.totalCost && (
                <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
              )}
              <span>{r.vendorName || `Vendor ${String.fromCharCode(65 + i)}`}</span>
            </button>
          ))}
        </div>
        <span className="font-label-sm text-label-sm text-on-surface-variant shrink-0 min-w-[3rem] text-right">
          {activeVendorIndex + 1} of {results.length}
        </span>
      </div>

      <div className="relative w-full">
        {results.map((r, i) => {
          if (i !== activeVendorIndex) return null;
          return <ResultCard key={r.id} result={r} lowestCost={lowestCostResult?.totalCost || 0} />;
        })}
      </div>

      <div className="w-full rounded-2xl bg-surface-container-low p-space-md border border-outline-variant/10 shadow-sm">
        <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/10">
          <div className="flex items-center gap-1.5">
            <Scale size={18} className="text-primary" />
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Side-by-Side Delta</h3>
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            {results.length} Audited Bids
          </span>
        </div>
        <div className="space-y-space-xs pt-space-sm">
          {results.map((r) => (
            <div
              key={r.id}
              className="p-space-sm rounded-xl bg-surface-container flex items-center justify-between border border-outline-variant/5"
            >
              <span className="font-body-sm text-body-sm text-on-surface-variant font-medium truncate pr-2">
                {r.vendorName || `Vendor ${r.id}`}
              </span>
              <div className="flex items-center gap-space-sm text-right shrink-0">
                {r.isRecommended ? (
                  <span className="font-label-sm text-label-sm text-secondary bg-secondary/10 px-2 py-0.5 rounded-full font-bold border border-secondary/20">
                    {r.deliveryTime}d Net
                  </span>
                ) : (
                  <span
                    className={`font-label-sm text-label-sm px-2 py-0.5 rounded-full font-medium border ${
                      numberFrom(r.additionalFees) > 0
                        ? "text-error bg-error/15 border-error/20"
                        : "text-on-surface-variant bg-surface-container-high border-outline-variant/20"
                    }`}
                  >
                    {numberFrom(r.additionalFees) > 0
                      ? `+${money(numberFrom(r.additionalFees))} Fee`
                      : `${r.deliveryTime}d Net`}
                  </span>
                )}
                <span
                  className={`font-headline-sm text-headline-sm font-bold ${
                    r.isRecommended
                      ? "text-primary"
                      : r.totalCost > lowestCostResult!.totalCost
                      ? "text-error font-semibold"
                      : "text-on-surface font-semibold"
                  }`}
                >
                  {money(r.totalCost)} KWD
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-space-xs pt-space-xs pb-space-sm">
        <button
          type="button"
          onClick={exportReport}
          data-testid="button-export-report"
          className="w-full h-12 rounded-xl bg-surface-container-high hover:bg-surface-bright border border-outline-variant/20 text-on-surface font-label-lg text-label-lg font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Download size={18} />
          Export Decision Report (CSV)
        </button>
      </div>
    </div>
  );
}
