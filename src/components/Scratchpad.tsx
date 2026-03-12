"use client";
import { useState, useEffect } from "react";
import { Edit3 } from "lucide-react";

export default function Scratchpad() {
  const [note, setNote] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("mission_notes");
    if (saved) setNote(saved);
  }, []);

  const handleChange = (val: string) => {
    setNote(val);
    localStorage.setItem("mission_notes", val);
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col h-[200px]">
      <div className="flex items-center gap-2 mb-4">
        <Edit3 size={14} className="text-blue-400" />
        <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Scratchpad_v1</h2>
      </div>
      <textarea
        value={note}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Type a quick thought..."
        className="w-full h-full bg-transparent text-slate-300 font-mono text-sm resize-none focus:outline-none scrollbar-hide"
      />
    </div>
  );
}
