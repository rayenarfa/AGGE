import React from 'react';

/**
 * A sleek, high-fidelity loading spinner with a glowing emerald track.
 */
export function Spinner({ className = 'h-6 w-6', ...props }) {
  return (
    <svg
      className={`animate-spin text-emerald-500 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * Centered loader suitable for full page or full screen panels.
 */
export function PageLoader({ message = 'Loading layout content...', className = '' }) {
  return (
    <div className={`flex min-h-[300px] flex-col items-center justify-center gap-4 ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Glow background */}
        <div className="absolute h-12 w-12 rounded-full bg-emerald-500/10 blur-xl animate-pulse-slow" />
        <Spinner className="h-10 w-10" />
      </div>
      <p className="text-sm font-medium text-slate-400 animate-pulse">{message}</p>
    </div>
  );
}

/**
 * Shimmering card placeholder matching EventCard / NewsCard layout.
 */
export function CardSkeleton({ count = 3 }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="flex flex-col rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 space-y-4 overflow-hidden relative"
        >
          {/* Shimmer overlay */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

          {/* Top category & label row */}
          <div className="flex justify-between items-center">
            <div className="h-5 w-20 rounded bg-slate-800" />
            <div className="h-4 w-16 rounded bg-slate-800/60" />
          </div>

          {/* Title block */}
          <div className="space-y-2">
            <div className="h-5 w-3/4 rounded bg-slate-800" />
            <div className="h-5 w-1/2 rounded bg-slate-800" />
          </div>

          {/* Date / Metadata info lines */}
          <div className="space-y-1">
            <div className="h-3 w-1/3 rounded bg-slate-800/70" />
            <div className="h-3 w-1/4 rounded bg-slate-800/50" />
          </div>

          {/* Paragraph body text skeletons */}
          <div className="space-y-2 pt-2 flex-1">
            <div className="h-3 w-full rounded bg-slate-800/40" />
            <div className="h-3 w-full rounded bg-slate-800/40" />
            <div className="h-3 w-4/5 rounded bg-slate-800/40" />
          </div>

          {/* Bottom link button */}
          <div className="h-4 w-24 rounded bg-slate-800/85 pt-2" />
        </div>
      ))}
    </div>
  );
}

/**
 * Shimmering placeholder mimicking tabular rows.
 */
export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/10 p-4 space-y-4 relative">
      {/* Shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

      {/* Table Headers */}
      <div className="flex gap-4 pb-2 border-b border-slate-800">
        {Array.from({ length: cols }).map((_, cIdx) => (
          <div
            key={cIdx}
            className="h-4 rounded bg-slate-800"
            style={{ width: cIdx === 0 ? '30%' : `${70 / (cols - 1)}%` }}
          />
        ))}
      </div>

      {/* Table Rows */}
      <div className="space-y-3.5 pt-2">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <div
                key={cIdx}
                className="h-3.5 rounded bg-slate-800/50"
                style={{ width: cIdx === 0 ? '30%' : `${70 / (cols - 1)}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Form field loader mockup representation.
 */
export function FormSkeleton({ fieldsCount = 4 }) {
  return (
    <div className="space-y-5 rounded-xl border border-slate-850 bg-slate-900/40 p-6 relative overflow-hidden">
      {/* Shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

      {/* Header mockup */}
      <div className="space-y-2 mb-6">
        <div className="h-5 w-40 rounded bg-slate-800" />
        <div className="h-3 w-72 rounded bg-slate-800/50" />
      </div>

      {/* Fields */}
      {Array.from({ length: fieldsCount }).map((_, idx) => (
        <div key={idx} className="space-y-2">
          <div className="h-3 w-28 rounded bg-slate-800/70" />
          <div className="h-10 w-full rounded-lg bg-slate-900 border border-slate-800" />
        </div>
      ))}

      {/* Submit Button placeholder */}
      <div className="h-10 w-36 rounded-lg bg-slate-800/90 mt-4" />
    </div>
  );
}
