"use client";
import React, { useState } from "react";
import { ArrowLeft, Sparkles, Send, Download, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

export default function NewInvoicePage() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [items, setItems] = useState([
    { id: 1, desc: "SaaS Development - Week 1", qty: 1, rate: 1200 },
  ]);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setItems([
        { id: Date.now()+1, desc: "Strategic Consulting", qty: 2, rate: 450 },
        { id: Date.now()+2, desc: "React Frontend Dev", qty: 10, rate: 85 },
        { id: Date.now()+3, desc: "Supabase Integration", qty: 5, rate: 90 },
      ]);
      setIsGenerating(false);
    }, 1500);
  };

  const total = items.reduce((acc, item) => acc + (item.qty * item.rate), 0);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-10">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm mb-6 w-fit">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <header className="mb-10">
          <h1 className="text-3xl font-black tracking-tight">Create New Invoice</h1>
          <p className="text-slate-500 mt-1">Use AI to generate line items from your job description.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-10">
          <div className="space-y-8">
            {/* AI Prompt Box */}
            <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 shadow-xl shadow-indigo-500/5">
              <label className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-3 block">AI Assistant</label>
              <div className="relative">
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Build a landing page for a law firm with 3 revisions and 1 month hosting..." 
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:ring-1 ring-indigo-500 min-h-[100px] resize-none"
                />
                <button 
                  onClick={handleGenerate}
                  disabled={!prompt || isGenerating}
                  className="absolute right-4 bottom-4 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-500 rounded-lg text-xs font-bold flex items-center gap-2 transition-all"
                >
                  {isGenerating ? "Thinking..." : <><Sparkles size={14} /> Generate Items</>}
                </button>
              </div>
            </div>

            {/* line items */}
            <div className="rounded-2xl border border-white/5 overflow-hidden">
               <table className="w-full text-left text-sm">
                 <thead className="bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">
                    <tr>
                      <th className="p-4">Description</th>
                      <th className="p-4 w-20">Qty</th>
                      <th className="p-4 w-32">Rate (£)</th>
                      <th className="p-4 w-32">Total</th>
                      <th className="p-4 w-10"></th>
                    </tr>
                 </thead>
                 <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-white/5 group">
                        <td className="p-4 font-medium">{item.desc}</td>
                        <td className="p-4">{item.qty}</td>
                        <td className="p-4">£{item.rate}</td>
                        <td className="p-4 font-bold text-indigo-300">£{item.qty * item.rate}</td>
                        <td className="p-4">
                           <button className="text-slate-600 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                    <tr className="hover:bg-white/[0.01] cursor-pointer">
                      <td colSpan={5} className="p-4 text-xs font-bold text-indigo-400 flex items-center gap-1">
                        <Plus size={14} /> Add Manual Item
                      </td>
                    </tr>
                 </tbody>
               </table>
            </div>
          </div>

          {/* Sidebar controls */}
          <aside className="space-y-6">
             <div className="p-6 rounded-2xl glass border border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Total Amount</p>
                <h2 className="text-4xl font-black">£{total.toLocaleString()}</h2>
                
                <div className="mt-8 space-y-3">
                  <button className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
                    <Send size={18} /> Send to Client
                  </button>
                  <button className="w-full py-3 glass hover:bg-white/5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm">
                    <Download size={18} /> Export PDF
                  </button>
                </div>
             </div>

             <div className="p-6 rounded-2xl glass border border-white/5 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 border-b border-white/5 pb-2">Client Info</h4>
                <div className="space-y-1">
                  <p className="text-xs font-bold">Coffee Co</p>
                  <p className="text-[10px] text-slate-500">hello@coffee.co</p>
                </div>
                <button className="text-[10px] font-bold text-indigo-400">Change Client</button>
             </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
