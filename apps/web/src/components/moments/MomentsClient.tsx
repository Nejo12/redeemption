"use client";

import { useEffect, useState, useTransition } from "react";
import { AuthField } from "@/components/auth/AuthField";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { ActionLink } from "@/components/ui/ActionLink";
import { PanelSurface } from "@/components/ui/PanelSurface";
import { StatusPill } from "@/components/ui/StatusPill";
import { useStoredAuthSession } from "@/lib/auth-session";
import { listContacts } from "@/lib/contacts-api";
import { ContactView } from "@/lib/contacts-contract";
import {
  approveDraft,
  createMomentRule,
  deleteMomentRule,
  listDrafts,
  listMoments,
  skipDraft,
  snoozeDraft,
  updateDraft,
} from "@/lib/moments-api";
import {
  CreateMomentRuleRequestBody,
  DraftStatusValue,
  DraftView,
  MomentEventTypeValue,
  MomentRuleView,
  RenderPhotoFitValue,
} from "@/lib/moments-contract";
import { createOrderFromDraft, listOrders } from "@/lib/orders-api";
import { OrderView } from "@/lib/orders-contract";
import { listPhotoUploads, uploadPhoto } from "@/lib/storage-api";
import { StoredObjectView } from "@/lib/storage-contract";
import { listTemplates } from "@/lib/templates-api";
import { TemplateView } from "@/lib/templates-contract";
import { templateVariableTokens } from "@/lib/template-editor";

type DraftEditorState = {
  fieldValues: Record<string, string>;
  photoObjectId: string | null;
  photoFit: RenderPhotoFitValue | null;
  snoozeAt: string;
};

const defaultMomentForm: CreateMomentRuleRequestBody = {
  name: "",
  contactId: "",
  templateId: "",
  eventType: "CONTACT_BIRTHDAY",
  oneOffDate: null,
  leadTimeDays: 7,
  deliveryPreference: "ARRIVE_BY",
  approvalMode: "ALWAYS_ASK",
  messageTemplate: "Happy {occasion}, {first_name}. From {sender_name}.",
  photoObjectId: null,
  photoFit: "FIT",
};

