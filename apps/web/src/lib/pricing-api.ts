import { requestJson } from "@/lib/api-client";
import { OrderPricingResponse, ShippingTypeValue } from "@/lib/pricing-contract";

export function getOrderPricing(
  accessToken: string,
  orderId: string,
  shippingType: ShippingTypeValue,
): Promise<OrderPricingResponse> {
  const searchParams = new URLSearchParams({
    shippingType,
  });

  return requestJson<OrderPricingResponse>(
    `/orders/${orderId}/pricing?${searchParams.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
}
