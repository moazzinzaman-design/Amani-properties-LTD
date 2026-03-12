"use client";
import { useEffect, useState } from "react";
import { getSystemHealth, type SystemMetrics } from "@/app/actions";

export default function SystemHealth() {
  const [stats, setStats] = useState<SystemMetrics>({
    cpuLoad: 0, memUsedPercent: 0, memFreeGb: 0, memTotalGb: 0, uptime: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const update = async () => {
      try {
        const data = await getSystemHealth();
        setStats(data);
      } catch { /* fallback stays at 0 */ }
      setLoading(false);
    };

    update();
    const timer = setInterval(update, 3000);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-3 text-sm">
      {loading && <div className="text-xs text-slate-500 animate-pulse">Fetching live metrics…</div>}
      <div className="flex justify-between items-center">
        <span className="text-slate-500 font-mono text-xs">CPU_LOAD</span>
        <span className={`font-mono text-xs ${stats.cpuLoad > 80 ? 'text-rose-400' : stats.cpuLoad > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
          {stats.cpuLoad}%
        </span>
      </div>
      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            stats.cpuLoad > 80 ? 'bg-rose-500' : stats.cpuLoad > 50 ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${stats.cpuLoad}%` }}
        />
      </div>

      <div className="flex justify-between items-center pt-2">
        <span className="text-slate-500 font-mono text-xs">RAM_ACTIVE</span>
        <span className="text-blue-400 font-mono text-xs">{stats.memUsedPercent}%</span>
      </div>
      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${stats.memUsedPercent}%` }} />
      </div>

      <div className="flex justify-between items-center pt-2">
        <span className="text-slate-500 font-mono text-xs">AVAILABLE</span>
        <span className="text-slate-300 font-mono text-xs">{stats.memFreeGb} / {stats.memTotalGb} GB</span>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-white/5">
        <span className="text-slate-500 font-mono text-xs">UPTIME</span>
        <span className="text-cyan-400 font-mono text-xs">{formatUptime(stats.uptime)}</span>
      </div>
    </div>
  );
}
