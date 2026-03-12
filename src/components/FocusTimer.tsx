"use client";
import { useState, useEffect } from "react";
import { Play, Square, Coffee } from "lucide-react";

export default function FocusTimer() {
  const [seconds, setSeconds] = useState(1500); // 25 mins
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => setSeconds(s => s - 1), 1000);
    } else if (seconds === 0) {
      setIsActive(false);
      new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play();
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isActive, seconds]);

  const format = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
      <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Focus_Engine</h2>
      <div className="text-4xl font-mono text-blue-400 mb-6 flex justify-center">{format(seconds)}</div>
      <div className="flex gap-2 justify-center">
        <button onClick={() => setIsActive(!isActive)} className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20">
          {isActive ? <Square size={18} /> : <Play size={18} />}
        </button>
        <button onClick={() => {setIsActive(false); setSeconds(1500);}} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700">
          <Coffee size={18} />
        </button>
      </div>
    </div>
  );
}
