"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { initialCareRequest, initialDemoState } from "@/lib/demo-data";
import type { CareRequest, DemoState } from "@/lib/types";

interface DemoContextValue {
  careRequest: CareRequest;
  setCareRequest: (value: CareRequest) => void;
  demoState: DemoState;
  updateDemoState: (patch: Partial<DemoState>) => void;
  resetDemo: () => void;
  toast: string | null;
  showToast: (message: string) => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [careRequest, setCareRequestState] = useState<CareRequest>(initialCareRequest);
  const [demoState, setDemoState] = useState<DemoState>(initialDemoState);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("careflow-demo");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as { careRequest?: CareRequest; demoState?: DemoState };
      const timer = window.setTimeout(() => {
        if (parsed.careRequest) setCareRequestState(parsed.careRequest);
        if (parsed.demoState) setDemoState(parsed.demoState);
      }, 0);
      return () => window.clearTimeout(timer);
    } catch { /* Ignore stale presentation state. */ }
  }, []);

  const persist = useCallback((request: CareRequest, state: DemoState) => {
    window.localStorage.setItem("careflow-demo", JSON.stringify({ careRequest: request, demoState: state }));
    void fetch("/api/demo-state", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ careRequest: request, demoState: state }) }).catch(() => undefined);
  }, []);

  const setCareRequest = useCallback((value: CareRequest) => {
    setCareRequestState(value);
    setDemoState((state) => { persist(value, state); return state; });
  }, [persist]);

  const updateDemoState = useCallback((patch: Partial<DemoState>) => {
    setDemoState((state) => {
      const next = { ...state, ...patch };
      setCareRequestState((request) => { persist(request, next); return request; });
      return next;
    });
  }, [persist]);

  const resetDemo = useCallback(() => {
    setCareRequestState(initialCareRequest);
    setDemoState(initialDemoState);
    persist(initialCareRequest, initialDemoState);
    setToast("Demo reset for a fresh presentation");
  }, [persist]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3200);
  }, []);

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
