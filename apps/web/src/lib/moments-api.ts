import { requestJson } from "@/lib/api-client";
import {
  CreateMomentRuleRequestBody,
  DraftResponse,
  DraftListResponse,
  MomentRuleListResponse,
  MomentRuleResponse,
  SnoozeDraftRequestBody,
  UpdateDraftRequestBody,
} from "@/lib/moments-contract";

export function listMoments(accessToken: string): Promise<MomentRuleListResponse> {
  return requestJson<MomentRuleListResponse>("/moments", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function listDrafts(accessToken: string): Promise<DraftListResponse> {
  return requestJson<DraftListResponse>("/drafts", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function createMomentRule(
  accessToken: string,
  payload: CreateMomentRuleRequestBody,
): Promise<MomentRuleResponse> {
  return requestJson<MomentRuleResponse>("/moments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export function deleteMomentRule(
  accessToken: string,
  momentId: string,
): Promise<{ deleted: true }> {
  return requestJson<{ deleted: true }>(`/moments/${momentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function updateDraft(
  accessToken: string,
  draftId: string,
  payload: UpdateDraftRequestBody,
): Promise<DraftResponse> {
  return requestJson<DraftResponse>(`/drafts/${draftId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export function approveDraft(accessToken: string, draftId: string): Promise<DraftResponse> {
  return requestJson<DraftResponse>(`/drafts/${draftId}/approve`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function skipDraft(accessToken: string, draftId: string): Promise<DraftResponse> {
  return requestJson<DraftResponse>(`/drafts/${draftId}/skip`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function snoozeDraft(
  accessToken: string,
  draftId: string,
  payload: SnoozeDraftRequestBody,
): Promise<DraftResponse> {
  return requestJson<DraftResponse>(`/drafts/${draftId}/snooze`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}
