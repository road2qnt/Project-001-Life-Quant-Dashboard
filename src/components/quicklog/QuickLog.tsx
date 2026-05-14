"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchDomains, postEvent, type Domain } from "@/src/lib/api";

interface QuickLogProps {
  onEventLogged?: () => void;
}

export function QuickLog({ onEventLogged }: QuickLogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [value, setValue] = useState(5);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Cleanup toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Fetch domains on mount
  useEffect(() => {
    fetchDomains()
      .then((d) => {
        setDomains(d);
        if (d.length > 0) setSelectedId(d[0].id);
      })
      .catch(() => {});
  }, []);

  // Auto-focus value input + reset form when panel opens
  useEffect(() => {
    if (!isOpen) return;

    const focusTimer = setTimeout(() => inputRef.current?.focus(), 150);

    // Reset form to sensible defaults
    setNote("");
    setError(null);

    // Set initial value based on domain type
    const domain = domains.find((d) => d.id === selectedId);
    if (domain?.type === "boolean") {
      setValue(0);
    } else {
      const mid = ((domain?.minValue ?? 0) + (domain?.maxValue ?? 10)) / 2;
      setValue(Math.round(mid));
    }

    return () => clearTimeout(focusTimer);
  }, [isOpen]);

  // Keyboard shortcut: L to toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Only if not typing in an input
      if (
        e.key === "l" &&
        !e.metaKey &&
        !e.ctrlKey &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA" &&
        document.activeElement?.tagName !== "SELECT"
      ) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      // Escape to close
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  const selectedDomain = domains.find((d) => d.id === selectedId);

  // Determine input constraints based on domain type
  const maxValue = selectedDomain?.maxValue ?? 10;
  const minValue = selectedDomain?.minValue ?? 0;
  const step = selectedDomain?.type === "boolean" ? 1 : selectedDomain?.type === "scale" ? 1 : 0.5;
  const displayValue =
    selectedDomain?.type === "boolean" ? (value >= 1 ? "Yes" : "No") : `${value}${selectedDomain?.unit ? ` ${selectedDomain.unit}` : ""}`;

  const handleSubmit = useCallback(async () => {
    if (!selectedId) return;

    setSubmitting(true);
    setError(null);

    try {
      await postEvent(selectedId, value, note || undefined);
      setToast(`${selectedDomain?.icon ?? ""} ${selectedDomain?.label ?? ""} logged: ${displayValue}`);
      setIsOpen(false);
      onEventLogged?.();

      toastTimerRef.current = setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log event");
    } finally {
      setSubmitting(false);
    }
  }, [selectedId, value, note, selectedDomain, displayValue, onEventLogged]);

  const handleValueChange = useCallback(
    (newValue: number) => {
      const clamped = Math.max(minValue, Math.min(maxValue, newValue));
      setValue(selectedDomain?.type === "boolean" ? (clamped >= 1 ? 1 : 0) : clamped);
    },
    [minValue, maxValue, selectedDomain]
  );

  // ─── Toast notification ──────────────────────────────────────────────

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 right-6 z-50 animate-slide-up rounded-lg border border-border bg-surface-raised px-4 py-3 shadow-lg">
          <div className="flex items-center gap-2">
            <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
              <circle cx={8} cy={8} r={6} fill="var(--color-positive)" opacity={0.2} />
              <path
                d="M5 8l2 2 4-4"
                stroke="var(--color-positive)"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-sm text-white">{toast}</p>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full 
                   bg-positive text-black shadow-lg transition-all duration-200 
                   hover:scale-105 hover:shadow-xl active:scale-95"
        aria-label="Log event"
        title="Log event (L)"
      >
        <svg
          width={20}
          height={20}
          viewBox="0 0 20 20"
          fill="none"
          className="transition-transform duration-200"
          style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
        </svg>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed bottom-0 right-0 z-50 w-full max-w-sm transform border border-border bg-surface 
                    shadow-2xl transition-transform duration-300 ease-out
                    ${isOpen ? "translate-y-0" : "translate-y-full"}
                    rounded-t-2xl border-b-0 sm:bottom-6 sm:right-6 sm:w-80 sm:rounded-2xl sm:border-b`}
      >
        {/* Handle bar (mobile) */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:hidden">
          <span className="text-sm font-medium text-white">Log Event</span>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-md p-1 text-neutral hover:text-white"
          >
            <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {/* Mobile drag handle */}
        <div className="mx-auto mt-1 h-1 w-8 rounded-full bg-border sm:hidden" />

        <div className="space-y-4 p-4">
          {/* Header (desktop) */}
          <div className="hidden items-center justify-between sm:flex">
            <h2 className="text-sm font-medium text-white">Log Event</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-md p-1 text-neutral hover:text-white"
            >
              <svg width={14} height={14} viewBox="0 0 16 16" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Domain selector */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral">Domain</label>
            <select
              value={selectedId}
              onChange={(e) => {
                setSelectedId(e.target.value);
                const domain = domains.find((d) => d.id === e.target.value);
                if (domain) {
                  const mid = (domain.minValue + domain.maxValue) / 2;
                  setValue(domain.type === "boolean" ? 0 : Math.round(mid));
                }
              }}
              className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-white 
                         focus:outline-none focus:ring-2 focus:ring-positive/50"
            >
              {domains.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.icon ?? ""} {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Value input */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium text-neutral">Value</label>
              <span className="text-sm font-mono text-white">{displayValue}</span>
            </div>

            {selectedDomain?.type === "boolean" ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setValue(0)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
                    value === 0
                      ? "border-negative/50 bg-negative/10 text-negative"
                      : "border-border text-neutral hover:text-white"
                  }`}
                >
                  No
                </button>
                <button
                  onClick={() => setValue(1)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
                    value === 1
                      ? "border-positive/50 bg-positive/10 text-positive"
                      : "border-border text-neutral hover:text-white"
                  }`}
                >
                  Yes
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <input
                  ref={inputRef}
                  type="range"
                  min={minValue}
                  max={maxValue}
                  step={step}
                  value={value}
                  onChange={(e) => handleValueChange(parseFloat(e.target.value))}
                  className="flex-1 accent-positive"
                />
                <input
                  type="number"
                  min={minValue}
                  max={maxValue}
                  step={step}
                  value={value}
                  onChange={(e) => handleValueChange(parseFloat(e.target.value) || 0)}
                  className="w-16 rounded-lg border border-border bg-surface-raised px-2 py-1.5 text-center text-sm font-mono text-white
                             focus:outline-none focus:ring-2 focus:ring-positive/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral">
              Note <span className="text-neutral/50">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 280))}
              placeholder="Quick context..."
              rows={2}
              className="w-full resize-none rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-white 
                         placeholder-neutral/40 focus:outline-none focus:ring-2 focus:ring-positive/50"
            />
            <p className="mt-1 text-right text-xs text-neutral/50">{note.length}/280</p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-negative/30 bg-negative/5 px-3 py-2">
              <p className="text-xs text-negative">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting || !selectedId}
            className="w-full rounded-lg bg-positive py-2.5 text-sm font-medium text-black transition-all 
                       hover:bg-positive/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx={12} cy={12} r={10} stroke="currentColor" strokeWidth={3} opacity={0.25} />
                  <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
                </svg>
                Logging...
              </span>
            ) : (
              "Log Event"
            )}
          </button>
        </div>
      </div>
    </>
  );
}
