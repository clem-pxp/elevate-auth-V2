"use client";

import { useQuery } from "@tanstack/react-query";

import type { StripePriceData } from "@/lib/types/stripe";

async function fetchPrices(): Promise<StripePriceData[]> {
  const res = await fetch("/api/stripe/prices");

  if (!res.ok) {
    throw new Error("Impossible de charger les prix");
  }

  const data = (await res.json()) as { prices: StripePriceData[] };
  return data.prices;
}

export function useStripePrices() {
  return useQuery({
    queryKey: ["stripe-prices"],
    queryFn: fetchPrices,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
