'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="bg-black text-white p-20 font-mono">
        <h2 className="text-red-500 mb-4">CRITICAL_SYSTEM_HALT</h2>
        <p className="text-xs text-slate-400 mb-8">{error.message}</p>
        <button 
          className="bg-white text-black px-4 py-2 rounded font-bold"
          onClick={() => reset()}
        >
          REBOOT_DASHBOARD
        </button>
      </body>
    </html>
  );
}
