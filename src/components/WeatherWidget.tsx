"use client";
import { useEffect, useState } from "react";
import { Cloud, Sun } from "lucide-react";

export default function WeatherWidget() {
  const [data, setData] = useState<{ temperature: number; windspeed: number } | null>(null);
  
  useEffect(() => {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=53.727&longitude=-1.861&current_weather=true")
      .then(res => res.json())
      .then(d => setData(d.current_weather));
  }, []);

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-slate-900/80 border border-slate-800 rounded-full">
      <div className="flex items-center gap-2">
        {(data?.temperature ?? 0) > 10 ? <Sun size={16} className="text-yellow-400" /> : <Cloud size={16} className="text-blue-300" />}
        <span className="font-mono text-sm">{data ? `${Math.round(data.temperature)}°C` : "--°C"}</span>
      </div>
      <div className="h-4 w-[1px] bg-slate-700" />
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Halifax_UK</span>
    </div>
  );
}
