import { useGetBillingCheckoutSession, getGetBillingCheckoutSessionQueryKey, useGetBillingPlan, useCreateBillingCheckout } from "@workspace/api-client-react";
import { CreditCard, CheckCircle2, Shield, Zap, Activity, AlertCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Pro() {
  const [billingError, setBillingError] = useState(false);
  
  const urlParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
  const checkoutSessionId = urlParams.get("session_id");
  const checkoutStatus = urlParams.get("checkout");
  const isCanceled = checkoutStatus === "cancelled";
  const isSuccess = checkoutStatus === "success";
  
  const checkoutSessionParams = { sessionId: checkoutSessionId ?? "" };
  
  const { data: checkoutData, isLoading: isLoadingSession } = useGetBillingCheckoutSession(checkoutSessionParams, {
    query: {
      queryKey: getGetBillingCheckoutSessionQueryKey(checkoutSessionParams),
      enabled: Boolean(checkoutSessionId),
      retry: false,
    },
  });

  const { data: plan, isLoading: isLoadingPlan } = useGetBillingPlan();

  const checkoutMutation = useCreateBillingCheckout({
    mutation: {
      onSuccess: ({ url }) => window.location.assign(url),
      onError: () => setBillingError(true),
    },
  });

  const hasActivePro =
    checkoutData?.status === "complete" &&
    checkoutData?.paymentStatus === "paid" &&
    isSuccess;

  const startCheckout = () => {
    setBillingError(false);
    checkoutMutation.mutate();
  };

  if (isLoadingPlan || (checkoutSessionId && isLoadingSession)) {
    return (
      <div className="flex flex-col items-center justify-center pt-24 text-on-surface-variant animate-pulse">
        <Activity size={48} className="mb-4 opacity-50 text-primary" />
        <p className="font-headline-md text-headline-md text-on-surface">Loading Subscription Details...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full gap-space-lg animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto pb-32">
      
      {checkoutSessionId && hasActivePro && (
        <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20 flex items-start gap-3 mt-4">
          <CheckCircle2 className="text-secondary shrink-0 mt-0.5" size={24} />
          <div>
            <h3 className="font-headline-sm text-secondary font-bold">Subscription Active</h3>
            <p className="font-body-sm text-on-surface mt-1">Your Farrez Pro subscription was successful. You now have access to premium features.</p>
          </div>
        </div>
      )}
      
      {isCanceled && (
        <div className="p-4 rounded-xl bg-surface-container-high border border-outline-variant/20 flex items-start gap-3 mt-4">
          <XCircle className="text-on-surface-variant shrink-0 mt-0.5" size={24} />
          <div>
            <h3 className="font-headline-sm text-on-surface font-bold">Checkout Canceled</h3>
            <p className="font-body-sm text-on-surface-variant mt-1">You canceled the checkout process. Your account has not been charged.</p>
          </div>
        </div>
      )}

      {billingError && (
        <div className="p-4 rounded-xl bg-error/10 border border-error/20 flex items-start gap-3 mt-4">
          <AlertCircle className="text-error shrink-0 mt-0.5" size={24} />
          <div>
            <h3 className="font-headline-sm text-error font-bold">Checkout Unavailable</h3>
            <p className="font-body-sm text-on-surface mt-1">We couldn't start the checkout process. Please try again later.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center text-center gap-space-xs pt-8 pb-4">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-2 border border-primary/20">
          <CreditCard size={32} className="text-primary" />
        </div>
        <h1 className="font-headline-xl-mobile sm:text-4xl text-on-surface font-bold tracking-tight">
          Farrez <span className="text-primary">Pro</span>
        </h1>
        <p className="font-body-md text-on-surface-variant max-w-md mx-auto mt-2">
          Unlock unlimited historical insights, bulk vendor imports, and advanced procurement analytics.
        </p>
      </div>

      <div className="bg-surface-container-low rounded-3xl p-6 sm:p-8 border border-outline-variant/10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center border-b border-outline-variant/10 pb-6 mb-6">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-4 border border-primary/20">
            {plan?.name || "Professional Plan"}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-metric-xl text-5xl text-on-surface font-extrabold tracking-tight">
              {plan ? (plan.unitAmount / 100).toFixed(0) : "55"}
            </span>
            <span className="font-headline-sm text-on-surface-variant font-medium">
              {plan?.currency.toUpperCase() || "AED"} / {plan?.interval || "month"}
            </span>
          </div>
          <p className="text-sm text-on-surface-variant mt-2 text-center max-w-sm">
            {plan?.description || "Billed monthly. Cancel anytime."}
          </p>
        </div>

        <div className="relative z-10 space-y-4 mb-8">
          {[
            { icon: Shield, text: "Unlimited comparison snapshots and historical audit tracking" },
            { icon: Zap, text: "Priority access to GCC Matrix updates and custom fee formulas" },
            { icon: Activity, text: "Advanced supplier performance insights and win-rate analytics" },
            { icon: CheckCircle2, text: "Export customized decision reports with your company logo" }
          ].map((feature, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-0.5 bg-surface-container rounded-full p-1 border border-outline-variant/5">
                <feature.icon size={16} className="text-primary" />
              </div>
              <span className="text-on-surface text-sm sm:text-base">{feature.text}</span>
            </div>
          ))}
        </div>

        <button
          onClick={startCheckout}
          disabled={checkoutMutation.isPending || hasActivePro}
          className="relative z-10 w-full h-14 rounded-xl bg-primary text-on-primary font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary disabled:hover:shadow-primary/25 flex items-center justify-center gap-2"
        >
          {checkoutMutation.isPending ? (
            <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
          ) : hasActivePro ? (
            <CheckCircle2 size={20} />
          ) : (
            <CreditCard size={20} />
          )}
          {checkoutMutation.isPending ? "Connecting to Stripe..." : hasActivePro ? "Current Plan" : "Subscribe with Stripe"}
        </button>
        
        <p className="text-center text-xs text-on-surface-variant mt-4 relative z-10">
          Uses Stripe Sandbox. No real charges will be processed.
        </p>
      </div>
    </div>
  );
}
