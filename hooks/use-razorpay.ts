"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

export function useRazorpay() {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const existingScript = document.getElementById('razorpay-checkout-js');
    if (existingScript) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.id = 'razorpay-checkout-js';
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => {
      setError("Payment system (Razorpay) failed to load. Please disable ad-blockers.");
      toast.error("Razorpay script blocked. Please disable ad-blockers.");
    };
    document.body.appendChild(script);

    return () => {
      // We keep it loaded typically to avoid flickering on re-mounts
    };
  }, []);

  const initiatePayment = (options: any) => {
    if (!isScriptLoaded || !(window as any).Razorpay) {
      toast.error("Razorpay is not loaded yet. Please wait.");
      return;
    }

    setIsLoading(true);
    try {
      const rzp = new (window as any).Razorpay({
        ...options,
        modal: {
          ...options.modal,
          ondismiss: () => {
            setIsLoading(false);
            options.modal?.ondismiss?.();
          }
        }
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      toast.error("Failed to open Razorpay checkout");
    }
  };

  return {
    isScriptLoaded,
    initiatePayment,
    isLoading,
    error,
  };
}
