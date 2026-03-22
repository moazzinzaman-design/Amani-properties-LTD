'use client';

import { useState } from 'react';
import { CreditCard, ShieldCheck } from 'lucide-react';

export default function BillingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (plan: 'pro' | 'enterprise') => {
    setLoading(plan);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, email: 'demo@amani-properties.com' })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.message || 'Checkout failed');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during checkout.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto mt-12">
        <h1 className="text-4xl font-bold mb-4 font-mono text-cyan-400">Mission Control Subscriptions</h1>
        <p className="text-gray-400 mb-12">Upgrade to unlock the full potential of your 10-Agent Swarm.</p>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Pro Tier */}
          <div className="border border-white/10 bg-white/5 backdrop-blur-md rounded-2xl p-8 hover:border-cyan-500/50 transition-colors">
            <h2 className="text-2xl font-bold mb-2">Pro Tier</h2>
            <div className="text-4xl font-bold mb-6">£29<span className="text-xl text-gray-500 font-normal">/mo</span></div>
            <ul className="space-y-4 mb-8 text-gray-300">
              <li className="flex items-center gap-2"><ShieldCheck className="text-cyan-400 w-5 h-5"/> Access to 5 Core Agents</li>
              <li className="flex items-center gap-2"><ShieldCheck className="text-cyan-400 w-5 h-5"/> 100 Automated Tasks / month</li>
              <li className="flex items-center gap-2"><ShieldCheck className="text-cyan-400 w-5 h-5"/> Basic Analytics reporting</li>
            </ul>
            <button 
              onClick={() => handleCheckout('pro')}
              disabled={loading !== null}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {loading === 'pro' ? 'Loading...' : <><CreditCard className="w-5 h-5" /> Subscribe to Pro</>}
            </button>
          </div>

          {/* Enterprise Tier */}
          <div className="border border-purple-500/30 bg-purple-900/10 backdrop-blur-md rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-purple-500text-xs font-bold px-3 py-1 rounded-bl-lg">RECOMMENDED</div>
            <h2 className="text-2xl font-bold mb-2 text-purple-400">Enterprise Swarm</h2>
            <div className="text-4xl font-bold mb-6">£99<span className="text-xl text-gray-500 font-normal">/mo</span></div>
            <ul className="space-y-4 mb-8 text-gray-300">
              <li className="flex items-center gap-2"><ShieldCheck className="text-purple-400 w-5 h-5"/> Full 10-Agent Swarm Access</li>
              <li className="flex items-center gap-2"><ShieldCheck className="text-purple-400 w-5 h-5"/> Unlimited Automated Tasks</li>
              <li className="flex items-center gap-2"><ShieldCheck className="text-purple-400 w-5 h-5"/> Custom Subagent Blueprints</li>
              <li className="flex items-center gap-2"><ShieldCheck className="text-purple-400 w-5 h-5"/> Priority Support Engine</li>
            </ul>
            <button 
              onClick={() => handleCheckout('enterprise')}
              disabled={loading !== null}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {loading === 'enterprise' ? 'Loading...' : <><CreditCard className="w-5 h-5" /> Deploy Enterprise Swarm</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
