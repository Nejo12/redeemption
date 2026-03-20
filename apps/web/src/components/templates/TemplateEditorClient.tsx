"use client";

import { useDeferredValue, useEffect, useState, useTransition } from "react";
import { AuthField } from "@/components/auth/AuthField";
import { AuthFormCard } from "@/components/auth/AuthFormCard";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { TemplatePreviewSurface } from "@/components/templates/TemplatePreviewSurface";
import { ActionLink } from "@/components/ui/ActionLink";
import { PanelSurface } from "@/components/ui/PanelSurface";
import { StatusPill } from "@/components/ui/StatusPill";
import { readStoredAuthSession } from "@/lib/auth-session";
import { createRenderPreview } from "@/lib/rendering-api";
import { RenderPreviewView } from "@/lib/rendering-contract";
import { listPhotoUploads, uploadPhoto } from "@/lib/storage-api";
import { StoredObjectView } from "@/lib/storage-contract";
import { getTemplate } from "@/lib/templates-api";
import { TemplateFieldView, TemplateView } from "@/lib/templates-contract";
import {
  buildEditorPreviewContent,
  createEditorFieldValues,
  insertVariableToken,
  TemplateEditorFieldValues,
  TemplateEditorPhotoFit,
  templateVariableTokens,
} from "@/lib/template-editor";

type TemplateEditorClientProps = {
  templateSlug: string;
};

