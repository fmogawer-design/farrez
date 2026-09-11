import { type FormEvent, type ReactNode, useRef, useState, useEffect } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Banknote,
  BarChart2,
  Building2,
  Calendar,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Download,
  FileText,
  Info,
  LineChart,
  Lock,
  Network,
  Package,
  PenTool,
  Plus,
  Scale,
  ShieldCheck,
  Star,
  Store,
  ThumbsUp,
  Timer,
  Trash2,
  Truck,
  User,
  Zap
} from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  getGetBillingCheckoutSessionQueryKey,
  useCreateBillingCheckout,
  useCreateComparison,
  useGetBillingCheckoutSession,
} from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import {
  isCompleteQuote,
  type QuoteResult,
  type VendorQuote,
} from '@/lib/comparison';

const emptyQuote = (id: number): VendorQuote => ({
  id,
  vendorName: '',
  quotedPrice: '',
  additionalFees: '',
  deliveryTime: '',
  paymentTerms: '',
});

const money = (value: number) =>
  new Intl.NumberFormat('en-KW', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);

const numberFrom = (value: string) => {
  if (!value || value.trim() === '') return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

function Field({ id, label, value, onChange, placeholder, suffix, type = 'text', hint }: any) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-label-md text-label-md text-on-surface-variant">{label}</label>
      <div className="relative flex items-center">
        <input
          id={id}
          data-testid={`input-${id}`}
          className={`w-full h-12 rounded-2xl bg-surface-container font-headline-sm text-headline-sm text-on-surface outline-none focus:bg-surface-container-high transition-colors px-space-md ${suffix ? 'pr-16' : ''}`}
          type={type}
          min={type === 'number' ? '0' : undefined}
          step={type === 'number' ? '0.01' : undefined}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
        />
        {suffix && <span className="absolute right-4 font-label-md text-label-md text-primary font-semibold pointer-events-none">{suffix}</span>}
      </div>
      {hint && <span className="font-body-sm text-body-sm text-on-surface-variant px-1">{hint}</span>}
    </div>
  );
}

function FieldWithIcon({ id, label, value, onChange, placeholder, suffix, type = 'text', icon: Icon, iconColor }: any) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-label-md text-label-md text-on-surface-variant">{label}</label>
      <div className="relative flex items-center">
        <span className={`absolute left-3.5 pointer-events-none ${iconColor}`}><Icon size={18} /></span>
        <input
          id={id}
          data-testid={`input-${id}`}
          className={`w-full h-12 rounded-2xl bg-surface-container font-headline-sm text-headline-sm text-on-surface outline-none focus:bg-surface-container-high transition-colors pl-10 ${suffix ? 'pr-14' : 'pr-4'}`}
          type={type}
          min={type === 'number' ? '0' : undefined}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
        />
        {suffix && <span className="absolute right-4 font-label-md text-label-md text-on-surface-variant font-semibold pointer-events-none">{suffix}</span>}
      </div>
    </div>
  );
}

