"use client";
import { useState, useEffect } from "react";
import { CheckSquare, Square, Trash2, Plus } from "lucide-react";

export default function TaskList() {
  const [tasks, setTasks] = useState<{ id: number; text: string; done: boolean }[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("mission_tasks");
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("mission_tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: input, done: false }]);
    setInput("");
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 h-full flex flex-col">
      <h2 className="text-blue-400/60 text-xs font-bold uppercase tracking-widest mb-4">Operations_Queue</h2>
      
      <form onSubmit={addTask} className="flex gap-2 mb-4">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="New Objective..."
          className="bg-black/40 border border-slate-800 rounded-lg px-3 py-1.5 text-sm font-mono w-full focus:outline-none focus:border-blue-500/50"
        />
        <button type="submit" className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 hover:bg-blue-500/20">
          <Plus size={16} />
        </button>
      </form>

      <ul className="space-y-2 overflow-y-auto max-h-[250px] pr-2 scrollbar-hide">
        {tasks.map(task => (
          <li key={task.id} className="flex items-center justify-between group bg-white/5 p-2 rounded-lg border border-transparent hover:border-slate-700 transition-all">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleTask(task.id)}>
              {task.done ? <CheckSquare size={16} className="text-emerald-400" /> : <Square size={16} className="text-slate-600" />}
              <span className={`text-sm font-mono ${task.done ? 'line-through text-slate-600' : 'text-slate-300'}`}>
                {task.text}
              </span>
            </div>
            <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity">
              <Trash2 size={14} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
