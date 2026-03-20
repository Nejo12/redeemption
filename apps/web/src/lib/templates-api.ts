import { requestJson } from "@/lib/api-client";
import {
  TemplateListResponse,
  TemplateResponse,
  TemplateCategoryValue,
} from "@/lib/templates-contract";

export function listTemplates(
  search: string,
  category: TemplateCategoryValue | "",
): Promise<TemplateListResponse> {
  const searchParams = new URLSearchParams();
  if (search.trim()) {
    searchParams.set("q", search.trim());
  }
  if (category) {
    searchParams.set("category", category);
  }

  const query = searchParams.toString();

  return requestJson<TemplateListResponse>(`/templates${query ? `?${query}` : ""}`, {
    method: "GET",
  });
}

export function getTemplate(templateSlug: string): Promise<TemplateResponse> {
  return requestJson<TemplateResponse>(`/templates/${templateSlug}`, {
    method: "GET",
  });
}
