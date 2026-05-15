"use client";
import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export default function ClientsPage() {
  const [clients] = useState([
    { id: "1", name: "Coffee Co", email: "hello@coffee.co", address: "12 High St, Leeds LS1 2QT", invoices: 4 },
    { id: "2", name: "Digital Labs", email: "team@digitallabs.io", address: "Unit 5, Tech Park, Manchester M1 4FN", invoices: 7 },
    { id: "3", name: "Freelance Hub", email: "accounts@fhub.com", address: "88 King St, London EC2V 8AS", invoices: 2 },
  ]);
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-10">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Client Directory</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your clients and billing info.</p>
          </div>
          <button className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all">
            <Plus size={16} /> Add Client
          </button>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map(c => (
            <div key={c.id} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-indigo-500/30 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-sm">{c.name.charAt(0)}</div>
                <button className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
              </div>
              <h3 className="font-bold text-lg">{c.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{c.email}</p>
              <p className="text-[10px] text-slate-600 mt-1">{c.address}</p>
              <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{c.invoices} Invoices</span>
                <button className="text-[10px] font-bold text-indigo-400">View →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
