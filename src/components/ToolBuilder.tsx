"use client";
import { useState } from "react";
import { Hammer, Zap, Play, Settings } from "lucide-react";

export default function ToolBuilder() {
  const [status, setStatus] = useState("Idle");

  const runTest = () => {
    setStatus("Testing_Bridge...");
    setTimeout(() => setStatus("Ready_to_Deploy"), 2000);
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-blue-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <Hammer size={14} /> Tool_Forge_v1
        </h2>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">API: Rate_Limited</span>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-black/40 border border-slate-800 rounded-xl space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-mono">Module: Lead_Scraper_HX1</span>
            <Settings size={12} className="text-slate-600 hover:text-blue-400 cursor-pointer" />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-mono">Output: WhatsApp_Alert</span>
            <Zap size={12} className="text-yellow-500" />
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={runTest}
            className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 py-2 rounded-lg text-xs font-bold transition-all"
          >
            {status === "Idle" ? "TEST_LOGIC" : status.toUpperCase()}
          </button>
          <button className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-lg transition-all">
            <Play size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
