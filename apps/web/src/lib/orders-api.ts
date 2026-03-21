import { requestJson } from "@/lib/api-client";
import { OrderListResponse, OrderResponse } from "@/lib/orders-contract";

export function listOrders(accessToken: string): Promise<OrderListResponse> {
  return requestJson<OrderListResponse>("/orders", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function createOrderFromDraft(accessToken: string, draftId: string): Promise<OrderResponse> {
  return requestJson<OrderResponse>(`/orders/from-drafts/${draftId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
