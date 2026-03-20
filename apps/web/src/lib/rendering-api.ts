import { requestJson } from "@/lib/api-client";
import { CreateRenderPreviewRequestBody, RenderPreviewResponse } from "@/lib/rendering-contract";

export async function createRenderPreview(
  accessToken: string,
  body: CreateRenderPreviewRequestBody,
): Promise<RenderPreviewResponse> {
  return requestJson<RenderPreviewResponse>("/render-previews", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });
}
