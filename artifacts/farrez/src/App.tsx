import { type FormEvent, type ReactNode, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  Calculator,
  ChevronRight,
  CircleHelp,
  Clock3,
  FilePlus2,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
  WalletCards,
} from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

type VendorQuote = {
  id: number;
  vendorName: string;
  quotedPrice: string;
  additionalFees: string;
  deliveryTime: string;
  paymentTerms: string;
};

type QuoteResult = VendorQuote & {
  totalCost: number;
  isRecommended: boolean;
  isLowestCost: boolean;
  isFastestDelivery: boolean;
};

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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const numberFrom = (value: string) => {
  if (value.trim() === '') return Number.NaN;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

function Field({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  suffix,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'number';
  placeholder: string;
  suffix?: string;
}) {
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">
        {label}
      </span>
      <span className="relative block">
        <input
          id={id}
          data-testid={`input-${id}`}
          className={`input-shell h-11 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background)/.58)] px-3.5 text-sm font-medium text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground)/.65)] ${suffix ? 'pr-14' : ''}`}
          type={type}
          min={type === 'number' ? '0' : undefined}
          step={type === 'number' ? '0.01' : undefined}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
        />
        {suffix ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-xs text-[hsl(var(--muted-foreground))]">
            {suffix}
          </span>
        ) : null}
      </span>
    </label>
  );
}

function VendorCard({
  quote,
  index,
  canRemove,
  onChange,
  onRemove,
}: {
  quote: VendorQuote;
  index: number;
  canRemove: boolean;
  onChange: (field: keyof VendorQuote, value: string) => void;
  onRemove: () => void;
}) {
  const vendorLabel = `Vendor ${String.fromCharCode(65 + index)}`;

  return (
    <article
      className="vendor-card relative rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-5 shadow-[0_14px_32px_hsl(220_35%_15%/.05)]"
      style={{ animationDelay: `${index * 70}ms` }}
      data-testid={`card-vendor-${quote.id}`}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(var(--primary)/.1)] font-mono text-sm font-medium text-[hsl(var(--primary))]">
            0{index + 1}
          </div>
          <div>
            <p className="font-display text-lg font-bold tracking-[-0.03em] text-[hsl(var(--foreground))]">
              {vendorLabel}
            </p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Quote details</p>
          </div>
        </div>
        {canRemove ? (
          <button
            type="button"
            data-testid={`button-remove-vendor-${quote.id}`}
            onClick={onRemove}
            className="group flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--destructive)/.08)] hover:text-[hsl(var(--destructive))]"
            aria-label={`Remove ${vendorLabel}`}
          >
            <Trash2 size={14} strokeWidth={1.8} />
            <span className="hidden sm:inline">Remove</span>
          </button>
        ) : null}
      </div>

      <div className="space-y-4">
        <Field
          id={`vendor-${quote.id}-name`}
          label="Vendor name"
          value={quote.vendorName}
          onChange={(value) => onChange('vendorName', value)}
          placeholder="e.g. Gulf Office Supplies"
        />
        <div className="grid grid-cols-2 gap-3">
          <Field
            id={`vendor-${quote.id}-price`}
            label="Quoted price"
            value={quote.quotedPrice}
            onChange={(value) => onChange('quotedPrice', value)}
            type="number"
            placeholder="0.00"
            suffix="KWD"
          />
          <Field
            id={`vendor-${quote.id}-fees`}
            label="Additional fees"
            value={quote.additionalFees}
            onChange={(value) => onChange('additionalFees', value)}
            type="number"
            placeholder="0.00"
            suffix="KWD"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field
            id={`vendor-${quote.id}-delivery`}
            label="Delivery time"
            value={quote.deliveryTime}
            onChange={(value) => onChange('deliveryTime', value)}
            type="number"
            placeholder="e.g. 14"
            suffix="days"
          />
          <Field
            id={`vendor-${quote.id}-terms`}
            label="Payment terms"
            value={quote.paymentTerms}
            onChange={(value) => onChange('paymentTerms', value)}
            placeholder="e.g. Net 30"
          />
        </div>
      </div>
    </article>
  );
}

