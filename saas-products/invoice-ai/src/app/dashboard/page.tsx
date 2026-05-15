"use client";
import React, { useState } from "react";
import { Plus, Search, FileText, CheckCircle2, Clock, AlertCircle, LayoutDashboard, Users, CreditCard, Settings } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("all");

  const stats = [
    { label: "Pending", value: "£2,450", icon: <Clock className="text-amber-400" />, change: "+12%" },
    { label: "Paid", value: "£14,800", icon: <CheckCircle2 className="text-emerald-400" />, change: "+5%" },
    { label: "Overdue", value: "£450", icon: <AlertCircle className="text-rose-400" />, change: "-2%" },
  ];

  const mockInvoices = [
    { id: "INV-001", client: "Coffee Co", amount: "£850.00", status: "paid", date: "Oct 12, 2023" },
    { id: "INV-002", client: "Digital Labs", amount: "£1,200.00", status: "pending", date: "Oct 15, 2023" },
    { id: "INV-003", client: "Freelance Hub", amount: "£300.00", status: "overdue", date: "Oct 05, 2023" },
  ];

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-500 rounded flex items-center justify-center font-bold text-xs">I</div>
            <span className="font-bold tracking-tight">InvoiceAI</span>
        </div>
        <nav className="flex flex-col gap-1">
          {[
            { id: "dash", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
            { id: "inv", label: "Invoices", icon: <FileText size={18} /> },
            { id: "cli", label: "Clients", icon: <Users size={18} /> },
            { id: "bill", label: "Billing", icon: <CreditCard size={18} /> },
            { id: "set", label: "Settings", icon: <Settings size={18} /> },
          ].map(item => (
            <button key={item.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors text-slate-400 hover:text-white">
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Financial Overview</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your freelance earnings and invoices.</p>
          </div>
          <button className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/10">
            <Plus size={16} /> New Invoice
          </button>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {stats.map((s, i) => (
            <div key={i} className="p-6 rounded-2xl glass border border-white/5">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-white/5 rounded-lg">{s.icon}</div>
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${s.change.startsWith("+") ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>{s.change}</span>
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{s.label}</p>
              <h2 className="text-3xl font-black mt-1">{s.value}</h2>
            </div>
          ))}
        </section>

        {/* Recent Invoices */}
        <section className="rounded-2xl glass border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <h3 className="font-bold">Recent Activity</h3>
            <div className="flex gap-2">
               <div className="relative">
                 <Search className="absolute left-2.5 top-2.5 text-slate-500" size={14} />
                 <input type="text" placeholder="Search..." className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 ring-indigo-500/50 w-48" />
               </div>
            </div>
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-500 border-b border-white/5">
                <th className="p-4 font-bold uppercase text-[10px] tracking-widest">ID</th>
                <th className="p-4 font-bold uppercase text-[10px] tracking-widest">Client</th>
                <th className="p-4 font-bold uppercase text-[10px] tracking-widest">Amount</th>
                <th className="p-4 font-bold uppercase text-[10px] tracking-widest">Date</th>
                <th className="p-4 font-bold uppercase text-[10px] tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockInvoices.map((inv, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer group">
                  <td className="p-4 font-mono text-xs">{inv.id}</td>
                  <td className="p-4 font-bold">{inv.client}</td>
                  <td className="p-4">{inv.amount}</td>
                  <td className="p-4 text-slate-400 text-xs">{inv.date}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${
                      inv.status === "paid" ? "bg-emerald-500/10 text-emerald-400" :
                      inv.status === "pending" ? "bg-amber-500/10 text-amber-400" :
                      "bg-rose-500/10 text-rose-400"
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
