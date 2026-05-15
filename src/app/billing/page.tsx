'use client';

import { ShieldCheck, Rocket } from 'lucide-react';
import Link from 'next/link';

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8 flex justify-center">
          <div className="p-4 bg-purple-900/20 border border-purple-500/50 rounded-full">
            <ShieldCheck className="w-16 h-16 text-purple-400" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-4 font-mono text-purple-400">
          Enterprise Swarm Unlocked
        </h1>
        
        <p className="text-xl text-gray-300 mb-8 leading-relaxed">
          Premium subscription requirements have been removed. You now have full, unrestricted access to the complete 10-Agent Enterprise Swarm architecture.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12 text-left max-w-lg mx-auto">
          <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-3">
             <Rocket className="text-emerald-400 w-5 h-5" />
             <span className="text-sm font-bold text-gray-200">Unlimited Automated Tasks</span>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-3">
             <Rocket className="text-emerald-400 w-5 h-5" />
             <span className="text-sm font-bold text-gray-200">Custom Subagent Blueprints</span>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-3">
             <Rocket className="text-emerald-400 w-5 h-5" />
             <span className="text-sm font-bold text-gray-200">Full Agent Orchestration</span>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-3">
             <Rocket className="text-emerald-400 w-5 h-5" />
             <span className="text-sm font-bold text-gray-200">Zero Monthly Overhead</span>
          </div>
        </div>

        <Link 
          href="/"
          className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(168,85,247,0.3)]"
        >
          Return to Mission Control
        </Link>
      </div>
    </div>
  );
}
