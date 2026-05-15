"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Code2, Cpu, ArrowRight, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { clsx as cx } from 'clsx';

export default function SummitForgeLandingPage() {
  const [hoveredTier, setHoveredTier] = useState<number | null>(null);

  const tiers = [
    {
      id: 1,
      name: "Website Refresh & Optimisation",
      price: "£300",
      description: "Perfect for local businesses that already have a website but need a modern facelift, better mobile responsiveness, and a speed boost.",
      features: ["Complete UI/UX Redesign", "Mobile & Tablet Optimization", "Speed & Performance Audit", "Basic SEO Tuning", "14 Days Post-Launch Support"],
      link: "https://www.paypal.com/ncp/payment/SL5S9DW2G6KXG",
      popular: false,
      color: "from-blue-600 to-blue-400"
    },
    {
      id: 2,
      name: "Website Design & Development",
      price: "£500",
      description: "A complete custom-built website from scratch. Designed specifically to convert local traffic into high-value leads.",
      features: ["Custom 5-Page Website Build", "Copywriting & Content Structure", "Contact Forms & Lead Capture", "Google Maps Integration", "30 Days Priority Support"],
      link: "https://www.paypal.com/ncp/payment/A2KVSJ2XWG6JG",
      popular: true,
      color: "from-amber-500 to-amber-300"
    },
    {
      id: 3,
      name: "Premium Build & Digital Strategy",
      price: "£800",
      description: "Our enterprise-level offering. We don't just build a website; we architect an entire digital revenue pipeline for your business.",
      features: ["Up to 10 Custom Pages", "Advanced SEO & Local Ranking", "AI-Powered Chatbot Integration", "Automated Booking/Invoicing Systems", "60 Days Elite Support & Strategy"],
      link: "https://www.paypal.com/ncp/payment/CA33ZAJ79BDSY",
      popular: false,
      color: "from-emerald-500 to-emerald-300"
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-amber-500/30 overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-amber-500/5 blur-[150px]" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[100vw] h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        <div className="absolute top-[60%] left-[50%] -translate-x-1/2 w-[100vw] h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-400 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <Rocket size={20} className="text-black" />
            </div>
            <span className="text-xl font-black tracking-tighter text-white">SUMMIT FORGE <span className="text-amber-500">AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-400">
            <a href="#services" className="hover:text-white transition-colors">Services</a>
            <a href="#process" className="hover:text-white transition-colors">Our Process</a>
            <a href="mailto:Zenithaiagency@outlook.com" className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-widest mb-8"
        >
          <Zap size={14} /> Next-Generation Web Agency
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1] text-white mb-6"
        >
          We Build Websites That <br className="hidden md:block" />
          <span className="bg-gradient-to-r from-amber-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent">Print Money.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12"
        >
          Summit Forge AI engineers high-performance, futuristic digital experiences for businesses that refuse to settle for average. Stop losing clients to competitors with better websites.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <a href="#pricing" className="px-8 py-4 rounded-full bg-amber-500 text-black font-black uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:scale-105 transition-transform flex items-center gap-2">
            View Our Packages <ArrowRight size={16} />
          </a>
        </motion.div>
      </section>

      {/* Value Props */}
      <section id="process" className="py-24 px-6 border-y border-white/5 bg-white/[0.02] relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-400 border border-blue-500/20">
              <Code2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Modern Architecture</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Built on Next.js and React, your site will load in milliseconds, securing higher Google rankings and better user retention.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 text-amber-400 border border-amber-500/20">
              <Cpu size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">AI-Ready Infrastructure</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Future-proof your business. Our premium builds include seamless hooks for automated chatbots and CRM integrations.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Bank-Grade Security</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Every site is deployed on enterprise-grade Vercel edge networks, ensuring 99.99% uptime and bulletproof security.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-4">Transparent Pricing.</h2>
          <p className="text-slate-400">Choose the package that aligns with your growth goals.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div 
              key={tier.id}
              onMouseEnter={() => setHoveredTier(tier.id)}
              onMouseLeave={() => setHoveredTier(null)}
              className={cx(
                "relative flex flex-col p-8 rounded-3xl border transition-all duration-500",
                tier.popular ? "bg-amber-500/5 border-amber-500/30" : "bg-white/5 border-white/10 hover:border-white/20",
                hoveredTier === tier.id ? "scale-[1.02]" : "scale-100"
              )}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                <p className="text-sm text-slate-400 h-16">{tier.description}</p>
              </div>

              <div className="mb-8">
                <span className="text-5xl font-black tracking-tighter text-white">{tier.price}</span>
                <span className="text-slate-500 font-medium">/one-off</span>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                    <CheckCircle2 size={18} className={cx("shrink-0", tier.popular ? "text-amber-400" : "text-emerald-400")} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a 
                href={tier.link}
                target="_blank"
                rel="noreferrer"
                className={cx(
                  "w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs text-center transition-all",
                  tier.popular 
                    ? "bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:bg-amber-400" 
                    : "bg-white/5 text-white border border-white/10 hover:bg-white/10"
                )}
              >
                Purchase Securely
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-center relative z-10">
        <p className="text-slate-500 text-sm font-medium">© 2026 Summit Forge AI. Built for the future.</p>
      </footer>
    </div>
  );
}
