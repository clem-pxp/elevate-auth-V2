export interface StripePriceData {
  id: string;
  productId: string | null;
  name: string;
  description: string;
  unitAmount: number | null;
  currency: string;
  interval: string | undefined;
  intervalCount: number | undefined;
}

export interface SessionStatusResponse {
  status: string;
  customerEmail: string | null;
  paymentStatus: string;
}