export function MomentsClient() {
  const [isLoading, startTransition] = useTransition();
  const [isUploadingPhoto, startPhotoUploadTransition] = useTransition();
  const [isSubmitting, startSubmitTransition] = useTransition();
  const storedSession = useStoredAuthSession();
  const accessToken = storedSession?.session.accessToken ?? null;
  const [form, setForm] = useState<CreateMomentRuleRequestBody>(defaultMomentForm);
  const [contacts, setContacts] = useState<ContactView[]>([]);
  const [templates, setTemplates] = useState<TemplateView[]>([]);
  const [moments, setMoments] = useState<MomentRuleView[]>([]);
  const [drafts, setDrafts] = useState<DraftView[]>([]);
  const [orders, setOrders] = useState<OrderView[]>([]);
  const [uploads, setUploads] = useState<StoredObjectView[]>([]);
  const [draftEditors, setDraftEditors] = useState<Record<string, DraftEditorState>>({});
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    startTransition(async () => {
      try {
        const [
          contactsResponse,
          templatesResponse,
          momentsResponse,
          draftsResponse,
          ordersResponse,
          uploadsResponse,
        ] = await Promise.all([
          listContacts(accessToken, ""),
          listTemplates("", ""),
          listMoments(accessToken),
          listDrafts(accessToken),
          listOrders(accessToken),
          listPhotoUploads(accessToken),
        ]);

        setContacts(contactsResponse.contacts);
        setTemplates(templatesResponse.templates);
        setMoments(momentsResponse.moments);
        setDrafts(draftsResponse.drafts);
        setOrders(ordersResponse.orders);
        setUploads(uploadsResponse.objects.slice(0, 6));
        setForm((current) => ({
          ...current,
          contactId: current.contactId || contactsResponse.contacts[0]?.id || "",
          templateId: current.templateId || templatesResponse.templates[0]?.id || "",
        }));
        setErrorMessage(null);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to load the moments workspace.",
        );
      }
    });
  }, [accessToken]);

  function updateForm<K extends keyof CreateMomentRuleRequestBody>(
    key: K,
    value: CreateMomentRuleRequestBody[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateDraftEditor(
    draftId: string,
    updater: (current: DraftEditorState) => DraftEditorState,
  ) {
    setDraftEditors((current) => {
      const draft = drafts.find((entry) => entry.id === draftId);
      const nextCurrent = current[draftId] ?? (draft ? buildDraftEditorState(draft) : null);

      if (!nextCurrent) {
        return current;
      }

      return {
        ...current,
        [draftId]: updater(nextCurrent),
      };
    });
  }

  function openDraftEditor(draft: DraftView) {
    setActiveDraftId(draft.id);
    setDraftEditors((current) => ({
      ...current,
      [draft.id]: current[draft.id] ?? buildDraftEditorState(draft),
    }));
  }

  function handlePhotoUpload(file: File | null) {
    if (!file || !accessToken) {
      return;
    }

    startPhotoUploadTransition(async () => {
      try {
        const response = await uploadPhoto(accessToken, file);
        const uploadsResponse = await listPhotoUploads(accessToken);
        setUploads(uploadsResponse.objects.slice(0, 6));
        updateForm("photoObjectId", response.object.id);
        setUploadMessage(
          `Uploaded photo ${response.object.originalFilename ?? response.object.id}.`,
        );
      } catch (error) {
        setUploadMessage(
          error instanceof Error ? error.message : "Unable to upload the selected photo.",
        );
      }
    });
  }

  function insertVariableToken(token: string) {
    updateForm(
      "messageTemplate",
      form.messageTemplate ? `${form.messageTemplate} ${token}` : token,
    );
  }

  function refreshWorkspace() {
    if (!accessToken) {
      return;
    }

    startTransition(async () => {
      const [momentsResponse, draftsResponse, ordersResponse, uploadsResponse] = await Promise.all([
        listMoments(accessToken),
        listDrafts(accessToken),
        listOrders(accessToken),
        listPhotoUploads(accessToken),
      ]);
      setMoments(momentsResponse.moments);
      setDrafts(draftsResponse.drafts);
      setOrders(ordersResponse.orders);
      setUploads(uploadsResponse.objects.slice(0, 6));
    });
  }

  function handleCreateMoment() {
    if (!accessToken) {
      setErrorMessage("Sign in first to create moment rules.");
      return;
    }

    if (!form.contactId) {
      setErrorMessage("Select a contact before saving the moment rule.");
      return;
    }

    if (!form.templateId) {
      setErrorMessage("Select a template before saving the moment rule.");
      return;
    }

    setStatusMessage(null);
    setErrorMessage(null);

    startSubmitTransition(async () => {
      try {
        const response = await createMomentRule(accessToken, form);
        setStatusMessage(
          `Saved ${response.moment.name}. The next draft is scheduled for ${formatDateTime(response.moment.nextDraftAt)}.`,
        );
        setForm((current) => ({
          ...defaultMomentForm,
          contactId: current.contactId,
          templateId: current.templateId,
        }));
        refreshWorkspace();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to save the moment rule.");
      }
    });
  }

  function handleDeleteMoment(momentId: string) {
    if (!accessToken) {
      return;
    }

    startSubmitTransition(async () => {
      try {
        await deleteMomentRule(accessToken, momentId);
        setStatusMessage("Moment rule removed.");
        refreshWorkspace();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to delete the moment rule.",
        );
      }
    });
  }

  function handleApproveDraft(draftId: string) {
    if (!accessToken) {
      return;
    }

    setStatusMessage(null);
    setErrorMessage(null);

    startSubmitTransition(async () => {
      try {
        const response = await approveDraft(accessToken, draftId);
        setStatusMessage(`Approved draft "${response.draft.headline}".`);
        setActiveDraftId(null);
        refreshWorkspace();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to approve the draft.");
      }
    });
  }

  function handleSkipDraft(draftId: string) {
    if (!accessToken) {
      return;
    }

    setStatusMessage(null);
    setErrorMessage(null);

    startSubmitTransition(async () => {
      try {
        const response = await skipDraft(accessToken, draftId);
        setStatusMessage(`Skipped draft "${response.draft.headline}".`);
        setActiveDraftId(null);
        refreshWorkspace();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to skip the draft.");
      }
    });
  }

  function handleSnoozeDraft(draftId: string) {
    if (!accessToken) {
      return;
    }

    const editor = draftEditors[draftId];
    if (!editor?.snoozeAt) {
      setErrorMessage("Choose a new review time before snoozing the draft.");
      return;
    }

    setStatusMessage(null);
    setErrorMessage(null);

    startSubmitTransition(async () => {
      try {
        const response = await snoozeDraft(accessToken, draftId, {
          draftReadyAt: new Date(editor.snoozeAt).toISOString(),
        });
        setStatusMessage(
          `Snoozed "${response.draft.headline}" until ${formatDateTime(response.draft.draftReadyAt)}.`,
        );
        setActiveDraftId(null);
        refreshWorkspace();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to snooze the draft.");
      }
    });
  }

  function handleUpdateDraft(draft: DraftView) {
    if (!accessToken) {
      return;
    }

    const editor = draftEditors[draft.id];
    if (!editor) {
      return;
    }

    setStatusMessage(null);
    setErrorMessage(null);

    startSubmitTransition(async () => {
      try {
        const response = await updateDraft(accessToken, draft.id, {
          fieldValues: editor.fieldValues,
          photoObjectId: editor.photoObjectId,
          photoFit: editor.photoFit,
        });
        setStatusMessage(`Updated draft "${response.draft.headline}" and regenerated its preview.`);
        refreshWorkspace();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to update the draft.");
      }
    });
  }

  function handleCreateOrder(draftId: string) {
    if (!accessToken) {
      return;
    }

    setStatusMessage(null);
    setErrorMessage(null);

    startSubmitTransition(async () => {
      try {
        const response = await createOrderFromDraft(accessToken, draftId);
        setStatusMessage(`Created order ${response.order.id} for "${response.order.headline}".`);
        refreshWorkspace();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to create the order.");
      }
    });
  }

  if (!accessToken) {
    return <AuthMessage tone="error">Sign in first to manage moments.</AuthMessage>;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <PanelSurface className="px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">
              Moment rule
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">
              Save one rule and let the system compute the next draft window.
            </h2>
          </div>

          <StatusPill tone="accent">Always ask</StatusPill>
        </div>

        <div className="mt-5 space-y-4">
          {statusMessage ? <AuthMessage tone="success">{statusMessage}</AuthMessage> : null}
          {errorMessage ? <AuthMessage tone="error">{errorMessage}</AuthMessage> : null}
          {uploadMessage ? <AuthMessage tone="info">{uploadMessage}</AuthMessage> : null}

          <AuthField
            label="Moment name"
            name="name"
            value={form.name}
            placeholder="Dad birthday"
            onChange={(value) => updateForm("name", value)}
          />

          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold tracking-[0.14em] text-foreground/55 uppercase">
              Contact
            </span>
            <select
              className="field-input"
              value={form.contactId}
              onChange={(event) => updateForm("contactId", event.target.value)}
            >
              <option value="">Select a contact</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.firstName} {contact.lastName}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold tracking-[0.14em] text-foreground/55 uppercase">
                Event type
              </span>
              <select
                className="field-input"
                value={form.eventType}
                onChange={(event) =>
                  updateForm("eventType", event.target.value as MomentEventTypeValue)
                }
              >
                <option value="CONTACT_BIRTHDAY">Contact birthday</option>
                <option value="ONE_OFF_DATE">One-off date</option>
              </select>
            </label>

            <AuthField
              label="One-off date"
              name="oneOffDate"
              type="date"
              value={form.oneOffDate ?? ""}
              placeholder=""
              onChange={(value) => updateForm("oneOffDate", value || null)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold tracking-[0.14em] text-foreground/55 uppercase">
                Template
              </span>
              <select
                className="field-input"
                value={form.templateId}
                onChange={(event) => updateForm("templateId", event.target.value)}
              >
                <option value="">Select a template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </label>

            <AuthField
              label="Lead time (days)"
              name="leadTimeDays"
              type="number"
              value={String(form.leadTimeDays)}
              placeholder="7"
              onChange={(value) => updateForm("leadTimeDays", Number(value) || 0)}
            />
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold tracking-[0.14em] text-foreground/55 uppercase">
              Message template
            </span>
            <textarea
              className="field-input min-h-36 resize-y"
              value={form.messageTemplate}
              onChange={(event) => updateForm("messageTemplate", event.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              {templateVariableTokens.map((token) => (
                <button
                  key={token}
                  type="button"
                  className="rounded-full border border-border bg-surface-muted px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-foreground/72 uppercase transition-colors hover:bg-surface-strong"
                  onClick={() => insertVariableToken(token)}
                >
                  Insert {token}
                </button>
              ))}
            </div>
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold tracking-[0.14em] text-foreground/55 uppercase">
                Delivery preference
              </span>
              <select
                className="field-input"
                value={form.deliveryPreference}
                onChange={(event) =>
                  updateForm("deliveryPreference", event.target.value as "ARRIVE_BY" | "SHIP_ON")
                }
              >
                <option value="ARRIVE_BY">Arrive by</option>
                <option value="SHIP_ON">Ship on</option>
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold tracking-[0.14em] text-foreground/55 uppercase">
                Photo fit
              </span>
              <select
                className="field-input"
                value={form.photoFit ?? "FIT"}
                onChange={(event) =>
                  updateForm("photoFit", event.target.value as RenderPhotoFitValue)
                }
              >
                <option value="FIT">Fit</option>
                <option value="COVER">Cover</option>
              </select>
            </label>
          </div>

          <div className="rounded-[var(--radius-md)] border border-border bg-surface px-4 py-4">
            <p className="text-xs font-semibold tracking-[0.14em] text-foreground/55 uppercase">
              Optional photo
            </p>
            <p className="mt-2 text-sm leading-7 text-foreground/72">
              Upload one image or reuse an existing stored photo. The selected object is linked to
              the scheduled draft snapshot.
            </p>
            <input
              type="file"
              accept="image/*"
              className="mt-4 block text-sm text-foreground/72 file:mr-4 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-xs file:font-semibold file:tracking-[0.12em] file:text-white file:uppercase hover:file:bg-accent-strong"
              onChange={(event) => handlePhotoUpload(event.target.files?.[0] ?? null)}
            />
            <div className="mt-4 grid gap-2">
              <label className="text-xs font-semibold tracking-[0.14em] text-foreground/55 uppercase">
                Reuse a stored photo
              </label>
              <select
                className="field-input"
                value={form.photoObjectId ?? ""}
                onChange={(event) => updateForm("photoObjectId", event.target.value || null)}
              >
                <option value="">No photo selected</option>
                {uploads.map((upload) => (
                  <option key={upload.id} value={upload.id}>
                    {upload.originalFilename ?? upload.id}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-5 py-3 text-xs font-semibold tracking-[0.14em] text-white uppercase transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:bg-accent/45"
            disabled={
              isSubmitting || isLoading || isUploadingPhoto || !form.contactId || !form.templateId
            }
            onClick={handleCreateMoment}
          >
            {isSubmitting ? "Saving" : "Save moment rule"}
          </button>
        </div>
      </PanelSurface>

      <div className="grid gap-4">
        <PanelSurface className="px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">
                Moments
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">
                Current rules and their next draft window.
              </h2>
            </div>

            <ActionLink
              href="/templates"
              variant="secondary"
              className="min-h-10 px-4 py-2 text-xs"
            >
              Browse templates
            </ActionLink>
          </div>

          <div className="mt-5 space-y-3">
            {moments.length === 0 ? (
              <AuthMessage tone="info">
                No moments saved yet. Create one to seed the first draft.
              </AuthMessage>
            ) : (
              moments.map((moment) => (
                <div
                  key={moment.id}
                  className="rounded-[var(--radius-md)] border border-border bg-surface px-4 py-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{moment.name}</p>
                      <p className="mt-1 text-sm leading-7 text-foreground/70">
                        {moment.contact.firstName} {moment.contact.lastName} ·{" "}
                        {moment.template.name}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-xs font-semibold tracking-[0.12em] text-accent uppercase"
                      onClick={() => handleDeleteMoment(moment.id)}
                    >
                      Delete
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusPill>{moment.eventType}</StatusPill>
                    <StatusPill tone="accent">
                      Next draft {formatDateTime(moment.nextDraftAt)}
                    </StatusPill>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-foreground/72">
                    Next occurrence: {formatDateTime(moment.nextOccurrenceAt)}
                  </p>
                  {moment.nextDraft ? (
                    <p className="text-sm leading-7 text-foreground/72">
                      Draft status: {moment.nextDraft.status} · Scheduled for{" "}
                      {formatDateTime(moment.nextDraft.scheduledFor)}
                    </p>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </PanelSurface>

        <PanelSurface className="px-6 py-6">
          <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">
            Draft queue
          </p>
          <div className="mt-4 space-y-3">
            {drafts.length === 0 ? (
              <AuthMessage tone="info">Drafts will appear here once a moment is saved.</AuthMessage>
            ) : (
              drafts.map((draft) => {
                const editor = draftEditors[draft.id] ?? buildDraftEditorState(draft);
                const isReviewable = draft.status === "READY_FOR_REVIEW";
                const relatedOrder = orders.find((order) => order.draftId === draft.id);

                return (
                  <div
                    key={draft.id}
                    className="rounded-[var(--radius-md)] border border-border bg-surface px-4 py-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill tone={toneForDraftStatus(draft.status)}>
                        {draft.status}
                      </StatusPill>
                      <span className="text-sm text-foreground/65">
                        {draft.contact.firstName} {draft.contact.lastName}
                      </span>
                    </div>
                    <p className="mt-3 text-base font-semibold text-foreground">{draft.headline}</p>
                    <p className="mt-2 text-sm leading-7 text-foreground/72">{draft.message}</p>
                    <p className="mt-3 text-sm leading-7 text-foreground/68">
                      Ready at {formatDateTime(draft.draftReadyAt)} · Send date{" "}
                      {formatDateTime(draft.scheduledFor)}
                    </p>
                    {relatedOrder ? (
                      <p className="mt-2 text-sm leading-7 text-foreground/68">
                        Order {relatedOrder.id} · {relatedOrder.status}
                      </p>
                    ) : null}

                    {isReviewable ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="inline-flex min-h-10 items-center justify-center rounded-full bg-accent px-4 py-2 text-xs font-semibold tracking-[0.12em] text-white uppercase transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:bg-accent/45"
                          disabled={isSubmitting}
                          onClick={() => handleApproveDraft(draft.id)}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="inline-flex min-h-10 items-center justify-center rounded-full border border-border bg-surface-muted px-4 py-2 text-xs font-semibold tracking-[0.12em] text-foreground uppercase transition-colors hover:bg-surface-strong disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={isSubmitting}
                          onClick={() => handleSkipDraft(draft.id)}
                        >
                          Skip
                        </button>
                        <button
                          type="button"
                          className="inline-flex min-h-10 items-center justify-center rounded-full border border-border bg-surface-muted px-4 py-2 text-xs font-semibold tracking-[0.12em] text-foreground uppercase transition-colors hover:bg-surface-strong disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={isSubmitting}
                          onClick={() =>
                            activeDraftId === draft.id
                              ? setActiveDraftId(null)
                              : openDraftEditor(draft)
                          }
                        >
                          {activeDraftId === draft.id ? "Close editor" : "Edit / snooze"}
                        </button>
                      </div>
                    ) : null}

                    {draft.status === "APPROVED" && !relatedOrder ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="inline-flex min-h-10 items-center justify-center rounded-full bg-accent px-4 py-2 text-xs font-semibold tracking-[0.12em] text-white uppercase transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:bg-accent/45"
                          disabled={isSubmitting}
                          onClick={() => handleCreateOrder(draft.id)}
                        >
                          Create order
                        </button>
                      </div>
                    ) : null}

                    {activeDraftId === draft.id && isReviewable ? (
                      <div className="mt-5 space-y-4 rounded-[var(--radius-md)] border border-border bg-surface-muted px-4 py-4">
                        <p className="text-xs font-semibold tracking-[0.14em] text-accent uppercase">
                          Draft editor
                        </p>
                        <div className="grid gap-4">
                          {Object.entries(editor.fieldValues).map(([key, value]) => (
                            <label key={key} className="flex flex-col gap-2">
                              <span className="text-xs font-semibold tracking-[0.14em] text-foreground/55 uppercase">
                                {humanizeFieldKey(key)}
                              </span>
                              <textarea
                                className="field-input min-h-24 resize-y"
                                value={value}
                                onChange={(event) =>
                                  updateDraftEditor(draft.id, (current) => ({
                                    ...current,
                                    fieldValues: {
                                      ...current.fieldValues,
                                      [key]: event.target.value,
                                    },
                                  }))
                                }
                              />
                            </label>
                          ))}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <label className="flex flex-col gap-2">
                            <span className="text-xs font-semibold tracking-[0.14em] text-foreground/55 uppercase">
                              Reuse stored photo
                            </span>
                            <select
                              className="field-input"
                              value={editor.photoObjectId ?? ""}
                              onChange={(event) =>
                                updateDraftEditor(draft.id, (current) => ({
                                  ...current,
                                  photoObjectId: event.target.value || null,
                                }))
                              }
                            >
                              <option value="">No photo selected</option>
                              {uploads.map((upload) => (
                                <option key={upload.id} value={upload.id}>
                                  {upload.originalFilename ?? upload.id}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className="flex flex-col gap-2">
                            <span className="text-xs font-semibold tracking-[0.14em] text-foreground/55 uppercase">
                              Photo fit
                            </span>
                            <select
                              className="field-input"
                              value={editor.photoFit ?? "FIT"}
                              onChange={(event) =>
                                updateDraftEditor(draft.id, (current) => ({
                                  ...current,
                                  photoFit: event.target.value as RenderPhotoFitValue,
                                }))
                              }
                            >
                              <option value="FIT">Fit</option>
                              <option value="COVER">Cover</option>
                            </select>
                          </label>
                        </div>

                        <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-end">
                          <label className="flex flex-col gap-2">
                            <span className="text-xs font-semibold tracking-[0.14em] text-foreground/55 uppercase">
                              Snooze until
                            </span>
                            <input
                              type="datetime-local"
                              className="field-input"
                              value={editor.snoozeAt}
                              onChange={(event) =>
                                updateDraftEditor(draft.id, (current) => ({
                                  ...current,
                                  snoozeAt: event.target.value,
                                }))
                              }
                            />
                          </label>

                          <button
                            type="button"
                            className="inline-flex min-h-10 items-center justify-center rounded-full bg-accent px-4 py-2 text-xs font-semibold tracking-[0.12em] text-white uppercase transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:bg-accent/45"
                            disabled={isSubmitting}
                            onClick={() => handleUpdateDraft(draft)}
                          >
                            Save edit
                          </button>

                          <button
                            type="button"
                            className="inline-flex min-h-10 items-center justify-center rounded-full border border-border bg-surface px-4 py-2 text-xs font-semibold tracking-[0.12em] text-foreground uppercase transition-colors hover:bg-surface-strong disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={isSubmitting}
                            onClick={() => handleSnoozeDraft(draft.id)}
                          >
                            Snooze
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </PanelSurface>
      </div>
    </div>
  );
}

function buildDraftEditorState(draft: DraftView): DraftEditorState {
  return {
    fieldValues: { ...draft.fieldValues },
    photoObjectId: draft.photoObjectId,
    photoFit: draft.photoFit ?? "FIT",
    snoozeAt: toDateTimeLocalValue(draft.draftReadyAt),
  };
}

function toneForDraftStatus(status: DraftStatusValue): "accent" | "success" {
  if (status === "READY_FOR_REVIEW" || status === "PROCESSING") {
    return "accent";
  }

  return "success";
}

function humanizeFieldKey(value: string): string {
  return value.replaceAll("_", " ");
}

function toDateTimeLocalValue(value: string): string {
  const date = new Date(value);
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return offsetDate.toISOString().slice(0, 16);
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "Not scheduled";
  }

  return new Date(value).toLocaleString();
}
