"use client";
import React from "react";
import { CheckCircle2, Rocket, ArrowRight, Shield, Zap, Star } from "lucide-react";

interface Feature {
  title: string;
  description: string;
}

interface LandingPageProps {
  title: string;
  tagline: string;
  description: string;
  features: Feature[];
  price: string;
  ctaText: string;
}

export default function RevenueLandingPage({ 
  title, 
  tagline, 
  description, 
  features, 
  price, 
  ctaText 
}: LandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Hero Section */}
      <header className="relative pt-24 pb-16 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-indigo-600/20 to-transparent blur-3xl -z-10" />
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-bold uppercase tracking-widest animate-fade-in">
            <Rocket size={12} /> {tagline}
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 leading-tight">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-8 py-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-bold transition-all hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/20 flex items-center gap-2">
              {ctaText} <ArrowRight size={18} />
            </button>
            <div className="text-sm text-slate-500 flex items-center gap-2">
              <Shield size={14} className="text-emerald-400" /> 14-day money-back guarantee
            </div>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-slate-900/40 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="p-8 rounded-2xl border border-white/5 bg-slate-800/20 backdrop-blur-sm hover:border-indigo-400/20 transition-all group">
                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap size={24} className="text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing / Final CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-8 p-12 rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/10 to-transparent backdrop-blur-xl">
           <div className="flex justify-center mb-4">
             <div className="flex gap-1 text-yellow-400">
               {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
             </div>
           </div>
           <h2 className="text-3xl md:text-4xl font-bold">Ready to get started?</h2>
           <div className="py-4">
             <span className="text-5xl font-extrabold font-mono">{price}</span>
             <span className="text-slate-500 ml-2">one-time payment</span>
           </div>
           <ul className="space-y-3 inline-block text-left mb-8">
             {["Full source code access", "Lifetime updates", "Commercial license", "Priority support"].map(item => (
               <li key={item} className="flex items-center gap-2 text-slate-300">
                 <CheckCircle2 size={16} className="text-emerald-400" /> {item}
               </li>
             ))}
           </ul>
           <div>
             <button className="w-full sm:w-auto px-12 py-4 bg-white text-slate-950 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all hover:scale-105 active:scale-95">
               {ctaText}
             </button>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} {title}. Built autonomously by the Swarm.</p>
      </footer>
    </div>
  );
}
