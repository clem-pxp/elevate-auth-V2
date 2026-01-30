import { NextResponse } from "next/server";

import { getStripe } from "@/lib/stripe";

export async function GET() {
  try {
    const prices = await getStripe().prices.list({
      active: true,
      type: "recurring",
      expand: ["data.product"],
    });

    const formattedPrices = prices.data
      .filter((price) => {
        const product = price.product;
        return (
          typeof product === "object" &&
          !("deleted" in product && product.deleted) &&
          "active" in product &&
          product.active
        );
      })
      .map((price) => {
        const product = price.product as {
          id: string;
          name: string;
          description: string | null;
        };
        return {
          id: price.id,
          productId: product.id,
          name: product.name,
          description: product.description ?? "",
          unitAmount: price.unit_amount,
          currency: price.currency,
          interval: price.recurring?.interval,
          intervalCount: price.recurring?.interval_count,
        };
      })
      .sort((a, b) => (a.unitAmount ?? 0) - (b.unitAmount ?? 0));

    return NextResponse.json({ prices: formattedPrices });
  } catch (error) {
    console.error("Stripe prices error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des prix" },
      { status: 500 },
    );
  }
}
