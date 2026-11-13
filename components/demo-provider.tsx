"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { initialCareRequest, initialDemoState } from "@/lib/demo-data";
import type { CareRequest, DemoState } from "@/lib/types";

interface DemoContextValue {
  careRequest: CareRequest;
  setCareRequest: (value: CareRequest) => void;
  demoState: DemoState;
  updateDemoState: (patch: Partial<DemoState>) => void;
  resetDemo: (options?: { silent?: boolean }) => void;
  toast: string | null;
  showToast: (message: string) => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [careRequest, setCareRequestState] = useState<CareRequest>(initialCareRequest);
  const [demoState, setDemoState] = useState<DemoState>(initialDemoState);
  const [toast, setToast] = useState<string | null>(null);
  const careRequestRef = useRef<CareRequest>(initialCareRequest);
  const demoStateRef = useRef<DemoState>(initialDemoState);
  const toastTimer = useRef<number | null>(null);

  const persist = useCallback((request: CareRequest, state: DemoState) => {
    window.localStorage.setItem("careflow-demo", JSON.stringify({ careRequest: request, demoState: state }));
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem("careflow-demo");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as { careRequest?: CareRequest; demoState?: DemoState };
      const timer = window.setTimeout(() => {
        if (parsed.careRequest) {
          const nextRequest = { ...initialCareRequest, ...parsed.careRequest };
          careRequestRef.current = nextRequest;
          setCareRequestState(nextRequest);
        }
        if (parsed.demoState) {
          const nextState = {
          ...initialDemoState,
          ...parsed.demoState,
          preferences: { ...initialDemoState.preferences, ...parsed.demoState.preferences },
          profile: { ...initialDemoState.profile, ...parsed.demoState.profile, notifications: { ...initialDemoState.profile.notifications, ...parsed.demoState.profile?.notifications } },
          favorites: parsed.demoState.favorites ?? [],
          appointmentRequests: parsed.demoState.appointmentRequests ?? [],
          records: parsed.demoState.records ?? [],
          resolvedTaskIds: parsed.demoState.resolvedTaskIds ?? [],
          waitlistOfferPatientIds: parsed.demoState.waitlistOfferPatientIds ?? [],
          reviewedPatientIds: parsed.demoState.reviewedPatientIds ?? [],
          };
          demoStateRef.current = nextState;
          setDemoState(nextState);
        }
      }, 0);
      return () => window.clearTimeout(timer);
    } catch { /* Ignore stale presentation state. */ }
  }, []);

  const setCareRequest = useCallback((value: CareRequest) => {
    careRequestRef.current = value;
    setCareRequestState(value);
    persist(value, demoStateRef.current);
  }, [persist]);

  const updateDemoState = useCallback((patch: Partial<DemoState>) => {
    const next = { ...demoStateRef.current, ...patch };
    demoStateRef.current = next;
    setDemoState(next);
    persist(careRequestRef.current, next);
  }, [persist]);

  const resetDemo = useCallback((options?: { silent?: boolean }) => {
    setCareRequestState(initialCareRequest);
    setDemoState(initialDemoState);
    careRequestRef.current = initialCareRequest;
    demoStateRef.current = initialDemoState;
    persist(initialCareRequest, initialDemoState);
    if (!options?.silent) {
      setToast("Demo reset for a fresh presentation");
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
      toastTimer.current = window.setTimeout(() => setToast(null), 3200);
    }
  }, [persist]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  useEffect(() => () => { if (toastTimer.current) window.clearTimeout(toastTimer.current); }, []);

  const value = useMemo(() => ({ careRequest, setCareRequest, demoState, updateDemoState, resetDemo, toast, showToast }), [careRequest, demoState, resetDemo, setCareRequest, showToast, toast, updateDemoState]);

  return (
    <DemoContext.Provider value={value}>
      {children}
      {toast && <div className="toast" role="status">{toast}</div>}
    </DemoContext.Provider>
  );
}

export function useDemo(): DemoContextValue {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemo must be used within DemoProvider");
  return context;
}
