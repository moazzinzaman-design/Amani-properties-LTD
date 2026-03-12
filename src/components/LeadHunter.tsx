"use client";
import { useState } from "react";
import { Search, MapPin, ExternalLink } from "lucide-react";

export default function LeadHunter() {
  const [loading, setLoading] = useState(false);
  const [leads] = useState([
    { name: "Halifax Central Coffee", issue: "No Website", contact: "Pending" },
    { name: "West End Garage", issue: "Broken Links", contact: "Detected" }
  ]);

  return (
    <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-amber-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <Search size={14} /> Market_Intelligence // HX1
        </h2>
        <button 
          onClick={() => {setLoading(true); setTimeout(() => setLoading(false), 2000);}}
          className="text-[10px] font-mono bg-amber-500/10 text-amber-500 px-2 py-1 rounded border border-amber-500/20 hover:bg-amber-500/20"
        >
          {loading ? "SCANNING..." : "SCAN_LOCAL_LEADS"}
        </button>
      </div>

      <div className="space-y-3">
        {leads.map((lead, i) => (
          <div key={i} className="group p-3 bg-black/20 border border-slate-800 rounded-xl hover:border-amber-500/40 transition-all cursor-pointer">
            <div className="flex justify-between items-start mb-1">
              <span className="text-sm font-mono text-slate-200">{lead.name}</span>
              <ExternalLink size={12} className="text-slate-600 group-hover:text-amber-400" />
            </div>
            <div className="flex gap-2">
              <span className="text-[10px] font-mono text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">
                {lead.issue}
              </span>
              <span className="text-[10px] font-mono text-slate-500 py-0.5 flex items-center gap-1">
                <MapPin size={10} /> Halifax
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
