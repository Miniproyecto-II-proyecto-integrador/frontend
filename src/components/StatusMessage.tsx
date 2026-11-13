import type { ReactNode } from 'react';

type StatusMessageProps = {
  type: 'error' | 'success';
  children: ReactNode;
};

export default function StatusMessage({ type, children }: StatusMessageProps) {
  const isError = type === 'error';

  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${isError ? 'border-red-500/40 bg-red-500/10 text-red-300' : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'}`}
    >
      <span aria-hidden="true" className="font-bold">{isError ? '!' : '✓'}</span>
      <div>{children}</div>
    </div>
  );
}