function ResultCard({ result, index }: { result: QuoteResult; index: number }) {
  return (
    <article
      className={`result-panel relative overflow-hidden rounded-2xl border p-5 ${result.isRecommended ? 'border-[hsl(var(--primary)/.45)] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[0_20px_38px_hsl(var(--primary)/.2)]' : 'border-[hsl(var(--card-border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-[0_14px_32px_hsl(220_35%_15%/.05)]'}`}
      style={{ animationDelay: `${index * 90}ms` }}
      data-testid={`result-vendor-${result.id}`}
    >
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <p className={`mb-1 font-mono text-[10px] uppercase tracking-[0.16em] ${result.isRecommended ? 'text-[hsl(var(--primary-foreground)/.7)]' : 'text-[hsl(var(--muted-foreground))]'}`}>
            Vendor 0{index + 1}
          </p>
          <h3 className="font-display text-xl font-bold tracking-[-0.04em]">{result.vendorName}</h3>
        </div>
        {result.isRecommended ? (
          <span className="flex items-center gap-1.5 rounded-full bg-[hsl(var(--primary-foreground)/.15)] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.11em]" data-testid={`status-recommended-vendor-${result.id}`}>
            <BadgeCheck size={14} />
            Recommended Vendor
          </span>
        ) : null}
      </div>

      <div className="mb-4 flex min-h-5 flex-wrap gap-2">
        {result.isLowestCost ? (
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${result.isRecommended ? 'bg-[hsl(var(--primary-foreground)/.15)]' : 'bg-[hsl(var(--accent)/.14)] text-[hsl(15_64%_38%)]'}`} data-testid={`status-lowest-cost-${result.id}`}>
            Lowest Cost
          </span>
        ) : null}
        {result.isFastestDelivery ? (
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${result.isRecommended ? 'bg-[hsl(var(--primary-foreground)/.15)]' : 'bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]'}`} data-testid={`status-fastest-delivery-${result.id}`}>
            Fastest Delivery
          </span>
        ) : null}
      </div>

      <div className={`mb-6 rounded-xl p-3.5 ${result.isRecommended ? 'bg-[hsl(var(--primary-foreground)/.11)]' : 'bg-[hsl(var(--muted)/.55)]'}`}>
        <p className={`mb-1 text-[10px] font-bold uppercase tracking-[0.14em] ${result.isRecommended ? 'text-[hsl(var(--primary-foreground)/.7)]' : 'text-[hsl(var(--muted-foreground))]'}`}>
          Total cost
        </p>
        <p className="font-mono text-2xl font-medium tracking-[-0.04em]" data-testid={`text-total-cost-${result.id}`}>
          {money(result.totalCost)} <span className="text-sm">KWD</span>
        </p>
      </div>

      <dl className="space-y-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className={result.isRecommended ? 'text-[hsl(var(--primary-foreground)/.7)]' : 'text-[hsl(var(--muted-foreground))]'}>Quoted price</dt>
          <dd className="font-mono">{money(numberFrom(result.quotedPrice))} KWD</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className={result.isRecommended ? 'text-[hsl(var(--primary-foreground)/.7)]' : 'text-[hsl(var(--muted-foreground))]'}>Additional Fees</dt>
          <dd className="font-mono" data-testid={`text-fees-${result.id}`}>{money(numberFrom(result.additionalFees))} KWD</dd>
        </div>
        <div className={`my-1 h-px ${result.isRecommended ? 'bg-[hsl(var(--primary-foreground)/.18)]' : 'bg-[hsl(var(--border))]'}`} />
        <div className="flex items-center justify-between gap-3">
          <dt className={result.isRecommended ? 'text-[hsl(var(--primary-foreground)/.7)]' : 'text-[hsl(var(--muted-foreground))]'}>Delivery</dt>
          <dd className="font-mono" data-testid={`text-delivery-${result.id}`}>{result.deliveryTime} days</dd>
        </div>
        <div className="flex items-start justify-between gap-3">
          <dt className={result.isRecommended ? 'text-[hsl(var(--primary-foreground)/.7)]' : 'text-[hsl(var(--muted-foreground))]'}>Payment Terms</dt>
          <dd className="max-w-[58%] text-right font-medium" data-testid={`text-terms-${result.id}`}>{result.paymentTerms}</dd>
        </div>
      </dl>
    </article>
  );
}