function VendorCard({ quote, index, canRemove, onChange, onRemove }: any) {
  const base = numberFrom(quote.quotedPrice) || 0;
  const fees = numberFrom(quote.additionalFees) || 0;
  const total = base + fees;
  const basePercent = total > 0 ? (base / total) * 100 : 0;
  const feesPercent = total > 0 ? (fees / total) * 100 : 0;
  
  return (
    <div data-testid={`card-vendor-${quote.id}`} className="flex flex-col p-space-lg rounded-3xl bg-surface-container-low shadow-xl transition-transform duration-300">
      <div className="flex items-start justify-between gap-space-sm mb-space-md">
        <div className="flex items-center gap-space-sm min-w-0">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${index === 0 ? 'bg-secondary/15 text-secondary' : index === 1 ? 'bg-primary/15 text-primary' : 'bg-tertiary/15 text-tertiary'}`}>
            {index === 0 ? <Truck size={24}/> : index === 1 ? <Network size={24}/> : <Store size={24}/>}
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-space-xs">
              <span className="font-headline-sm text-headline-sm text-on-surface truncate">{quote.vendorName || `Vendor ${String.fromCharCode(65 + index)}`}</span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant truncate">Commercial License #{3892 + index * 100}</span>
          </div>
        </div>
        {canRemove && (
          <button type="button" data-testid={`button-remove-vendor-${quote.id}`} onClick={onRemove} className="w-8 h-8 rounded-full bg-error/15 text-error hover:bg-error/25 flex items-center justify-center shrink-0 transition-colors">
            <Trash2 size={16} />
          </button>
        )}
      </div>
      
      <div className="p-space-md rounded-2xl bg-surface-container-high mb-space-md">
        <div className="flex items-baseline justify-between mb-space-sm">
          <span className="font-label-md text-label-md text-on-surface-variant">Total Audited Outlay</span>
          <div className="flex items-baseline gap-1">
            <span className="font-metric-xl text-metric-xl text-on-surface font-headline-xl" data-testid={`text-total-cost-${quote.id}`}>{money(total)}</span>
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
        <Field id={`vendor-${quote.id}-name`} label="Vendor Name" value={quote.vendorName} onChange={(val: string) => onChange('vendorName', val)} placeholder="e.g. Al-Ghanim Logistics" />
        <Field id={`vendor-${quote.id}-price`} label="Quoted Base Price" value={quote.quotedPrice} onChange={(val: string) => onChange('quotedPrice', val)} type="number" suffix="KWD" />
        <Field id={`vendor-${quote.id}-fees`} label="Mandatory Surcharges & Handling" value={quote.additionalFees} onChange={(val: string) => onChange('additionalFees', val)} type="number" suffix="KWD" hint="Customs clearance & port handling" />
        <div className="grid grid-cols-2 gap-space-sm pt-space-xs">
          <FieldWithIcon id={`vendor-${quote.id}-delivery`} label="Delivery Window" value={quote.deliveryTime} onChange={(val: string) => onChange('deliveryTime', val)} type="number" suffix="Days" icon={Zap} iconColor="text-secondary" />
          <FieldWithIcon id={`vendor-${quote.id}-terms`} label="Payment Terms" value={quote.paymentTerms} onChange={(val: string) => onChange('paymentTerms', val)} suffix="Net" icon={Calendar} iconColor="text-primary" />
        </div>
      </div>
    </div>
  );
}

function ResultCard({ result, lowestCost }: { result: QuoteResult, lowestCost: number }) {
  const isRecommended = result.isRecommended;
  const isFastest = result.isFastestDelivery && !isRecommended;
  const diff = result.totalCost - lowestCost;
  const diffPercent = lowestCost > 0 ? (diff / lowestCost) * 100 : 0;
  const isHighFee = !isRecommended && !isFastest && diffPercent > 5;
  
  const base = numberFrom(result.quotedPrice) || 0;
  const fees = numberFrom(result.additionalFees) || 0;
  
  return (
    <div data-testid={`result-vendor-${result.id}`} className={`vendor-card flex flex-col w-full rounded-2xl p-space-md relative overflow-hidden transition-all duration-300 ${isRecommended ? 'bg-surface-container shadow-2xl shadow-primary/10' : 'bg-surface-container shadow-md'}`}>
      {isRecommended && <div className="absolute -top-24 -right-20 w-44 h-44 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>}
      
      <div className="flex items-center justify-between mb-space-sm relative z-10">
        {isRecommended ? (
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">Optimal Evaluation</span>
            </div>
            <div className="flex items-center gap-1 bg-primary text-on-primary px-3 py-1 rounded-full shadow-lg shadow-primary/30" data-testid={`status-recommended-vendor-${result.id}`}>
              <Star size={14} className="fill-current" />
              <span className="font-label-sm text-label-sm font-bold tracking-tight">Recommended Bid</span>
            </div>
          </>
        ) : isFastest ? (
          <>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Expedited Alternative</span>
            <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm font-medium">Solid Runner-Up</span>
          </>
        ) : isHighFee ? (
          <>
            <span className="font-label-sm text-label-sm text-error uppercase tracking-wider font-bold flex items-center gap-1">
              <AlertTriangle size={15} /> Audit Exception
            </span>
            <span className="px-2.5 py-1 rounded-full bg-error/15 text-error font-label-sm text-label-sm font-bold">High Risk</span>
          </>
        ) : (
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Standard Alternative</span>
        )}
      </div>
      
      <div className="flex items-start justify-between gap-space-sm relative z-10">
        <div className="flex items-center gap-space-sm min-w-0">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isRecommended ? 'bg-surface-container-highest text-primary' : isHighFee ? 'bg-error/10 text-error' : 'bg-surface-container-highest text-secondary'}`}>
            {isRecommended ? <Building2 size={24}/> : isHighFee ? <AlertTriangle size={24}/> : <Truck size={24}/>}
          </div>
          <div className="flex flex-col min-w-0">
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold truncate">{result.vendorName}</h2>
            <div className="flex items-center gap-1 mt-0.5">
              <Star size={14} className={isRecommended ? 'text-secondary' : isHighFee ? 'text-tertiary' : 'text-secondary'} />
              <span className="font-label-sm text-label-sm text-on-surface font-semibold">{isRecommended ? '4.9' : isHighFee ? '4.1' : '4.8'}</span>
              <span className={`font-label-sm text-label-sm ${isHighFee ? 'text-error font-medium' : 'text-on-surface-variant'}`}>
                {isHighFee ? '(Surprise surcharges noted)' : '(94 GCC Deliveries)'}
              </span>
            </div>
          </div>
        </div>
        {isRecommended && (
          <div className="flex flex-col items-end shrink-0">
            <span className="font-label-sm text-label-sm text-secondary bg-secondary/10 px-2 py-0.5 rounded-full font-bold">Lowest Match</span>
          </div>
        )}
      </div>
      
      <div className={`mt-space-md p-space-md rounded-xl relative z-10 ${isRecommended ? 'bg-surface-container-high/90 backdrop-blur-sm' : isHighFee ? 'bg-error-container/20' : 'bg-surface-container-low'}`}>
        <div className="flex items-center justify-between">
          <span className={`font-label-sm text-label-sm uppercase tracking-wider font-semibold ${isHighFee ? 'text-error font-bold' : 'text-on-surface-variant'}`}>
            {isRecommended ? 'Lowest Net Audited Cost' : isHighFee ? 'Total Adjusted Cost' : 'Audited Total Cost'}
          </span>
          {isHighFee && <span className="font-label-sm text-label-sm text-error font-semibold">+{diffPercent.toFixed(1)}% vs Match</span>}
        </div>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className={`font-metric-xl text-metric-xl font-extrabold tracking-tight ${isHighFee ? 'text-error' : 'text-on-surface'}`} data-testid={`text-total-cost-${result.id}`}>{money(result.totalCost)}</span>
          <span className={`font-headline-sm text-headline-sm font-bold ${isRecommended ? 'text-primary' : isHighFee ? 'text-error' : 'text-on-surface-variant'}`}>KWD</span>
        </div>
        <div className="flex items-center justify-between text-body-sm font-body-sm mt-space-xs pt-space-xs text-on-surface-variant">
          <span>Base Quote: <strong className={`text-on-surface ${isHighFee ? 'line-through' : ''}`}>{money(base)} KWD</strong></span>
          <span data-testid={`text-fees-${result.id}`}>Verified Fees: <strong className={isRecommended ? 'text-secondary font-semibold' : isHighFee ? 'text-error font-bold' : 'text-on-surface font-semibold'}>+{money(fees)} KWD</strong></span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-space-xs mt-space-sm relative z-10">
        <div className="bg-surface-container-low/90 p-space-sm rounded-xl flex flex-col justify-between">
          <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
            <Truck size={15} className={isRecommended ? 'text-primary' : isHighFee ? '' : 'text-secondary'}/> Lead Time
          </span>
          <div className="mt-2 flex items-center gap-1.5">
            <span className={`font-headline-sm text-headline-sm font-bold ${isFastest ? 'text-secondary' : 'text-on-surface'}`} data-testid={`text-delivery-${result.id}`}>{result.deliveryTime} Days</span>
            {result.isFastestDelivery && <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${isRecommended ? 'bg-primary/10 text-primary' : 'bg-secondary/15 text-secondary font-bold'}`} data-testid={`status-fastest-delivery-${result.id}`}>Fastest</span>}
          </div>
        </div>
        <div className="bg-surface-container-low/90 p-space-sm rounded-xl flex flex-col justify-between">
          <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
            <Banknote size={15} className={isRecommended ? 'text-secondary' : isHighFee ? 'text-tertiary' : 'text-on-surface-variant'}/> Payment Term
          </span>
          <div className="mt-2 flex items-center gap-1">
            <span className={`font-headline-sm text-headline-sm font-bold ${isHighFee ? 'text-tertiary' : 'text-on-surface'}`} data-testid={`text-terms-${result.id}`}>{result.paymentTerms} Net</span>
          </div>
        </div>
      </div>
      
      {isRecommended ? (
        <div className="mt-space-sm p-space-sm rounded-xl bg-secondary/10 flex items-center justify-between relative z-10" data-testid={`status-lowest-cost-${result.id}`}>
          <div className="flex items-center gap-space-xs">
            <ShieldCheck size={20} className="text-secondary" />
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-secondary font-bold">0 KWD Hidden Fees</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Cleared GCC customs standard</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm font-semibold">Clean Audit</span>
        </div>
      ) : isHighFee ? (
        <div className="mt-space-sm p-space-sm rounded-xl bg-error/15 flex items-start gap-space-xs">
          <AlertCircle size={20} className="text-error shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-error font-bold">HIGH RISK UNBUNDLED FEES</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">+{money(fees)} KWD unlisted surcharges excluded.</span>
          </div>
        </div>
      ) : (
        <div className="mt-space-sm p-space-sm rounded-xl bg-surface-container-high flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <CheckCheck size={20} className="text-secondary" />
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface font-semibold">Disclosed Standard Fees</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Documented offload</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-surface-bright text-on-surface font-label-sm text-label-sm">Passed</span>
        </div>
      )}
      
      <div className="mt-space-md pt-space-xs flex items-center gap-space-xs relative z-10">
        <button className={`w-full h-12 rounded-xl font-label-lg text-label-lg font-semibold flex items-center justify-center gap-2 transition-colors ${isRecommended ? 'bg-primary text-on-primary font-bold shadow-lg shadow-primary/30 active:scale-[0.99]' : isHighFee ? 'bg-surface-container-highest hover:bg-error-container/40 text-on-surface' : 'bg-surface-container-highest hover:bg-surface-bright text-on-surface'}`} type="button">
          {isRecommended && <CheckCheck size={20}/>}
          {isRecommended ? `Select ${result.vendorName}` : isHighFee ? 'Request Fee Breakdown' : `Select ${result.vendorName} (Expedited)`}
        </button>
      </div>
    </div>
  );
}

function NavItem({ label, icon: Icon, active, onClick }: any) {
  return (
    <button type="button" onClick={onClick} className={`flex flex-col items-center justify-center gap-space-xs w-28 h-12 rounded-lg transition-colors ${active ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-on-surface'}`}>
      <Icon size={20} />
      <span className="font-label-sm text-label-sm text-center leading-none">{label}</span>
    </button>
  );
}

function Home() {
  const [vendors, setVendors] = useState<VendorQuote[]>([emptyQuote(1), emptyQuote(2)]);
  const [results, setResults] = useState<QuoteResult[] | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'compare' | 'analysis' | 'vendors'>('compare');
  const [activeVendorIndex, setActiveVendorIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const comparisonMutation = useCreateComparison();
  const checkoutSessionId = new URLSearchParams(window.location.search).get('session_id');
  const checkoutSessionParams = { sessionId: checkoutSessionId ?? '' };
  const checkoutSession = useGetBillingCheckoutSession(
    checkoutSessionParams,
    {
      query: {
        queryKey: getGetBillingCheckoutSessionQueryKey(checkoutSessionParams),
        enabled: Boolean(checkoutSessionId),
        retry: false,
      },
    },
  );
  const [billingError, setBillingError] = useState(false);
  const checkoutMutation = useCreateBillingCheckout({
    mutation: {
      onSuccess: ({ url }) => window.location.assign(url),
      onError: () => setBillingError(true),
    },
  });
  const hasActivePro =
    checkoutSession.data?.status === 'complete' &&
    ['active', 'trialing'].includes(checkoutSession.data.subscriptionStatus ?? '');

  const startCheckout = () => {
    setBillingError(false);
    checkoutMutation.mutate();
  };

  const updateVendor = (id: number, field: keyof VendorQuote, value: string) => {
    setVendors((current) =>
      current.map((vendor) => (vendor.id === id ? { ...vendor, [field]: value } : vendor)),
    );
    setResults(null);
    setError('');
  };

  const addVendor = () => {
    if (vendors.length >= 3) return;
    setVendors((current) => {
      const next = [...current, emptyQuote(Date.now())];
      setTimeout(() => scrollToIndex(next.length - 1), 50);
      return next;
    });
  };

  const removeVendor = (id: number) => {
    setVendors((current) => {
      const filtered = current.filter((vendor) => vendor.id !== id);
      if (activeVendorIndex >= filtered.length) {
        setActiveVendorIndex(Math.max(0, filtered.length - 1));
      }
      return filtered;
    });
    setResults(null);
  };

  const reset = () => {
    setVendors([emptyQuote(1), emptyQuote(2)]);
    setResults(null);
    setError('');
    setActiveVendorIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToIndex = (index: number) => {
    setActiveVendorIndex(index);
    if (trackRef.current) {
      const cardWidth = trackRef.current.offsetWidth;
      trackRef.current.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
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
      setError('Complete every field for each vendor before comparing.');
      return;
    }

    setError('');
    comparisonMutation.mutate(
      {
        data: {
          vendors: vendors.map((vendor) => ({
            id: vendor.id,
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
          const finalResults: QuoteResult[] = comparison.vendors.map((vendor) => ({
            ...vendor,
            quotedPrice: String(vendor.quotedPrice),
            additionalFees: String(vendor.additionalFees),
            deliveryTime: String(vendor.deliveryTime),
          }));

          setResults(finalResults);
          setActiveTab('analysis');
          const recommendedIndex = finalResults.findIndex(
            (result) => result.isRecommended,
          );
          setActiveVendorIndex(recommendedIndex >= 0 ? recommendedIndex : 0);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        onError: () => {
          setError(
            'Farrez could not save this comparison. Please try again.',
          );
        },
      },
    );
  };

  const renderCompare = () => (
    <div className="flex flex-col w-full gap-space-lg">
      <div className="flex flex-col gap-space-xs pt-space-xs">
        <div className="inline-flex items-center gap-space-xs self-start px-space-sm py-1 rounded-full bg-primary/10">
          <BadgeCheck size={16} className="text-primary" />
          <span className="font-label-sm text-label-sm text-primary tracking-wide">Procurement Matrix • Kuwait</span>
        </div>
        <h1 className="font-headline-xl-mobile text-headline-xl-mobile text-on-surface tracking-tight">Compare Vendor Quotations</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Evaluate commercial proposals with automated fee auditing (KWD).</p>
      </div>

      <div className="grid grid-cols-2 gap-space-sm">
        <div className="flex flex-col p-space-md rounded-2xl bg-surface-container shadow-md">
          <div className="flex items-center justify-between mb-space-xs">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Active RFQ</span>
            <Package size={18} className="text-secondary" />
          </div>
          <span className="font-metric-md text-metric-md text-on-surface">RFQ-2025-084</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant truncate">Industrial Hardware</span>
        </div>
        <div className="flex flex-col p-space-md rounded-2xl bg-surface-container shadow-md">
          <div className="flex items-center justify-between mb-space-xs">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Median Estimate</span>
            <BarChart2 size={18} className="text-primary" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-metric-md text-metric-md text-primary">4,720</span>
            <span className="font-label-sm text-label-sm text-primary/70">KWD</span>
          </div>
          <span className="font-body-sm text-body-sm text-secondary truncate">{vendors.length} Valid Offers</span>
        </div>
      </div>

      <div className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <span className="font-headline-sm text-headline-sm text-on-surface">Bidders Carousel</span>
          <div className="flex items-center gap-space-xs">
            <button type="button" onClick={() => scrollToIndex(Math.max(0, activeVendorIndex - 1))} className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"><ChevronLeft size={18}/></button>
            <span className="font-label-sm text-label-sm text-on-surface-variant px-1.5">{activeVendorIndex + 1} of {vendors.length}</span>
            <button type="button" onClick={() => scrollToIndex(Math.min(vendors.length - 1, activeVendorIndex + 1))} className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"><ChevronRight size={18}/></button>
          </div>
        </div>
        
        <div className="flex items-center gap-space-xs overflow-x-auto pb-1 no-scrollbar">
          {vendors.map((v, i) => (
            <button type="button" key={v.id} onClick={() => scrollToIndex(i)} className={`vendor-tab px-space-md py-2 rounded-full font-label-md text-label-md shrink-0 transition-all flex items-center gap-1.5 ${activeVendorIndex === i ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container text-on-surface-variant hover:text-on-surface'}`}>
              {i === 0 ? <Truck size={16}/> : i === 1 ? <Network size={16}/> : <Store size={16}/>}
              <span>{v.vendorName || `Vendor ${String.fromCharCode(65 + i)}`}</span>
            </button>
          ))}
          {vendors.length < 3 && (
            <button type="button" data-testid="button-add-vendor" onClick={addVendor} className="px-space-md py-2 rounded-full font-label-md text-label-md bg-surface-container-high text-on-surface-variant hover:text-on-surface shrink-0 transition-all flex items-center gap-1.5 border border-dashed border-outline-variant">
              <Plus size={16} /> <span>Add Vendor</span>
            </button>
          )}
        </div>
      </div>

      <form onSubmit={compare} className="flex flex-col gap-space-lg w-full">
        <div 
          className="flex gap-space-md overflow-x-auto snap-x snap-mandatory scroll-smooth pb-space-sm pt-1 no-scrollbar"
          ref={trackRef}
          onScroll={handleScroll}
        >
          {vendors.map((v, i) => (
            <div key={v.id} className="min-w-full snap-center shrink-0">
              <VendorCard quote={v} index={i} canRemove={vendors.length === 3 && i === vendors.length - 1} onChange={(f: any, val: any) => updateVendor(v.id, f, val)} onRemove={() => removeVendor(v.id)} />
            </div>
          ))}
        </div>
        
        {error ? (
          <div className="p-space-sm rounded-xl bg-error/15 flex items-center gap-space-xs text-error font-label-sm text-label-sm font-bold" data-testid="status-validation-error">
            <AlertCircle size={18}/>
            {error}
          </div>
        ) : (
          <div className="p-space-md rounded-2xl bg-surface-container flex items-center justify-between">
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

        <div className="pt-space-xs flex flex-col gap-space-xs">
          <button type="submit" disabled={comparisonMutation.isPending} data-testid="button-compare-quotes" className="w-full h-14 rounded-2xl bg-primary text-on-primary font-headline-sm text-headline-sm flex items-center justify-center gap-space-sm shadow-[0_0_24px_-4px_rgba(77,142,255,0.45)] hover:shadow-[0_0_32px_0px_rgba(77,142,255,0.6)] active:scale-[0.99] transition-all disabled:cursor-wait disabled:opacity-70">
            <LineChart size={22} />
            <span>{comparisonMutation.isPending ? 'Comparing Vendors' : `Compare ${vendors.length} Vendors`}</span>
            <ArrowRight size={20} />
          </button>
          <div className="flex items-center justify-center gap-1 text-center">
            <Lock size={14} className="text-secondary" />
            <span className="font-label-sm text-label-sm text-on-surface-variant">Strictly Audited & Encrypted Kuwait Tender Portal</span>
          </div>
        </div>
      </form>
    </div>
  );

  const renderAnalysis = () => {
    if (!results) {
      return (
        <div className="flex flex-col items-center justify-center pt-24 text-on-surface-variant">
          <AlertCircle size={48} className="mb-4 opacity-50" />
          <p className="font-headline-md text-headline-md">No Analysis Available</p>
          <p className="font-body-md text-body-md mt-2 mb-6 text-center">Complete a quotation comparison first.</p>
          <button onClick={() => setActiveTab('compare')} className="px-6 py-3 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold">Go to Compare</button>
        </div>
      );
    }
    
    const lowestCostResult = results.find(r => r.isLowestCost);
    const fastestResult = results.find(r => r.isFastestDelivery);
    const highestFee = Math.max(...results.map(r => numberFrom(r.additionalFees)));
    const highestFeeResult = results.find(r => numberFrom(r.additionalFees) === highestFee);
    
    return (
      <div data-testid="section-results" className="flex flex-col w-full space-y-space-md">
        <div className="relative w-full rounded-2xl bg-surface-container-low p-space-md overflow-hidden shadow-xl">
          <div className="absolute -top-16 -right-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col gap-1">
            <div className="flex items-center gap-space-xs">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary"><Activity size={14}/></span>
              <span className="font-label-sm text-label-sm tracking-wider uppercase text-primary font-semibold">GCC Engine V4.2</span>
              <span className="w-1 h-1 rounded-full bg-outline"></span>
              <span className="font-label-sm text-label-sm text-secondary font-medium">Auto-Audit Verified</span>
            </div>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold tracking-tight">Procurement Decision Matrix</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Audited comparison across {results.length} supplier bids (All amounts in KWD)</p>
          </div>
          
          <div className="relative z-10 grid grid-cols-3 gap-space-xs mt-space-md pt-space-xs">
            <div className="flex flex-col bg-surface-container-high/70 backdrop-blur-md rounded-xl p-space-sm">
              <div className="flex items-center gap-1 text-on-surface-variant">
                <Banknote size={15} className="text-secondary"/>
                <span className="font-label-sm text-label-sm">Lowest Cost</span>
              </div>
              <span className="font-metric-md text-metric-md text-on-surface font-extrabold mt-1">{lowestCostResult ? money(lowestCostResult.totalCost) : '-'}</span>
              <span className="font-label-sm text-label-sm text-secondary font-medium tracking-tight truncate">{lowestCostResult?.vendorName || '-'}</span>
            </div>
            <div className="flex flex-col bg-surface-container-high/70 backdrop-blur-md rounded-xl p-space-sm">
              <div className="flex items-center gap-1 text-on-surface-variant">
                <Timer size={15} className="text-primary"/>
                <span className="font-label-sm text-label-sm">Fastest Delivery</span>
              </div>
              <span className="font-metric-md text-metric-md text-on-surface font-extrabold mt-1">{fastestResult?.deliveryTime} Days</span>
              <span className="font-label-sm text-label-sm text-primary font-medium tracking-tight truncate">{fastestResult?.vendorName}</span>
            </div>
            <div className="flex flex-col bg-surface-container-high/70 backdrop-blur-md rounded-xl p-space-sm">
              <div className="flex items-center gap-1 text-on-surface-variant">
                <PenTool size={15} className="text-error"/>
                <span className="font-label-sm text-label-sm">Fee Surcharges</span>
              </div>
              <span className="font-metric-md text-metric-md text-error font-extrabold mt-1">+{highestFee ? money(highestFee) : '0'}</span>
              <span className="font-label-sm text-label-sm text-error font-medium tracking-tight truncate">{highestFeeResult?.vendorName}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between gap-space-xs px-1">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
            {results.map((r, i) => (
              <button key={r.id} onClick={() => setActiveVendorIndex(i)} className={`tab-pill px-3 py-1.5 rounded-full font-label-sm text-label-sm flex items-center gap-1.5 transition-all duration-200 ${activeVendorIndex === i ? 'bg-primary text-on-primary shadow-md shadow-primary/20 font-semibold' : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'}`}>
                {r.isRecommended && <BadgeCheck size={15} />}
                {!r.isRecommended && r.totalCost > lowestCostResult!.totalCost && <span className="w-1.5 h-1.5 rounded-full bg-error"></span>}
                <span>{r.vendorName || `Vendor ${String.fromCharCode(65+i)}`}</span>
              </button>
            ))}
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant shrink-0">{activeVendorIndex + 1} of {results.length}</span>
        </div>
        
        <div className="relative w-full">
          {results.map((r, i) => {
            if (i !== activeVendorIndex) return null;
            return <ResultCard key={r.id} result={r} lowestCost={lowestCostResult?.totalCost || 0} />
          })}
        </div>
        
        <div className="w-full rounded-2xl bg-surface-container-low p-space-md">
          <div className="flex items-center justify-between pb-space-sm">
            <div className="flex items-center gap-1.5">
              <Scale size={18} className="text-primary"/>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Side-by-Side Delta</h3>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant">{results.length} Audited Bids</span>
          </div>
          <div className="space-y-space-xs pt-space-xs">
            {results.map(r => (
              <div key={r.id} className="p-space-sm rounded-xl bg-surface-container flex items-center justify-between">
                <span className="font-body-sm text-body-sm text-on-surface-variant font-medium truncate pr-2">{r.vendorName || `Vendor ${r.id}`}</span>
                <div className="flex items-center gap-space-sm text-right shrink-0">
                  {r.isRecommended ? (
                    <span className="font-label-sm text-label-sm text-secondary bg-secondary/10 px-2 py-0.5 rounded-full font-bold">{r.deliveryTime}d Net</span>
                  ) : (
                    <span className={`font-label-sm text-label-sm px-2 py-0.5 rounded-full font-medium ${numberFrom(r.additionalFees) > 0 ? 'text-error bg-error/15' : 'text-on-surface-variant bg-surface-container-high'}`}>
                      {numberFrom(r.additionalFees) > 0 ? `+${money(numberFrom(r.additionalFees))} Fee` : `${r.deliveryTime}d Net`}
                    </span>
                  )}
                  <span className={`font-headline-sm text-headline-sm font-bold ${r.isRecommended ? 'text-primary' : r.totalCost > lowestCostResult!.totalCost ? 'text-error font-semibold' : 'text-on-surface font-semibold'}`}>{money(r.totalCost)} KWD</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col gap-space-xs pt-space-xs pb-space-sm">
          <button className="w-full h-14 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary/25 transition-all">
            <BadgeCheck size={20} />
            Select {lowestCostResult?.vendorName} ({money(lowestCostResult?.totalCost || 0)} KWD)
          </button>
          <button type="button" data-testid="button-new-comparison" onClick={() => { setActiveTab('compare'); reset(); }} className="w-full h-12 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-lg text-label-lg font-medium flex items-center justify-center gap-2 transition-colors">
            <Download size={18} />
            Export Decision Report (KWD)
          </button>
        </div>
      </div>
    );
  };

  const renderVendors = () => (
    <div className="flex flex-col items-center justify-center pt-24 text-on-surface-variant">
      <Store size={48} className="mb-4 opacity-50" />
      <p className="font-headline-md text-headline-md text-on-surface">Vendor Directory</p>
      <p className="font-body-md text-body-md mt-2 mb-6 text-center">Access saved commercial licenses and histories.</p>
      <button className="px-6 py-3 rounded-xl bg-surface-container-high text-on-surface-variant font-label-lg text-label-lg font-bold cursor-not-allowed">Coming Soon</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface w-full">
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/80 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-gutter-sm flex items-center justify-between gap-space-sm max-w-3xl mx-auto">
          <div className="flex items-center gap-space-sm min-w-0" data-testid="brand-farrez">
            <img alt="Farrez Logo" className="h-8 w-8 object-contain shrink-0" src="/farrez-logo.png" />
            <div className="flex flex-col min-w-0">
              <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight truncate">Farrez</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant truncate">
                {activeTab === 'analysis' ? 'Results And Analysis' : activeTab === 'vendors' ? 'Vendor Directory' : 'Compare Quotations'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm shrink-0">
            <button
              type="button"
              onClick={startCheckout}
              disabled={checkoutMutation.isPending || hasActivePro}
              data-testid="button-farrez-pro"
              title={billingError ? 'Stripe Checkout is temporarily unavailable.' : 'Farrez Pro — 55 AED monthly'}
              className="flex items-center gap-space-xs bg-primary/15 hover:bg-primary/25 disabled:hover:bg-primary/15 px-space-sm py-1.5 rounded-full text-primary transition-colors disabled:cursor-default"
            >
              <CreditCard size={15} />
              <span className="font-label-sm text-label-sm font-semibold whitespace-nowrap">
                {checkoutMutation.isPending
                  ? 'Opening…'
                  : billingError
                    ? 'Try Again'
                    : hasActivePro
                      ? 'Pro Active'
                      : 'Farrez Pro'}
              </span>
            </button>
            <div className="flex items-center gap-space-xs bg-surface-container-high/90 px-space-sm py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              <span className="font-label-sm text-label-sm text-secondary font-semibold tracking-wider">KWD</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <User size={18} className="text-on-primary" />
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex flex-col relative w-full pt-16 pb-24 px-gutter-sm bg-surface min-h-screen max-w-3xl mx-auto">
        {activeTab === 'compare' && renderCompare()}
        {activeTab === 'analysis' && renderAnalysis()}
        {activeTab === 'vendors' && renderVendors()}
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface/85 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-around h-16 px-gutter-sm max-w-3xl mx-auto">
          <NavItem 
            label="Compare" 
            icon={FileText} 
            active={activeTab === 'compare'} 
            onClick={() => setActiveTab('compare')} 
          />
          <NavItem 
            label="Analysis" 
            icon={BarChart2} 
            active={activeTab === 'analysis'} 
            onClick={() => setActiveTab('analysis')} 
          />
          <NavItem 
            label="Vendors" 
            icon={Store} 
            active={activeTab === 'vendors'} 
            onClick={() => setActiveTab('vendors')} 
          />
        </div>
      </nav>
    </div>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
