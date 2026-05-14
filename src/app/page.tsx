"use client";

import { useState, useCallback } from "react";
import { Heatmap } from "@/src/components/heatmap/Heatmap";
import { QuickLog } from "@/src/components/quicklog/QuickLog";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEventLogged = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-white">
                Life Quant Dashboard
              </h1>
              <p className="mt-0.5 text-sm text-neutral">
                Personal behavioral analytics
              </p>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main>
          <div className="rounded-lg border border-border bg-surface p-6">
            <Heatmap weeks={52} refreshKey={refreshKey} />
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-neutral">
          <p>Local-first. Your data stays on your machine.</p>
        </footer>
      </div>

      {/* QuickLog FAB */}
      <QuickLog onEventLogged={handleEventLogged} />
    </div>
  );
}