function Home() {
  const [vendors, setVendors] = useState<VendorQuote[]>([emptyQuote(1), emptyQuote(2)]);
  const [results, setResults] = useState<QuoteResult[] | null>(null);
  const [error, setError] = useState('');
  const resultsRef = useRef<HTMLElement>(null);

  const updateVendor = (id: number, field: keyof VendorQuote, value: string) => {
    setVendors((current) =>
      current.map((vendor) => (vendor.id === id ? { ...vendor, [field]: value } : vendor)),
    );
    setResults(null);
    setError('');
  };

  const addVendor = () => {
    if (vendors.length >= 3) return;
    setVendors((current) => [...current, emptyQuote(3)]);
  };

  const removeVendor = (id: number) => {
    setVendors((current) => current.filter((vendor) => vendor.id !== id));
    setResults(null);
  };

  const reset = () => {
    setVendors([emptyQuote(1), emptyQuote(2)]);
    setResults(null);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const compare = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const invalid = vendors.some((vendor) => {
      return (
        vendor.vendorName.trim() === '' ||
        Number.isNaN(numberFrom(vendor.quotedPrice)) ||
        Number.isNaN(numberFrom(vendor.additionalFees)) ||
        Number.isNaN(numberFrom(vendor.deliveryTime)) ||
        vendor.paymentTerms.trim() === ''
      );
    });

    if (invalid) {
      setError('Complete every field for each vendor before comparing.');
      return;
    }

    const calculated = vendors.map((vendor) => ({
      ...vendor,
      totalCost: numberFrom(vendor.quotedPrice) + numberFrom(vendor.additionalFees),
      isRecommended: false,
      isLowestCost: false,
      isFastestDelivery: false,
    }));
    const winner = calculated.reduce((best, vendor) => {
      if (vendor.totalCost < best.totalCost) return vendor;
      if (vendor.totalCost === best.totalCost && numberFrom(vendor.deliveryTime) < numberFrom(best.deliveryTime)) return vendor;
      return best;
    }, calculated[0]);
    const lowestCost = Math.min(...calculated.map((vendor) => vendor.totalCost));
    const fastestDelivery = Math.min(...calculated.map((vendor) => numberFrom(vendor.deliveryTime)));
    const finalResults = calculated.map((vendor) => ({
      ...vendor,
      isRecommended: vendor.id === winner.id,
      isLowestCost: vendor.totalCost === lowestCost,
      isFastestDelivery: numberFrom(vendor.deliveryTime) === fastestDelivery,
    }));

    setError('');
    setResults(finalResults);
    requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  return (
    <main className="app-noise min-h-[100dvh] overflow-x-hidden">
      <header className="mx-auto flex w-full max-w-[1240px] items-center justify-between px-5 py-6 sm:px-8 lg:px-12">
        <div className="flex items-center gap-3" data-testid="brand-farrez">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-[11px] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[0_8px_18px_hsl(var(--primary)/.25)]">
            <ShieldCheck size={19} strokeWidth={2.3} />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[hsl(var(--background))] bg-[hsl(var(--accent))]" />
          </div>
          <span className="font-display text-[21px] font-extrabold tracking-[-0.06em]">farrez</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">
          <span className="hidden sm:inline">Quotation decision desk</span>
          <CircleHelp size={16} strokeWidth={1.8} />
        </div>
      </header>

      <div className="mx-auto max-w-[1240px] px-5 pb-16 sm:px-8 lg:px-12">
        <section className="relative grid gap-10 pb-14 pt-10 md:grid-cols-[1.1fr_.9fr] md:items-end md:gap-16 md:pt-20">
          <div className="absolute -left-20 top-10 -z-10 h-52 w-52 rounded-full bg-[hsl(var(--accent)/.14)] blur-3xl" />
          <div>
            <div className="mb-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.17em] text-[hsl(var(--primary))]">
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" />
              Compare with confidence
            </div>
            <h1 className="max-w-[680px] font-display text-[clamp(2.7rem,6vw,5.9rem)] font-extrabold leading-[.93] tracking-[-0.085em] text-[hsl(var(--foreground))]">
              Turn three quotes into <span className="text-[hsl(var(--primary))]">one clear call.</span>
            </h1>
          </div>
          <div className="max-w-[390px] pb-1 md:justify-self-end">
            <p className="text-[15px] leading-7 text-[hsl(var(--muted-foreground))]">
              Farrez makes the final procurement decision easy to explain: total cost first, delivery speed as the tie-breaker.
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-[hsl(var(--foreground))]">
              <Sparkles size={15} className="text-[hsl(var(--accent))]" />
              Built for the last five minutes before approval.
            </div>
          </div>
        </section>

        <div className="mb-10 h-px bg-[hsl(var(--border))]" />

        <form onSubmit={compare}>
          <section aria-labelledby="quote-details-heading">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">01 / Input</p>
                <h2 id="quote-details-heading" className="font-display text-2xl font-bold tracking-[-0.05em] sm:text-3xl">Quote details</h2>
                <p className="mt-1.5 text-sm text-[hsl(var(--muted-foreground))]">Enter the numbers exactly as they appear on each quotation.</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                <Calculator size={15} />
                {vendors.length} of 3 vendors
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {vendors.map((vendor, index) => (
                <VendorCard
                  key={vendor.id}
                  quote={vendor}
                  index={index}
                  canRemove={vendors.length === 3}
                  onChange={(field, value) => updateVendor(vendor.id, field, value)}
                  onRemove={() => removeVendor(vendor.id)}
                />
              ))}
              {vendors.length === 2 ? (
                <button
                  type="button"
                  data-testid="button-add-vendor"
                  onClick={addVendor}
                  className="group flex min-h-[290px] flex-col items-center justify-center rounded-2xl border border-dashed border-[hsl(var(--primary)/.35)] bg-[hsl(var(--primary)/.035)] p-5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-[hsl(var(--primary)/.7)] hover:bg-[hsl(var(--primary)/.07)]"
                >
                  <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-[hsl(var(--primary)/.32)] bg-[hsl(var(--card))] text-[hsl(var(--primary))] transition-transform duration-200 group-hover:scale-105">
                    <Plus size={20} strokeWidth={2.2} />
                  </span>
                  <span className="font-display text-base font-bold tracking-[-0.03em] text-[hsl(var(--foreground))]">Add a third vendor</span>
                  <span className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">Optional, if you have another quote</span>
                </button>
              ) : null}
            </div>

            {error ? (
              <div className="mt-5 flex items-center gap-2 rounded-xl border border-[hsl(var(--destructive)/.25)] bg-[hsl(var(--destructive)/.07)] px-4 py-3 text-sm font-medium text-[hsl(var(--destructive))]" role="alert" data-testid="status-validation-error">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                {error}
              </div>
            ) : null}

            <div className="mt-8 flex flex-col-reverse justify-between gap-4 border-t border-[hsl(var(--border))] pt-6 sm:flex-row sm:items-center">
              <p className="flex items-center gap-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
                <WalletCards size={15} />
                Total cost = quoted price + additional fees
              </p>
              <button
                type="submit"
                data-testid="button-compare-quotes"
                className="group flex h-12 items-center justify-center gap-3 rounded-xl bg-[hsl(var(--primary))] px-6 text-sm font-bold text-[hsl(var(--primary-foreground))] shadow-[0_10px_22px_hsl(var(--primary)/.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[hsl(221_78%_42%)] hover:shadow-[0_14px_26px_hsl(var(--primary)/.27)] active:translate-y-0"
              >
                Compare quotations
                <ArrowRight size={17} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
            </div>
          </section>
        </form>

        {results ? (
          <section ref={resultsRef} className="scroll-mt-6 pt-20" aria-labelledby="recommendation-heading" data-testid="section-results">
            <div className="mb-7 flex flex-col justify-between gap-5 border-t border-[hsl(var(--border))] pt-8 sm:flex-row sm:items-end">
              <div>
                <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">02 / Decision</p>
                <h2 id="recommendation-heading" className="font-display text-3xl font-bold tracking-[-0.06em] sm:text-4xl">The clear call</h2>
                <p className="mt-1.5 text-sm text-[hsl(var(--muted-foreground))]">Reviewed by total cost. Delivery speed breaks a tie.</p>
              </div>
              <div className="flex items-center gap-2 self-start rounded-full bg-[hsl(var(--accent)/.14)] px-3 py-2 text-xs font-bold text-[hsl(15_64%_38%)] sm:self-auto">
                <BadgeCheck size={15} />
                Recommendation ready
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {results.map((result, index) => <ResultCard key={result.id} result={result} index={index} />)}
            </div>

            <div className="mt-6 grid gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.58)] p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
              <div className="flex gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]">
                  <Clock3 size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold">How Farrez decides</p>
                  <p className="mt-1 max-w-[610px] text-sm leading-6 text-[hsl(var(--muted-foreground))]">
                    The recommendation goes to the lowest total cost. If costs match, the vendor with the shorter delivery time wins.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--primary))]">
                <span>Defensible by design</span>
                <ArrowDown size={15} className="rotate-[-90deg]" />
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                type="button"
                data-testid="button-new-comparison"
                onClick={reset}
                className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted)/.7)] hover:text-[hsl(var(--foreground))]"
              >
                <RotateCcw size={15} />
                Start a new comparison
                <ChevronRight size={15} />
              </button>
            </div>
          </section>
        ) : null}

        <footer className="mt-20 flex flex-col gap-3 border-t border-[hsl(var(--border))] pt-5 text-[11px] font-medium text-[hsl(var(--muted-foreground))] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <FilePlus2 size={14} />
            Keep the decision moving.
          </div>
          <span className="font-mono uppercase tracking-[0.12em]">KWD / Procurement desk</span>
        </footer>
      </div>
    </main>
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