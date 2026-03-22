'use client';

import { useState } from 'react';
import { Search, Loader2, CheckCircle, FileText } from 'lucide-react';

export default function SEOPage() {
  const [topic, setTopic] = useState('');
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'generating' | 'complete'>('idle');
  const [taskId, setTaskId] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;
    
    setStatus('generating');
    
    try {
      // 1. Dispatch the Analyst Agent Request
      const res = await fetch('/api/revenue/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, url })
      });
      const data = await res.json();
      
      if (data.success) {
        setTaskId(data.task_id);
        
        // 2. Mock polling loop to wait for Analyst (ordinarily we'd poll supabase directly or via websocket)
        setTimeout(() => {
          setStatus('complete');
        }, 3000); // Simulated delay for demo
        
      } else {
        alert(data.error);
        setStatus('idle');
      }
    } catch (err) {
      console.error(err);
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <div className="max-w-3xl mx-auto mt-12">
        <h1 className="text-4xl font-bold mb-2 text-emerald-400 flex items-center gap-3">
          <Search className="w-8 h-8"/> 
          Analyst Agent: SEO Generator
        </h1>
        <p className="text-gray-400 mb-10">Deploy the Analyst to scrape competitor data and generate a premium SEO audit report automatically.</p>
        
        <div className="bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-md mb-8">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Target Keyword / Topic Focus</label>
              <input 
                type="text" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. 'Luxury Property London'"
                className="w-full bg-black/50 border border-emerald-500/30 rounded p-3 text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Competitor URL to Scrape (Optional)</label>
              <input 
                type="url" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-black/50 border border-emerald-500/30 rounded p-3 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={status !== 'idle'}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
            >
              {status === 'generating' ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyst Agent Working...</> : 'Dispatch Analyst Agent'}
            </button>
          </form>
        </div>

        {status === 'complete' && (
          <div className="bg-emerald-900/20 border border-emerald-500 p-6 rounded-xl animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-emerald-400 flex items-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6" /> 
              Report Generated Successfully
            </h3>
            <p className="text-gray-300 mb-4">
              The Analyst has completed scraping the data for &quot;{topic}&quot; and compiled the findings. Task ID: {taskId}.
            </p>
            <div className="flex gap-4">
              <button className="flex-1 py-2 bg-black border border-emerald-500 hover:bg-emerald-900/50 rounded flex justify-center items-center gap-2 text-emerald-400 transition-colors">
                <FileText className="w-4 h-4" /> View PDF
              </button>
              <button className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-white font-bold transition-colors">
                Sell Report via Stripe
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