export function TemplateEditorClient({ templateSlug }: TemplateEditorClientProps) {
  const [isPending, startTransition] = useTransition();
  const [isUploadingPhoto, startPhotoUploadTransition] = useTransition();
  const [isGeneratingServerPreview, startServerPreviewTransition] = useTransition();
  const storedSession = readStoredAuthSession();
  const accessToken = storedSession?.session.accessToken ?? null;
  const [template, setTemplate] = useState<TemplateView | null>(null);
  const [fieldValues, setFieldValues] = useState<TemplateEditorFieldValues>({});
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string | null>(null);
  const [photoFit, setPhotoFit] = useState<TemplateEditorPhotoFit>("FIT");
  const [uploadedPhoto, setUploadedPhoto] = useState<StoredObjectView | null>(null);
  const [recentUploads, setRecentUploads] = useState<StoredObjectView[]>([]);
  const [storageMessage, setStorageMessage] = useState<string | null>(null);
  const [serverPreview, setServerPreview] = useState<RenderPreviewView | null>(null);
  const [serverPreviewMessage, setServerPreviewMessage] = useState<string | null>(null);
  const [serverPreviewErrorMessage, setServerPreviewErrorMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    startTransition(async () => {
      try {
        const response = await getTemplate(templateSlug);
        setTemplate(response.template);
        setFieldValues(createEditorFieldValues(response.template));
        setPhotoPreviewUrl(null);
        setPhotoFileName(null);
        setPhotoFit("FIT");
        setUploadedPhoto(null);
        setStorageMessage(null);
        setServerPreview(null);
        setServerPreviewMessage(null);
        setServerPreviewErrorMessage(null);
        setErrorMessage(null);
      } catch (error) {
        setTemplate(null);
        setFieldValues({});
        setPhotoPreviewUrl(null);
        setPhotoFileName(null);
        setServerPreview(null);
        setServerPreviewMessage(null);
        setServerPreviewErrorMessage(null);
        setErrorMessage(error instanceof Error ? error.message : "Unable to load the template.");
      }
    });
  }, [templateSlug]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    startPhotoUploadTransition(async () => {
      try {
        const response = await listPhotoUploads(accessToken);
        setRecentUploads(response.objects.slice(0, 4));
      } catch {
        setRecentUploads([]);
      }
    });
  }, [accessToken]);

  const recentUploadsToShow = accessToken ? recentUploads : [];

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
    };
  }, [photoPreviewUrl]);

  const deferredFieldValues = useDeferredValue(fieldValues);
  const preview = template
    ? buildEditorPreviewContent(template, deferredFieldValues, Boolean(photoPreviewUrl))
    : null;

  function handleFieldChange(fieldKey: string, value: string) {
    clearServerPreviewState();
    setFieldValues((current) => ({
      ...current,
      [fieldKey]: value,
    }));
  }

  function handleVariableInsert(fieldKey: string, token: string) {
    clearServerPreviewState();
    setFieldValues((current) => ({
      ...current,
      [fieldKey]: insertVariableToken(current[fieldKey] ?? "", token),
    }));
  }

  function handlePhotoChange(file: File | null) {
    clearServerPreviewState();
    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl);
    }

    if (!file) {
      setPhotoPreviewUrl(null);
      setPhotoFileName(null);
      setUploadedPhoto(null);
      setStorageMessage(null);
      return;
    }

    setPhotoPreviewUrl(URL.createObjectURL(file));
    setPhotoFileName(file.name);

    if (!accessToken) {
      setUploadedPhoto(null);
      setStorageMessage(
        "Local preview is available, but sign in with a stored session before uploading the photo to object storage.",
      );
      return;
    }

    startPhotoUploadTransition(async () => {
      try {
        const response = await uploadPhoto(accessToken, file);
        setUploadedPhoto(response.object);
        setStorageMessage(`Uploaded to object storage as ${response.object.id}.`);
        const uploadsResponse = await listPhotoUploads(accessToken);
        setRecentUploads(uploadsResponse.objects.slice(0, 4));
      } catch (error) {
        setUploadedPhoto(null);
        setStorageMessage(
          error instanceof Error
            ? error.message
            : "Unable to upload the selected photo to object storage.",
        );
      }
    });
  }

  function clearServerPreviewState() {
    setServerPreview(null);
    setServerPreviewMessage(null);
    setServerPreviewErrorMessage(null);
  }

  function handleGenerateServerPreview() {
    if (!accessToken) {
      setServerPreview(null);
      setServerPreviewMessage(null);
      setServerPreviewErrorMessage(
        "Sign in first so the server preview can resolve your uploaded photo and store a render artifact.",
      );
      return;
    }

    setServerPreviewMessage(null);
    setServerPreviewErrorMessage(null);

    startServerPreviewTransition(async () => {
      try {
        const response = await createRenderPreview(accessToken, {
          templateSlug,
          fieldValues,
          photoObjectId: uploadedPhoto?.id ?? null,
          photoFit: uploadedPhoto ? photoFit : null,
        });
        setServerPreview(response.preview);
        setServerPreviewMessage(
          `Stored render artifact ${response.preview.artifactObjectId} for the current editor state.`,
        );
      } catch (error) {
        setServerPreview(null);
        setServerPreviewErrorMessage(
          error instanceof Error ? error.message : "Unable to generate a server preview.",
        );
      }
    });
  }

  if (errorMessage) {
    return <AuthMessage tone="error">{errorMessage}</AuthMessage>;
  }

  if (!template || !preview) {
    return <AuthMessage tone="info">Loading the editor for this template.</AuthMessage>;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
      <AuthFormCard
        title={`${template.name} editor`}
        description="This MVP editor binds inputs directly from template metadata. It supports typed text fields, variable insertion, one-photo input, and both local and server-rendered preview surfaces."
        footer={
          <div className="flex flex-wrap gap-3">
            <ActionLink
              href="/templates"
              variant="secondary"
              className="min-h-10 px-4 py-2 text-xs"
            >
              Back to catalog
            </ActionLink>
            <ActionLink
              href="/dashboard"
              variant="secondary"
              className="min-h-10 px-4 py-2 text-xs"
            >
              Dashboard
            </ActionLink>
          </div>
        }
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-3">
            <StatusPill tone="accent">{template.orientation}</StatusPill>
            <StatusPill>{template.fields.length} mapped inputs</StatusPill>
          </div>

          {template.fields.map((field) => (
            <TemplateEditorFieldInput
              key={field.key}
              field={field}
              value={fieldValues[field.key] ?? ""}
              photoFileName={photoFileName}
              photoFit={photoFit}
              onFieldChange={handleFieldChange}
              onPhotoChange={handlePhotoChange}
              onPhotoFitChange={setPhotoFit}
              onVariableInsert={handleVariableInsert}
            />
          ))}

          <AuthMessage tone="info">
            Local preview remains instant, while server preview now round-trips through the API so
            the next rendering slice can build on a persisted artifact boundary instead of a local
            browser-only state.
          </AuthMessage>
        </div>
      </AuthFormCard>

      <div className="grid gap-4">
        <PanelSurface className="px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-foreground/45 uppercase">
                Live preview
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">
                Preview updates from your current editor state.
              </h2>
            </div>

            {isPending || isUploadingPhoto || isGeneratingServerPreview ? (
              <StatusPill tone="accent">Refreshing</StatusPill>
            ) : null}
          </div>

          <div className="mt-5">
            <TemplatePreviewSurface
              template={template}
              headline={preview.headline}
              message={preview.message}
              fieldSummaries={preview.fieldSummaries}
              photoPreviewUrl={photoPreviewUrl}
              photoFit={photoFit}
            />
          </div>
        </PanelSurface>

        <PanelSurface className="px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">
                Server preview
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">
                Generate a persisted render artifact from the current editor state.
              </h2>
            </div>

            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-5 py-3 text-xs font-semibold tracking-[0.14em] text-white uppercase transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:bg-accent/45"
              onClick={handleGenerateServerPreview}
              disabled={isGeneratingServerPreview}
            >
              {isGeneratingServerPreview ? "Generating" : "Generate server preview"}
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {serverPreviewMessage ? (
              <AuthMessage tone="success">{serverPreviewMessage}</AuthMessage>
            ) : null}
            {serverPreviewErrorMessage ? (
              <AuthMessage tone="error">{serverPreviewErrorMessage}</AuthMessage>
            ) : null}

            {serverPreview ? (
              <div className="space-y-4">
                <div className="rounded-[var(--radius-md)] border border-border bg-surface px-4 py-4 text-sm leading-7 text-foreground/72">
                  Server preview artifact: {serverPreview.artifactObjectId}
                  <br />
                  Generated at: {new Date(serverPreview.createdAt).toLocaleString()}
                </div>
                <iframe
                  title={`${serverPreview.templateName} server preview`}
                  srcDoc={serverPreview.html}
                  className="h-[560px] w-full rounded-[var(--radius-lg)] border border-border bg-surface"
                />
              </div>
            ) : (
              <div className="rounded-[var(--radius-md)] border border-dashed border-border bg-surface px-4 py-6 text-sm leading-7 text-foreground/68">
                Generate a server preview after filling the required fields and uploading the photo
                to compare the browser-side composition with the persisted artifact.
              </div>
            )}
          </div>
        </PanelSurface>

        <PanelSurface className="px-6 py-6">
          <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">
            Editor readiness
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-foreground/72">
            <li>
              Template metadata is now driving the form structure instead of hand-authored fields.
            </li>
            <li>
              Variable tokens can be inserted into text inputs before rendering support exists.
            </li>
            <li>
              One-photo uploads now pass through the API storage boundary and return stable object
              metadata for later rendering work.
            </li>
            <li>
              Server preview generation now produces a persisted render artifact that the next PDF
              rendering slice can build on.
            </li>
          </ul>
        </PanelSurface>

        <PanelSurface className="px-6 py-6">
          <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">
            Storage status
          </p>
          <div className="mt-4 space-y-4 text-sm leading-7 text-foreground/72">
            {storageMessage ? <AuthMessage tone="info">{storageMessage}</AuthMessage> : null}

            {uploadedPhoto ? (
              <div className="rounded-[var(--radius-md)] border border-border bg-surface px-4 py-4">
                Latest stored photo: {uploadedPhoto.originalFilename ?? uploadedPhoto.id} /{" "}
                {uploadedPhoto.sizeBytes} bytes
              </div>
            ) : null}

            {recentUploadsToShow.length > 0 ? (
              <div>
                <p className="text-xs font-semibold tracking-[0.14em] text-foreground/45 uppercase">
                  Recent uploads
                </p>
                <ul className="mt-3 space-y-2">
                  {recentUploadsToShow.map((upload) => (
                    <li
                      key={upload.id}
                      className="rounded-[var(--radius-md)] border border-border bg-surface px-4 py-3"
                    >
                      {upload.originalFilename ?? upload.id} / {upload.contentType} /{" "}
                      {upload.sizeBytes} bytes
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </PanelSurface>
      </div>
    </div>
  );
}

type TemplateEditorFieldInputProps = {
  field: TemplateFieldView;
  value: string;
  photoFileName: string | null;
  photoFit: TemplateEditorPhotoFit;
  onFieldChange: (fieldKey: string, value: string) => void;
  onPhotoChange: (file: File | null) => void;
  onPhotoFitChange: (fit: TemplateEditorPhotoFit) => void;
  onVariableInsert: (fieldKey: string, token: string) => void;
};

function TemplateEditorFieldInput({
  field,
  value,
  photoFileName,
  photoFit,
  onFieldChange,
  onPhotoChange,
  onPhotoFitChange,
  onVariableInsert,
}: TemplateEditorFieldInputProps) {
  if (field.kind === "TEXT") {
    return (
      <AuthField
        label={field.label}
        name={field.key}
        value={value}
        placeholder={field.placeholder ?? undefined}
        onChange={(nextValue) => onFieldChange(field.key, nextValue)}
      />
    );
  }

  if (field.kind === "TEXTAREA") {
    return (
      <label className="flex flex-col gap-2">
        <span className="text-xs font-semibold tracking-[0.14em] text-foreground/55 uppercase">
          {field.label}
        </span>
        <textarea
          id={field.key}
          name={field.key}
          value={value}
          placeholder={field.placeholder ?? undefined}
          maxLength={field.maxLength ?? undefined}
          onChange={(event) => onFieldChange(field.key, event.target.value)}
          className="field-input min-h-36 resize-y"
        />
        <div className="flex flex-wrap gap-2">
          {templateVariableTokens.map((token) => (
            <button
              key={token}
              type="button"
              className="rounded-full border border-border bg-surface-muted px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-foreground/72 uppercase transition-colors hover:bg-surface-strong"
              onClick={() => onVariableInsert(field.key, token)}
            >
              Insert {token}
            </button>
          ))}
        </div>
      </label>
    );
  }

  return (
    <div className="grid gap-4 rounded-[var(--radius-md)] border border-border bg-surface px-4 py-4">
      <div>
        <p className="text-xs font-semibold tracking-[0.14em] text-foreground/55 uppercase">
          {field.label}
        </p>
        <p className="mt-2 text-sm leading-7 text-foreground/70">
          Choose one image to test the card composition and send it through the storage boundary.
        </p>
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={(event) => onPhotoChange(event.target.files?.[0] ?? null)}
        className="block text-sm text-foreground/72 file:mr-4 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-xs file:font-semibold file:tracking-[0.12em] file:text-white file:uppercase hover:file:bg-accent-strong"
      />

      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="rounded-[var(--radius-md)] border border-border bg-surface-muted px-4 py-3 text-sm text-foreground/72">
          {photoFileName ? `Selected image: ${photoFileName}` : "No image selected yet."}
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-[0.14em] text-foreground/55 uppercase">
            Fit mode
          </span>
          <select
            className="field-input min-w-[160px]"
            value={photoFit}
            onChange={(event) => onPhotoFitChange(event.target.value as TemplateEditorPhotoFit)}
          >
            <option value="FIT">Fit</option>
            <option value="COVER">Cover</option>
          </select>
        </label>
      </div>
    </div>
  );
}
