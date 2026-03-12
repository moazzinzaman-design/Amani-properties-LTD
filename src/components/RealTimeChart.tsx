"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function RealTimeChart() {
  const [data, setData] = useState<number[]>(Array(20).fill(20));

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => [...prev.slice(1), Math.floor(Math.random() * 60) + 20]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest">
          Telemetry Stream // Node_01
        </h2>
        <span className="text-blue-400 text-[10px] font-mono animate-pulse">LIVE FEED</span>
      </div>
      
      <div className="h-32 flex items-end gap-1 px-2">
        {data.map((value, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${value}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex-1 bg-gradient-to-t from-blue-600/20 to-blue-400/60 rounded-t-sm"
          />
        ))}
      </div>
      <div className="mt-4 flex justify-between text-[10px] font-mono text-slate-600">
        <span>T-20s</span>
        <span>T-0s</span>
      </div>
    </div>
  );
}
