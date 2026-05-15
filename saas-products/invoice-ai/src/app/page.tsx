"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Zap, Shield, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white selection:bg-indigo-500/30">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center font-bold">I</div>
          <span className="text-xl font-black tracking-tight">Invoice<span className="text-indigo-400">AI</span></span>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Login</Link>
          <Link href="/dashboard" className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm font-bold transition-all shadow-lg shadow-indigo-500/20">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6"
        >
          Built for UK Freelancers
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-7xl font-black tracking-tighter mb-8 leading-[1.1]"
        >
          Pro Invoices Generated in <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent italic underline decoration-indigo-500/30">Seconds</span>.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Describe your work in plain English. Our AI generates the line items, handles VAT, and exports a professional PDF. 100% compliant with UK standards.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/dashboard" className="px-8 py-4 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-bold flex items-center justify-center gap-2 transition-all group shadow-xl shadow-indigo-500/20">
            Start Generating Free <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="px-8 py-4 glass rounded-xl font-bold hover:bg-white/5 transition-all">View Demo</button>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Zap className="text-amber-400" />, title: "AI Prompt to Invoice", desc: "Just say 'Build a React site for a coffee shop' and we generate the technical line items." },
            { icon: <CheckCircle2 className="text-emerald-400" />, title: "MTD Compliant", desc: "Ready for Making Tax Digital with automated VAT tracking and export logs." },
            { icon: <Shield className="text-indigo-400" />, title: "Stripe Integration", desc: "Accept card payments directly on your invoices and get paid 2x faster." }
          ].map((f, i) => (
            <div key={i} className="p-8 rounded-2xl glass glass-hover transition-all">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6">{f.icon}</div>
              <h3 className="text-xl font-bold mb-3">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
