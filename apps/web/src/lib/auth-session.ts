import { useSyncExternalStore } from "react";
import { StoredAuthSession } from "@/lib/auth-contract";

const AUTH_SESSION_STORAGE_KEY = "project-one.auth.session";
const authSessionListeners = new Set<() => void>();

function notifyAuthSessionListeners() {
  authSessionListeners.forEach((listener) => listener());
}

function subscribeToAuthSession(onStoreChange: () => void): () => void {
  authSessionListeners.add(onStoreChange);

  function handleStorage(event: StorageEvent) {
    if (event.key === AUTH_SESSION_STORAGE_KEY) {
      onStoreChange();
    }
  }

  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorage);
  }

  return () => {
    authSessionListeners.delete(onStoreChange);

    if (typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorage);
    }
  };
}

export function readStoredAuthSession(): StoredAuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as StoredAuthSession;
  } catch {
    window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    return null;
  }
}

export function writeStoredAuthSession(session: StoredAuthSession): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
  notifyAuthSessionListeners();
}

export function clearStoredAuthSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  notifyAuthSessionListeners();
}

export function useStoredAuthSession(): StoredAuthSession | null {
  return useSyncExternalStore(subscribeToAuthSession, readStoredAuthSession, () => null);
}
