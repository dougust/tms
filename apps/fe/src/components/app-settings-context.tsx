'use client';

import React from 'react';
import { DateHeaderFormat } from '../lib';
import { useCustomDateFormat } from '../hooks';

export type AppSettings = {
  dateHeaderFormat: DateHeaderFormat;
  // Add more global settings here in the future
};

const DEFAULT_SETTINGS: AppSettings = {
  dateHeaderFormat: "locale",
};

const STORAGE_KEY = "app:settings";

function safeParse(json: string | null): AppSettings | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json);
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.dateHeaderFormat === "string"
    ) {
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
      } as AppSettings;
    }
  } catch (_) {
    // ignore
  }
  return null;
}

export type AppSettingsContextValue = AppSettings & {
  setDateHeaderFormat: (fmt: DateHeaderFormat) => void;
  setSettings: (partial: Partial<AppSettings>) => void;
  formatDate: (date: Date) => string;
};

const AppSettingsContext = React.createContext<AppSettingsContextValue | undefined>(
  undefined
);

export const AppSettingsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [settings, setSettingsState] = React.useState<AppSettings>(() => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    const fromStorage = safeParse(window.localStorage.getItem(STORAGE_KEY));
    return fromStorage ?? DEFAULT_SETTINGS;
  });

  // Persist to localStorage whenever settings change
  React.useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      }
    } catch (_) {
      // ignore storage errors
    }
  }, [settings]);

  const formatDate = useCustomDateFormat(settings.dateHeaderFormat);

  const setSettings = React.useCallback((partial: Partial<AppSettings>) => {
    setSettingsState((prev) => ({ ...prev, ...partial }));
  }, []);

  const setDateHeaderFormat = React.useCallback((fmt: DateHeaderFormat) => {
    setSettingsState((prev) => ({ ...prev, dateHeaderFormat: fmt }));
  }, []);

  const value = React.useMemo<AppSettingsContextValue>(
    () => ({ ...settings, setSettings, setDateHeaderFormat, formatDate }),
    [settings, setSettings, setDateHeaderFormat]
  );

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
};

export function useAppSettings(): AppSettingsContextValue {
  const ctx = React.useContext(AppSettingsContext);
  if (!ctx) {
    throw new Error("useAppSettings must be used within AppSettingsProvider");
  }
  return ctx;
}
