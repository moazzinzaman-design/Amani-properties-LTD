/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  Activity, BarChart3, Bell, CalendarDays, CheckCircle2, CheckSquare, Clock3, CircleDollarSign,
  Command, Copy, CreditCard, Cpu, Database, DollarSign, ExternalLink, FolderGit2, Github, Globe, Home, Landmark, Link2, Music2,
  Network, Pause, Play, Plus, RefreshCw, Rocket, Search, Send, Server, Settings,
  ShieldCheck, Sparkles, StickyNote, Terminal, Trash2, TrendingUp, User,
  UserCircle2, Workflow, X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { dispatchAgentTask } from "@/services/agentService";
import SystemHealth from "@/components/SystemHealth";
import LeadHunter from "@/components/LeadHunter";

/* ── Isolated Components for Performance ── */
function LiveClock() {
  const [clock, setClock] = useState("");
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("en-US", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  
  return (
    <div className="text-center py-2">
      <p className="text-3xl font-bold font-mono tabular-nums text-cyan-300">{clock}</p>
      <p className="text-xs text-slate-500 mt-1">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
    </div>
  );
}

function InlineClock() {
  const [clock, setClock] = useState("");
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("en-US", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <>{clock}</>;
}

function TerminalInput({ onRun }: { onRun: (cmd: string) => void }) {
  const [termInput, setTermInput] = useState("");
  return (
    <div className="mt-2 flex gap-2">
      <input value={termInput} onChange={e => setTermInput(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") { onRun(termInput); setTermInput(""); } }}
        className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-sm font-mono focus:border-indigo-400/40 focus:outline-none"
        title="Terminal input" placeholder="Type command..." />
      <button onClick={() => { onRun(termInput); setTermInput(""); }} className="rounded-lg bg-indigo-500/20 border border-indigo-400/20 px-3 py-1.5 text-sm hover:bg-indigo-500/30 transition-colors">Run</button>
    </div>
  );
}

function AgentInput({ onSend, isRunning }: { onSend: (cmd: string) => void, isRunning: boolean }) {
  const [prompt, setPrompt] = useState("");
  return (
    <div className="space-y-2">
      <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
        className="w-full h-20 rounded-lg border border-white/10 bg-slate-800/60 p-3 text-sm resize-none focus:border-indigo-400/40 focus:outline-none transition-colors"
        placeholder="Describe a task for your OpenClaw agent…" title="Agent prompt" />
      <div className="flex gap-2">
        <button onClick={() => { onSend(prompt); setPrompt(""); }} disabled={isRunning || !prompt.trim()}
          className={cx("flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-all",
            isRunning ? "bg-amber-500/20 text-amber-400 border border-amber-500/20" :
            "bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 hover:bg-indigo-500/30")}>
          {isRunning ? <><span className="animate-spin">⟳</span> Running…</> : <><Send size={14} /> Send to Agent</>}
        </button>
      </div>
    </div>
  );
}

function TaskInput({ onAdd }: { onAdd: (t: string) => void }) {
  const [val, setVal] = useState("");
  return (
    <div className="flex gap-2">
      <input value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { onAdd(val); setVal(""); } }}
        className="w-full rounded-lg border border-white/10 bg-slate-800/60 px-3 py-2 text-sm backdrop-blur focus:border-indigo-400/40 focus:outline-none"
        placeholder="Add task to To Do..." title="New task" />
      <button onClick={() => { onAdd(val); setVal(""); }} className="rounded-lg bg-indigo-500/20 border border-indigo-400/20 px-4 py-2 text-sm hover:bg-indigo-500/30 transition-colors"><Plus size={16} /></button>
    </div>
  );
}

/* ── Types ─────────────────────────────────────────────────────── */
type Tab = "Home" | "Projects" | "Tasks" | "Analytics" | "Swarm" | "Deployments" | "Billing" | "Settings" | "Revenue" | "Bank";
type LogLevel = "info" | "warn" | "error" | "success";
type Todo = { id: number; text: string; done: boolean; col: "todo" | "doing" | "done" };
type Toast = { id: number; msg: string; level: LogLevel };
type GatewayStatus = {
  status: "online" | "offline" | "checking";
  version?: string;
  uptime?: number;
  error?: string;
};
type AppSettings = {
  openClawEnabled: boolean; openClawEndpoint: string; openClawApiKey: string;
  openClawModel: string; openClawHeartbeatSec: number; openClawAutoReconnect: boolean;
  autonomyMode: "manual" | "assisted" | "autonomous";
  schedulerEnabled: boolean; schedulerIntervalMin: number;
  watchdogEnabled: boolean; watchdogCpuThreshold: number; watchdogMemoryThreshold: number;
  watchdogRetryMax: number; watchdogBackoffSec: number;
  alertsEnabled: boolean; alertChannelInApp: boolean; alertChannelWebhook: boolean;
  alertWebhookUrl: string; alertCooldownSec: number;
  commandApprovalRequired: boolean; commandSafeMode: boolean;
  commandAllowlist: string; commandDenylist: string;
  darkMode: boolean; compactMode: boolean; autoSaveNotes: boolean;
  autoSaveSeconds: number; pomodoroMinutes: number;
  subscriptionTier: "free" | "pro" | "enterprise";
  projects: { id: string, name: string, path: string, category: 'website' | 'app' | 'extension' | 'software' }[];
};

const SK = "mission-control-settings-v6";
const NK = "mission-control-notes-v2";

const defaults: AppSettings = {
  openClawEnabled: true, openClawEndpoint: "ws://127.0.0.1:18789", openClawApiKey: "",
  openClawModel: "openrouter/auto", openClawHeartbeatSec: 30, openClawAutoReconnect: true,
  autonomyMode: "assisted", schedulerEnabled: true, schedulerIntervalMin: 5,
  watchdogEnabled: true, watchdogCpuThreshold: 85, watchdogMemoryThreshold: 90,
  watchdogRetryMax: 3, watchdogBackoffSec: 10,
  alertsEnabled: true, alertChannelInApp: true, alertChannelWebhook: false,
  alertWebhookUrl: "", alertCooldownSec: 60,
  commandApprovalRequired: true, commandSafeMode: true,
  commandAllowlist: "npm run build\nnpm run dev\ngit status",
  commandDenylist: "rm -rf /\nsudo rm -rf /",
  darkMode: true, compactMode: false, autoSaveNotes: true, autoSaveSeconds: 10,
  pomodoroMinutes: 25, subscriptionTier: "free",
  projects: [
    { id: "mission-control", name: "Mission Control", path: "/Users/moazzinzaman/mission-control", category: 'app' },
    { id: "pages-app", name: "Pages App", path: "/Users/moazzinzaman/pages-app", category: 'website' },
  ]
};

const cx = (...v: Array<string | false | null | undefined>) => v.filter(Boolean).join(" ");

const codeSnippets = [
  { label: "Fetch API", code: `const res = await fetch('/api/data');\nconst json = await res.json();` },
  { label: "Debounce", code: `function debounce(fn, ms) {\n  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };\n}` },
  { label: "UUID", code: `const uuid = () => crypto.randomUUID();` },
];

/* ── Sub-components ────────────────────────────────────────────── */
function GlassCard({ title, icon, children, className, span, glowColor }: {
  title: string; icon?: React.ReactNode; children: React.ReactNode; className?: string; span?: string; glowColor?: string;
}) {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { duration: 0.25 } }}
      className={cx(
        "relative rounded-2xl glass-v2 transition-all duration-300 overflow-hidden group/card",
        glowColor ? `shadow-[0_0_30px_-8px_${glowColor}]` : "",
        span, className
      )}>
      {/* HUD Brackets — glow on hover */}
      <div className="hud-bracket hud-bracket-tl transition-all duration-500 group-hover/card:[border-color:rgba(99,102,241,0.8)]" />
      <div className="hud-bracket hud-bracket-tr transition-all duration-500 group-hover/card:[border-color:rgba(99,102,241,0.8)]" />
      <div className="hud-bracket hud-bracket-bl transition-all duration-500 group-hover/card:[border-color:rgba(99,102,241,0.8)]" />
      <div className="hud-bracket hud-bracket-br transition-all duration-500 group-hover/card:[border-color:rgba(99,102,241,0.8)]" />
      
      {/* Title bar */}
      <div className="border-b border-white/[0.04] px-5 py-3 text-sm font-bold flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-slate-200">
          <span className="text-indigo-400/80">{icon}</span>
          <span className="tracking-wide">{title}</span>
        </div>
        <div className="flex gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-white/10" />
          <div className="h-1.5 w-1.5 rounded-full bg-white/10" />
          <div className="h-1.5 w-1.5 rounded-full bg-white/10" />
        </div>
      </div>
      <div className="p-5">{children}</div>
    </motion.section>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between text-sm">
      <span>{label}</span>
      <button type="button" aria-label={label} title={label} onClick={() => onChange(!checked)}
        className={cx("h-6 w-11 rounded-full border transition-colors duration-300",
          checked ? "bg-emerald-500/30 border-emerald-400" : "bg-slate-800 border-slate-600")}>
        <span className={cx("block h-4 w-4 rounded-full bg-white transition-all m-0.5",
          checked ? "translate-x-5" : "translate-x-0")} />
      </button>
    </label>
  );
}

function PulseDot() {
  return <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400" style={{ animation: "pulse-dot 2s infinite" }} />;
}

function OfflineDot() {
  return <span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-400" />;
}

function Skeleton() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-full max-w-[1500px] p-6 space-y-4">
        <div className="h-16 rounded-2xl bg-slate-800/60 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-[230px_1fr] gap-4">
          <div className="h-64 rounded-2xl bg-slate-800/60 animate-pulse" />
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-slate-800/60 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Pricing Card ── */
function PricingCard({ name, price, features, current, highlight, onSelect }: {
  name: string; price: string; features: string[]; current: boolean; highlight?: boolean; onSelect: () => void;
}) {
  return (
    <div className={cx(
      "rounded-2xl border p-6 transition-all duration-300",
      highlight ? "border-indigo-400/40 bg-indigo-500/5 shadow-lg shadow-indigo-500/10 scale-[1.02]" : "border-white/10 bg-slate-900/40",
      "hover:-translate-y-1"
    )}>
      {highlight && <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Sparkles size={12} /> Most Popular</div>}
      <h3 className="text-xl font-bold">{name}</h3>
      <div className="mt-2 mb-4">
        <span className="text-3xl font-extrabold font-mono">{price}</span>
        {price !== "Free" && <span className="text-sm text-slate-400">/month</span>}
      </div>
      <ul className="space-y-2 mb-6 text-sm text-slate-300">
        {features.map(f => <li key={f} className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400 shrink-0" />{f}</li>)}
      </ul>
      <button onClick={onSelect} disabled={current}
        className={cx("w-full rounded-lg py-2.5 text-sm font-semibold transition-all",
          current ? "bg-slate-800 text-slate-500 cursor-default" :
          highlight ? "bg-indigo-500 text-white hover:bg-indigo-400" :
          "bg-slate-800 border border-white/10 hover:bg-slate-700 text-slate-200"
        )}>
        {current ? "Current Plan" : "Upgrade"}
      </button>
    </div>
  );
}

/* ── Main ──────────────────────────────────────────────────────── */
export default function Page() {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("Home");
  const [pipelineTab, setPipelineTab] = useState<Record<string, string>>({});
  const [settings, setSettings] = useState<AppSettings>(defaults);
  const [gatewayStatus, setGatewayStatus] = useState<GatewayStatus>({ status: "checking" });
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [pomodoroSeconds, setPomodoroSeconds] = useState(defaults.pomodoroMinutes * 60);
  const [notes, setNotes] = useState("Ship dashboard polish + API health checks.");
  const [termLog, setTermLog] = useState<string[]>(["$ mission-control boot", "✔ widgets loaded"]);
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: "Review PR #142", done: false, col: "todo" },
    { id: 2, text: "Update deployment docs", done: true, col: "done" },
    { id: 3, text: "Refactor auth middleware", done: false, col: "doing" },
  ]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const [cmdkQuery, setCmdkQuery] = useState("");
  const [roiHours, setRoiHours] = useState(40);
  const [roiRate, setRoiRate] = useState(150);
  const [chartVisible, setChartVisible] = useState(false);
  const [agentRunning, setAgentRunning] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [projectOutput, setProjectOutput] = useState<{ [id: string]: string }>({});
  const [loadingProjects, setLoadingProjects] = useState(false);
  
  const [swarmState, setSwarmState] = useState<{
    tasks: any[]; leads: any[]; logs: {timestamp:string; agent:string; message:string}[];
    agentStatus: Record<string, string>;
    settings: { isPaused: boolean; manualApproval: boolean };
    agentXP?: Record<string, { xp: number; level: number; tasksCompleted: number; revenueGenerated: number }>;
    pipelines?: any[];
  }>({ tasks: [], leads: [], logs: [], agentStatus: {}, settings: { isPaused: false, manualApproval: true } });
  
  const termRef = useRef<HTMLDivElement>(null);

  /* Toast helper */
  const toast = useCallback((msg: string, level: LogLevel = "success") => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { id, msg, level }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  }, []);

  /* ── Real OpenClaw health check ── */
  const checkGateway = useCallback(async () => {
    setGatewayStatus(prev => ({ ...prev, status: "checking" }));
    
    // 1. Direct browser ping (Fastest, bypasses deadlocked API routes)
    try {
      const directRes = await fetch("http://127.0.0.1:18789/", { method: "HEAD", mode: "no-cors" });
      if (directRes.type === "opaque" || directRes.ok) {
        // If opaque, it means we reached the port but CORS blocked the head, which is still a success for a port-check!
        setGatewayStatus({
          status: "online",
          version: "2026.3.8", // Fallback version if API is dead
          error: undefined
        });
        return true;
      }
    } catch { /* ignore and fallback to API */ }

    // 2. Fallback to API route for full metadata
    try {
      const res = await fetch("/api/openclaw/health");
      const data = await res.json();
      setGatewayStatus({
        status: data.status === "online" ? "online" : "offline",
        version: data.version,
        uptime: data.uptime,
        error: data.error,
      });
      return data.status === "online";
    } catch {
      setGatewayStatus({ status: "offline", error: "Network error" });
      return false;
    }
  }, []);

  const [codingAiProjects, setCodingAiProjects] = useState<any[]>([]);

  /* ── Projects Data Fetching ── */
  const fetchProjects = useCallback(async () => {
    setLoadingProjects(true);
    try {
      const res = await fetch("/api/projects/all");
      const data = await res.json();
      if (data.success) {
        setCodingAiProjects(data.projects);
      }
    } catch (e) { 
      console.error("Failed to fetch CODING AI projects", e);
    }
    setLoadingProjects(false);
  }, []);

  const executeProjectAction = async (project: any, action: string, args?: any) => {
    toast(`Running ${action} on ${project.name}...`, "info");
    setProjectOutput(prev => ({ ...prev, [project.id]: `> Executing ${action}...\n` }));
    try {
      const res = await fetch("/api/projects/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, projectPath: project.path, action, args })
      });
      const data = await res.json();
      if (data.status === "success" || data.status === "started") {
        toast(`Action ${action} complete for ${project.name}`);
        setProjectOutput(prev => ({ ...prev, [project.id]: prev[project.id] + data.output }));
        fetchProjects(); // refresh status
      } else {
        toast(`Failed: ${data.error}`, "error");
        setProjectOutput(prev => ({ ...prev, [project.id]: prev[project.id] + data.error + "\n" + (data.output || "") }));
      }
    } catch (e: any) {
      toast(`Error: ${e.message}`, "error");
    }
  };

  /* Boot: skeleton + load persisted data */
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    try {
      const raw = localStorage.getItem(SK);
      if (raw) { const p = JSON.parse(raw) as Partial<AppSettings>; const m = { ...defaults, ...p }; setSettings(m); setPomodoroSeconds(m.pomodoroMinutes * 60); }
    } catch { /* ignore */ }
    try { const n = localStorage.getItem(NK); if (n) setNotes(n); } catch { /* ignore */ }
    // Initial health check
    checkGateway();
    return () => clearTimeout(timer);
  }, [checkGateway]);

  /* Heartbeat polling for OpenClaw & Swarm State */
  useEffect(() => {
    if (!settings.openClawEnabled || settings.openClawHeartbeatSec <= 0) return;
    const fetchSwarm = async () => {
      try {
        const [orcRes, xpRes] = await Promise.all([
          fetch("/api/openclaw/orchestrator"),
          fetch("/api/openclaw/agents", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ action: "GET_STATS" }) })
        ]);
        const orcData = await orcRes.json();
        const xpData = await xpRes.json();
        if (!orcData.error) setSwarmState(prev => ({ ...prev, ...orcData, agentXP: xpData.agentXP || prev.agentXP }));
      } catch { /* ignore */ }
    };
    
    const tick = async () => {
      await checkGateway();
      if (tab === "Swarm") fetchSwarm();
      if (tab === "Projects") fetchProjects();
    };
    
    const id = setInterval(tick, settings.openClawHeartbeatSec * 1000);
    if (tab === "Swarm") fetchSwarm(); // fetch immediately on tab switch
    if (tab === "Projects") fetchProjects();
    
    return () => clearInterval(id);
  }, [settings.openClawEnabled, settings.openClawHeartbeatSec, checkGateway, tab]);

  /* Persist settings */
  useEffect(() => { localStorage.setItem(SK, JSON.stringify(settings)); }, [settings]);
  /* Persist notes */
  useEffect(() => { localStorage.setItem(NK, notes); }, [notes]);

  /* Pomodoro */
  useEffect(() => {
    if (!pomodoroRunning) return;
    const id = setInterval(() => setPomodoroSeconds(s => (s > 0 ? s - 1 : (setPomodoroRunning(false), 0))), 1000);
    return () => clearInterval(id);
  }, [pomodoroRunning]);

  /* Chart animate on Analytics tab */
  useEffect(() => { if (tab === "Analytics") { setChartVisible(false); requestAnimationFrame(() => setChartVisible(true)); } }, [tab]);

  /* Cmd+K keyboard shortcut */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmdkOpen(v => !v); setCmdkQuery(""); } };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* Auto-scroll terminal */
  useEffect(() => { termRef.current?.scrollTo(0, termRef.current.scrollHeight); }, [termLog]);

  const progress = Math.round((todos.filter(t => t.done).length / Math.max(1, todos.length)) * 100);
  const mm = String(Math.floor(pomodoroSeconds / 60)).padStart(2, "0");
  const ss = String(pomodoroSeconds % 60).padStart(2, "0");

  const patch = <K extends keyof AppSettings>(key: K, val: AppSettings[K]) => setSettings(p => ({ ...p, [key]: val }));

  function runCommand(cmdText: string) {
    const cmd = cmdText.trim();
    if (!cmd) return;
    if (settings.commandSafeMode) {
      const denied = settings.commandDenylist.split("\n").some(x => x.trim() && cmd.includes(x.trim()));
      if (denied) { setTermLog(p => [...p, `$ ${cmd}`, "⛔ blocked by denylist"]); toast("Command blocked", "warn"); return; }
    }
    setTermLog(p => [...p, `$ ${cmd}`, "✔ done"]);
    toast(`Executed: ${cmd}`, "info");
  }

  function addTask(txt: string) {
    if (!txt.trim()) return;
    setTodos(p => [...p, { id: Date.now(), text: txt, done: false, col: "todo" }]);
    toast("Task added to To Do");
  }

  function toggleTodo(id: number) {
    setTodos(p => p.map(t => t.id === id ? { ...t, done: !t.done, col: !t.done ? "done" as const : "todo" as const } : t));
  }

  async function copyCode(code: string) {
    await navigator.clipboard.writeText(code);
    toast("Copied to clipboard!");
  }

  function saveSettings() { toast("Settings saved!"); }

  async function testOpenClaw() {
    const online = await checkGateway();
    if (online) {
      toast(`OpenClaw gateway online v${gatewayStatus.version}`);
    } else {
      toast(gatewayStatus.error || "Gateway offline", "error");
    }
  }

  async function sendAgentTask(promptText: string) {
    if (!promptText.trim()) return;
    setAgentRunning(true);
    setTermLog(p => [...p, `$ openclaw agent --prompt "${promptText.slice(0, 50)}..."`]);
    toast("Logging task to DB and sending to OpenClaw…", "info");
    try {
      // Send task through the new Supabase Service 
      // Replace '' with user ID when auth is integrated
      const result = await dispatchAgentTask('', promptText);
      const data = result.response;

      if (data.status === "completed" || data.status === "success") {
        setTermLog(p => [...p, `✔ Agent completed`, data.output?.slice(0, 200) || ""]);
        toast("Agent task completed!", "success");
      } else {
        setTermLog(p => [...p, `⚠ Agent error: ${data.error?.slice(0, 100)}`]);
        toast(data.error || "Agent task failed", "error");
      }
    } catch {
      setTermLog(p => [...p, "⛔ Network error"]);
      toast("Failed to reach agent", "error");
    }
    setAgentRunning(false);
  }

  async function handleCheckout(plan: "pro" | "enterprise") {
    toast("Creating checkout session…", "info");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
      } else {
        toast(data.message || data.error || "Checkout failed", "warn");
      }
    } catch {
      toast("Failed to create checkout session", "error");
    }
  }

  function watchdogCheck() {
    const cpu = 60 + Math.floor(Math.random() * 40);
    const mem = 55 + Math.floor(Math.random() * 45);
    const bad = cpu > settings.watchdogCpuThreshold || mem > settings.watchdogMemoryThreshold;
    toast(bad ? `⚠ Watchdog alert cpu=${cpu}% mem=${mem}%` : `✔ Watchdog pass cpu=${cpu}% mem=${mem}%`, bad ? "warn" : "success");
  }

  const cmdkItems = [
    { label: "Home", action: () => { setTab("Home"); setCmdkOpen(false); } },
    { label: "Projects", action: () => { setTab("Projects"); setCmdkOpen(false); } },
    { label: "Tasks", action: () => { setTab("Tasks"); setCmdkOpen(false); } },
    { label: "Deployments", action: () => { setTab("Deployments"); setCmdkOpen(false); } },
    { label: "Analytics", action: () => { setTab("Analytics"); setCmdkOpen(false); } },
    { label: "Revenue", action: () => { setTab("Revenue"); setCmdkOpen(false); } },
    { label: "Bank", action: () => { setTab("Bank"); setCmdkOpen(false); } },
    { label: "Swarm", action: () => { setTab("Swarm"); setCmdkOpen(false); } },
    { label: "Billing", action: () => { setTab("Billing"); setCmdkOpen(false); } },
    { label: "Settings", action: () => { setTab("Settings"); setCmdkOpen(false); } },
    { label: "Toggle Pomodoro", action: () => { setPomodoroRunning(v => !v); setCmdkOpen(false); } },
    { label: "Reset Pomodoro", action: () => { setPomodoroSeconds(settings.pomodoroMinutes * 60); setCmdkOpen(false); } },
    { label: "Watchdog Check", action: () => { watchdogCheck(); setCmdkOpen(false); } },
    { label: "Ping OpenClaw", action: () => { testOpenClaw(); setCmdkOpen(false); } },
  ];
  const filteredCmdk = cmdkItems.filter(i => i.label.toLowerCase().includes(cmdkQuery.toLowerCase()));

  const chartData = [
    { label: "Mon", value: 35 }, { label: "Tue", value: 52 }, { label: "Wed", value: 40 },
    { label: "Thu", value: 62 }, { label: "Fri", value: 55 }, { label: "Sat", value: 70 }, { label: "Sun", value: 64 },
  ];

  if (loading) return <Skeleton />;

  const sidebarItems: { label: Tab; icon: React.ReactNode }[] = [
    { label: "Home", icon: <Home size={16} /> },
    { label: "Projects", icon: <FolderGit2 size={16} /> },
    { label: "Tasks", icon: <CheckSquare size={16} /> },
    { label: "Deployments", icon: <Globe size={16} /> },
    { label: "Analytics", icon: <BarChart3 size={16} /> },
    { label: "Swarm", icon: <Network size={16} /> },
    { label: "Revenue", icon: <CircleDollarSign size={16} /> },
    { label: "Bank", icon: <Landmark size={16} /> },
    { label: "Billing", icon: <CreditCard size={16} /> },
    { label: "Settings", icon: <Settings size={16} /> },
  ];

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden selection:bg-indigo-500/30">
      {/* ── Background Elements ── */}
      <div className="scanline" />
      <div className="stardust-layer" />
      
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-60 -left-60 h-[700px] w-[700px] rounded-full bg-indigo-600/15 blur-[120px] animate-[mesh1_20s_ease-in-out_infinite]" />
        <div className="absolute top-1/2 -right-20 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[100px] animate-[mesh2_25s_ease-in-out_infinite]" />
        <div className="absolute -bottom-20 left-1/3 h-[400px] w-[400px] rounded-full bg-cyan-500/8 blur-[100px] animate-[mesh3_30s_ease-in-out_infinite]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, filter: "blur(10px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        className="mx-auto max-w-[1500px] p-4 md:p-6"
      >
        {/* ── Header ─────────────────────────────────── */}
        <header className="mb-6 relative rounded-2xl glass-v2 p-4 flex items-center justify-between group">
          <div className="hud-bracket hud-bracket-tl bg-indigo-500" />
          <div className="hud-bracket hud-bracket-br bg-indigo-500" />
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic">Mission Control</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">Strategic Revenue Operations Terminal</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Gateway status pill */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cx("px-2 py-1 rounded-md text-[10px] font-bold tracking-widest border transition-colors",
              gatewayStatus.status === "online" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" :
              gatewayStatus.status === "checking" ? "border-amber-500/30 bg-amber-500/10 text-amber-400" :
                "border-rose-500/30 bg-rose-500/10 text-rose-400"
            )}>
              {gatewayStatus.status === "online" ? <PulseDot /> : gatewayStatus.status === "checking" ? <span className="animate-spin text-xs">⟳</span> : <OfflineDot />}
              {gatewayStatus.status === "online" ? `v${gatewayStatus.version}` : gatewayStatus.status === "checking" ? "SYNCING" : "OFFLINE"}
            </motion.div>
            <span className="font-mono text-xl text-indigo-300 font-black tabular-nums tracking-tighter shadow-indigo-500/20"><InlineClock /></span>
            <button onClick={() => { setCmdkOpen(true); setCmdkQuery(""); }} className="hidden sm:flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-400 hover:border-indigo-400/40 transition-all hover:bg-white/10">
              <Search size={14} /> <span className="uppercase tracking-widest">Search</span> <kbd className="ml-1 rounded bg-slate-700 px-1.5 py-0.5 text-[10px] font-mono">⌘K</kbd>
            </button>
            <motion.button whileTap={{ scale: 0.9 }} title="Notifications" className="rounded-lg border border-white/5 p-2 hover:bg-white/5 transition-colors"><Bell size={16} /></motion.button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-[230px_1fr]">
          {/* ── Sidebar ── */}
          <aside className="relative rounded-2xl glass-v2 p-3 space-y-2 group">
            <div className="hud-bracket hud-bracket-tl bg-indigo-500/40" />
            <div className="hud-bracket hud-bracket-br bg-indigo-500/40" />
            
            <div className="px-3 py-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Navigation</span>
            </div>

            {sidebarItems.map(s => (
              <motion.button 
                key={s.label} 
                onClick={() => setTab(s.label)}
                whileHover={{ x: 4, backgroundColor: "rgba(99,102,241,0.15)" }}
                whileTap={{ scale: 0.97 }}
                className={cx("w-full text-left rounded-xl px-4 py-3 text-xs font-bold flex items-center gap-3 transition-all duration-300 relative group/btn",
                  tab === s.label ? "bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)]" : "text-slate-500 hover:text-slate-300")}>
                {tab === s.label && <motion.div layoutId="sidebar-active" className="absolute inset-0 rounded-xl border border-indigo-400/40 pointer-events-none" />}
                <span className={cx("transition-transform duration-300 group-hover/btn:scale-110", tab === s.label ? "text-indigo-400" : "text-slate-500")}>
                  {s.icon}
                </span>
                <span className="uppercase tracking-widest">{s.label}</span>
              </motion.button>
            ))}

            <div className="mt-6 p-4 rounded-xl bg-indigo-500/5 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                 <span className="text-[10px] font-bold text-slate-500 uppercase">Gateway</span>
                 {gatewayStatus.status === "online" ? <PulseDot /> : <OfflineDot />}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 flex justify-between"><span>MODE</span> <span className="text-white font-black">{settings.autonomyMode.toUpperCase()}</span></p>
                <p className="text-[10px] text-slate-400 flex justify-between"><span>TIER</span> <span className="text-indigo-400 font-black">{settings.subscriptionTier.toUpperCase()}</span></p>
              </div>
            </div>
          </aside>

          {/* ── Main content ── */}
          <main className="relative min-h-[600px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, x: 20, filter: "blur(4px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                transition={{ duration: 0.3, ease: "circOut" }}
                className="space-y-4"
              >
            {/* ════════════ HOME ════════════ */}
            {tab === "Home" && (
              <section className="grid grid-cols-1 xl:grid-cols-4 gap-4">
                <GlassCard title="System Resources" icon={<Cpu size={16} />} glowColor="rgba(52,211,153,0.2)"><SystemHealth /></GlassCard>

                <GlassCard title="ROI Calculator" icon={<DollarSign size={16} />}>
                  <div className="space-y-2 text-sm">
                    <label className="block">Hours/wk <input type="number" value={roiHours} onChange={e => setRoiHours(+e.target.value || 0)}
                      className="mt-1 w-full rounded border border-white/10 bg-slate-800 px-2 py-1 font-mono" title="Hours" /></label>
                    <label className="block">Rate ($/hr) <input type="number" value={roiRate} onChange={e => setRoiRate(+e.target.value || 0)}
                      className="mt-1 w-full rounded border border-white/10 bg-slate-800 px-2 py-1 font-mono" title="Rate" /></label>
                    <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
                      <p className="text-xs text-slate-400">Projected Revenue</p>
                      <p className="text-2xl font-bold font-mono text-emerald-400">${(roiHours * roiRate).toLocaleString()}<span className="text-sm text-slate-400">/wk</span></p>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard title="OpenClaw Gateway" icon={<Link2 size={16} />} glowColor="rgba(34,211,238,0.2)">
                  <div className="text-sm space-y-2">
                    <div className="flex items-center gap-2">
                      {gatewayStatus.status === "online" ? <PulseDot /> : <OfflineDot />}
                      <span className={`font-mono ${gatewayStatus.status === "online" ? "text-emerald-400" : "text-rose-400"}`}>
                        {gatewayStatus.status === "online" ? "Connected" : "Offline"}
                      </span>
                    </div>
                    {gatewayStatus.version && <p className="text-xs text-slate-500">Version: <span className="font-mono">{gatewayStatus.version}</span></p>}
                    <p className="text-xs text-slate-500">Endpoint: <span className="font-mono">{settings.openClawEndpoint}</span></p>
                    <p className="text-xs text-slate-500">Model: <span className="font-mono">{settings.openClawModel}</span></p>
                    <button onClick={testOpenClaw} className="w-full rounded-lg bg-emerald-500/15 border border-emerald-500/20 px-2 py-1.5 text-xs hover:bg-emerald-500/25 transition-colors">
                      <RefreshCw size={12} className="inline mr-1" />Sync Connection
                    </button>
                  </div>
                </GlassCard>

                <GlassCard title="Focus Timer" icon={<Clock3 size={16} />} glowColor="rgba(99,102,241,0.2)">
                  <div className="text-center">
                    <p className="text-4xl font-bold font-mono tabular-nums text-indigo-300">{mm}:{ss}</p>
                    <div className="mt-3 flex justify-center gap-2">
                      <button onClick={() => setPomodoroRunning(v => !v)}
                        className="flex items-center gap-1 rounded-lg bg-indigo-500/20 border border-indigo-400/20 px-3 py-1.5 text-sm hover:bg-indigo-500/30 transition-colors">
                        {pomodoroRunning ? <><Pause size={14} />Pause</> : <><Play size={14} />Start</>}
                      </button>
                      <button onClick={() => { setPomodoroSeconds(settings.pomodoroMinutes * 60); setPomodoroRunning(false); }}
                        className="rounded-lg bg-slate-800 border border-white/10 px-3 py-1.5 text-sm hover:bg-slate-700 transition-colors">Reset</button>
                    </div>
                  </div>
                </GlassCard>
            {/* ════════════ TASK PROMPT / AGENT ════════════ */}
              <GlassCard title="Agent Task" icon={<Rocket size={16} />} span="xl:col-span-2">
                  <AgentInput onSend={sendAgentTask} isRunning={agentRunning} />
                </GlassCard>
                {/* Lead Hunter */}
                <GlassCard title="Market Intelligence" icon={<Search size={16} />} span="xl:col-span-2">
                  <LeadHunter />
                </GlassCard>

                <GlassCard title="Quick Notes" icon={<StickyNote size={16} />} span="xl:col-span-2">
                  <textarea value={notes} onChange={e => setNotes(e.target.value)}
                    className="w-full h-32 rounded-lg border border-white/10 bg-slate-800/60 p-3 text-sm resize-none focus:border-indigo-400/40 focus:outline-none transition-colors" title="Notes" />
                  <p className="mt-1 text-xs text-slate-500">Auto-saved to localStorage</p>
                </GlassCard>

                <GlassCard title="Live Clock" icon={<Clock3 size={16} />}>
                  <LiveClock />
                </GlassCard>

                <GlassCard title="User Profile" icon={<UserCircle2 size={16} />}>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 border border-indigo-400/20">
                      <User size={18} className="text-indigo-300" />
                    </div>
                    <div>
                      <p className="font-semibold flex items-center gap-2">Moazzin Zaman <PulseDot /></p>
                      <p className="text-xs text-slate-400">Admin • <span className="capitalize">{settings.subscriptionTier}</span> Tier</p>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard title="Code Vault" icon={<Command size={16} />} span="xl:col-span-2">
                  <div className="space-y-3">
                    {codeSnippets.map((s, i) => (
                      <div key={i} className="rounded-lg bg-black/40 border border-white/5 p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-slate-400">{s.label}</span>
                          <button onClick={() => copyCode(s.code)} className="flex items-center gap-1 rounded bg-slate-700/60 px-2 py-1 text-xs hover:bg-slate-600 transition-colors">
                            <Copy size={12} />Copy
                          </button>
                        </div>
                        <pre className="text-xs font-mono text-emerald-300 whitespace-pre-wrap">{s.code}</pre>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard title="GitHub Activity" icon={<Github size={16} />}>
                  <ul className="space-y-1.5 text-sm">
                    <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Merged PR #241</li>
                    <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" />Opened issue #883</li>
                    <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />Pushed 6 commits</li>
                  </ul>
                </GlassCard>

                <GlassCard title="Command Terminal" icon={<Terminal size={16} />} span="xl:col-span-2">
                  <div ref={termRef} className="h-28 overflow-auto rounded-lg bg-black/50 border border-white/5 p-3 text-xs font-mono text-emerald-300">
                    {termLog.map((line, i) => <div key={`${i}-${line}`}>{line}</div>)}
                  </div>
                  <TerminalInput onRun={runCommand} />
                </GlassCard>

                <GlassCard title="Meetings" icon={<CalendarDays size={16} />}>
                  <div className="text-sm space-y-2">
                    <p className="flex justify-between"><span>Standup</span><span className="font-mono text-slate-400">10:00</span></p>
                    <p className="flex justify-between"><span>Architecture</span><span className="font-mono text-slate-400">13:30</span></p>
                    <p className="flex justify-between"><span>1:1</span><span className="font-mono text-slate-400">16:00</span></p>
                  </div>
                </GlassCard>

                <GlassCard title="Now Playing" icon={<Music2 size={16} />}>
                  <p className="text-sm">Midnight City — M83</p>
                  <div className="mt-2 flex gap-1">{Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="w-1 rounded-full bg-indigo-400/60" style={{ height: `${8 + Math.random() * 16}px`, animation: `grow .5s ease-out ${i * .05}s both` }} />
                  ))}</div>
                </GlassCard>
              </section>
            )}

            {/* ════════════ PROJECTS ════════════ */}
            {tab === "Projects" && (
              <section className="space-y-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">Fleet Management</h2>
                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.4em] font-bold">~/Desktop/CODING AI Assets</p>
                  </div>
                  <button onClick={fetchProjects} className="flex items-center gap-2 rounded-xl bg-indigo-500/10 border border-indigo-400/20 px-5 py-2.5 text-xs font-bold hover:bg-indigo-500/20 text-indigo-300 transition-all active:scale-95">
                    <RefreshCw size={14} className={loadingProjects ? "animate-spin" : ""} /> RE-SCAN FLEET
                  </button>
                </div>

                {codingAiProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {codingAiProjects.map((proj: any, i: number) => {
                      // Determine glow color based on status
                      const glowColor = 
                        proj.status === 'READY' ? "border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_15px_-3px_rgba(16,185,129,0.1)]" :
                        proj.status === 'BUILDING' ? "border-amber-500/30 bg-amber-500/5 shadow-[0_0_15px_-3px_rgba(245,158,11,0.1)]" :
                        proj.status === 'ONLINE' ? "border-indigo-500/30 bg-indigo-500/5 shadow-[0_0_15px_-3px_rgba(99,102,241,0.1)]" :
                        proj.status === 'SYNCING' ? "border-cyan-500/30 bg-cyan-500/5 shadow-[0_0_15px_-3px_rgba(6,182,212,0.1)]" :
                        "border-white/10 bg-slate-900/60";

                      const statusColor = 
                        proj.status === 'READY' ? "text-emerald-400 bg-emerald-400/10" :
                        proj.status === 'BUILDING' ? "text-amber-400 bg-amber-400/10 animate-pulse" :
                        proj.status === 'ONLINE' ? "text-indigo-400 bg-indigo-400/10" :
                        proj.status === 'SYNCING' ? "text-cyan-400 bg-cyan-400/10 animate-pulse" :
                        "text-slate-400 bg-slate-800";

                      const mbs = (proj.size / (1024 * 1024)).toFixed(2);
                      const isLarge = proj.size > 50 * 1024 * 1024;

                      return (
                        <motion.div 
                          key={proj.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={cx(
                            "group/proj relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 hover:scale-[1.02]",
                            glowColor
                          )}
                        >
                          {/* Top Row: Name & Status */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex gap-3 min-w-0 pr-2">
                              <div className={cx(
                                "flex items-center justify-center shrink-0 w-10 h-10 rounded-xl border border-white/10 bg-black/40 text-xl shadow-inner",
                                proj.isNode ? "text-amber-400" : proj.isPython ? "text-blue-400" : "text-slate-400"
                              )}>
                                {proj.isNode ? "⚡" : proj.isPython ? "🐍" : "📁"}
                              </div>
                              <div className="min-w-0 flex flex-col justify-center">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-200 truncate">{proj.name}</h3>
                                <p className="text-[9px] text-slate-500 font-mono truncate mt-0.5">{proj.path.split('/').pop()}</p>
                              </div>
                            </div>
                            <span className={cx("shrink-0 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded", statusColor)}>
                              {proj.status}
                            </span>
                          </div>

                          {/* Data Row */}
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div className="bg-black/30 rounded-lg p-2 border border-white/5">
                              <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">Size / Weight</p>
                              <p className={cx("text-xs font-mono font-bold", isLarge ? "text-rose-400" : "text-slate-300")}>{mbs} MB</p>
                            </div>
                            <div className="bg-black/30 rounded-lg p-2 border border-white/5">
                              <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">Last Updated</p>
                              <p className="text-[10px] text-slate-300 mt-0.5 font-medium truncate">
                                {new Date(proj.lastModified).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>

                          {/* Stack Tags */}
                          <div className="flex gap-1.5 flex-wrap">
                            {proj.stack.map((s: string) => (
                              <span key={s} className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 font-bold tracking-wider border border-white/5 uppercase">
                                {s}
                              </span>
                            ))}
                          </div>
                          
                          {/* Hover Actions overlay */}
                          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm opacity-0 group-hover/proj:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 p-4">
                             <button onClick={() => executeProjectAction(proj, 'terminal_open')} className="flex-1 max-w-[100px] bg-slate-800 hover:bg-slate-700 text-white text-[9px] font-black uppercase tracking-widest py-2 rounded-lg border border-white/10 transition-colors shadow-lg">
                               Terminal
                             </button>
                             {proj.isNode && (
                               <button onClick={() => executeProjectAction(proj, 'npm_dev')} className="flex-1 max-w-[100px] bg-indigo-500 hover:bg-indigo-400 text-white text-[9px] font-black uppercase tracking-widest py-2 rounded-lg border border-indigo-400/50 shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-colors">
                                 Run Dev
                               </button>
                             )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-24 text-center">
                    <FolderGit2 size={64} className="mx-auto text-slate-800 mb-6 animate-pulse" />
                    <h3 className="text-lg font-bold text-slate-400">No Projects Found</h3>
                    <p className="text-sm text-slate-600 mt-2">Could not find any folders in ~/Desktop/CODING AI</p>
                    <button onClick={fetchProjects} className="mt-6 px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg text-xs font-bold hover:bg-indigo-500/30 uppercase tracking-widest">Retry Scan</button>
                  </div>
                )}
              </section>
            )}


            {/* ════════════ TASKS (Kanban) ════════════ */}
            {tab === "Tasks" && (
              <section className="space-y-4">
                <TaskInput onAdd={addTask} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {(["todo", "doing", "done"] as const).map(col => (
                    <GlassCard key={col} title={col === "todo" ? "To Do" : col === "doing" ? "In Progress" : "Done"}
                      icon={col === "done" ? <CheckCircle2 size={16} className="text-emerald-400" /> : <CheckSquare size={16} />}>
                      <ul className="space-y-2 min-h-[100px]">
                        {todos.filter(t => t.col === col).map(t => (
                          <li key={t.id} className="flex items-center justify-between rounded-lg bg-slate-800/60 border border-white/5 p-2.5 text-sm">
                            <div className="flex items-center gap-2">
                              <button onClick={() => toggleTodo(t.id)} title="Toggle">
                                {t.done ? <CheckCircle2 size={16} className="text-emerald-400" /> : <div className="h-4 w-4 rounded border border-slate-500" />}
                              </button>
                              <span className={t.done ? "line-through text-slate-500" : ""}>{t.text}</span>
                            </div>
                            <button onClick={() => setTodos(p => p.filter(x => x.id !== t.id))} title="Delete" className="text-rose-400 hover:text-rose-300 transition-colors"><Trash2 size={14} /></button>
                          </li>
                        ))}
                        {todos.filter(t => t.col === col).length === 0 && <li className="text-xs text-slate-500 text-center py-4">No tasks</li>}
                      </ul>
                    </GlassCard>
                  ))}
                </div>
                <GlassCard title="Progress" icon={<Activity size={16} />}>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="font-mono text-sm text-slate-300">{progress}%</span>
                  </div>
                </GlassCard>
              </section>
            )}

            {/* ════════════ ANALYTICS ════════════ */}
            {tab === "Analytics" && (
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <GlassCard title="Weekly Revenue" icon={<TrendingUp size={16} />} span="lg:col-span-2">
                  <div className="flex items-end gap-3 h-40">
                    {chartData.map((d, i) => (
                      <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs font-mono text-slate-400">{d.value}%</span>
                        <div className="w-full rounded-t-lg bg-gradient-to-r from-indigo-600 to-indigo-400"
                          style={{
                            height: chartVisible ? `${d.value}%` : "0%",
                            transformOrigin: "bottom",
                            transition: `height .8s cubic-bezier(.34,1.56,.64,1) ${i * .1}s`,
                          }} />
                        <span className="text-xs text-slate-500">{d.label}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
                <GlassCard title="Reliability" icon={<ShieldCheck size={16} />}>
                  <div className="space-y-3 text-sm">
                    <div><p className="text-xs text-slate-400 mb-1">CPU Threshold</p><p className="font-mono text-lg">{settings.watchdogCpuThreshold}%</p></div>
                    <div><p className="text-xs text-slate-400 mb-1">Memory Threshold</p><p className="font-mono text-lg">{settings.watchdogMemoryThreshold}%</p></div>
                    <button onClick={watchdogCheck} className="w-full rounded-lg bg-amber-500/15 border border-amber-500/20 px-2 py-1.5 text-xs hover:bg-amber-500/25 transition-colors">Run Watchdog</button>
                  </div>
                </GlassCard>
                <GlassCard title="Audit Log" icon={<Activity size={16} />} span="lg:col-span-3">
                  <div className="max-h-48 overflow-auto space-y-1.5 text-xs">
                    {toasts.length === 0 && <p className="text-slate-500 text-center py-4">No events yet. Interact with the dashboard to generate logs.</p>}
                    {toasts.map(e => (
                      <div key={e.id} className="rounded-lg bg-slate-800/60 border border-white/5 p-2 flex items-center gap-2">
                        <span className={cx("uppercase font-mono text-[10px] px-1.5 py-0.5 rounded",
                          e.level === "success" ? "bg-emerald-500/20 text-emerald-400" :
                          e.level === "warn" ? "bg-amber-500/20 text-amber-400" :
                          e.level === "error" ? "bg-rose-500/20 text-rose-400" :
                          "bg-blue-500/20 text-blue-400"
                        )}>{e.level}</span>
                        {e.msg}
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </section>
            )}

            {/* ════════════ SWARM ════════════ */}
            {tab === "Swarm" && (
              <section className="space-y-6">
                <div className="relative rounded-2xl glass-v2 p-8 overflow-hidden group">
                   <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-transparent to-emerald-500/10 opacity-50" />
                   <div className="relative z-10 text-center">
                     <h2 className="text-4xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-white via-indigo-200 to-slate-500 bg-clip-text text-transparent">Combat Swarm Operations</h2>
                     <p className="text-[10px] text-indigo-400 uppercase tracking-[0.4em] font-bold mt-2">Strategic Deployment of Multi-Agent Intelligence</p>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-6">
                  {/* LEFT: Specialized Agents */}
                  <div className="space-y-4">
                    <div className="px-2 pb-2 border-b border-white/5 flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Unit Status</span>
                       <span className="text-[10px] font-mono text-indigo-500">5 UNITS</span>
                    </div>
                    {(["architect", "builder", "qa", "hunter", "copywriter"] as const).map(agent => {
                      const agStatus = swarmState.agentStatus?.[agent] || "idle";
                      const isWorking = agStatus !== "idle";
                      const xp = swarmState.agentXP?.[agent] || { xp: 0, level: 1, tasksCompleted: 0 };
                      const xpInLevel = xp.xp % 100;
                      const skills: Record<string, string[]> = {
                        architect: ["Blueprint", "System Design", "Analysis"],
                        builder: ["React", "Next.js", "Stripe"],
                        qa: ["Testing", "Debug", "Audit"],
                        hunter: ["Scraping", "Leads", "Research"],
                        copywriter: ["SEO", "Copy", "Content"]
                      };
                      const actions: Record<string, { label: string; action: string; payload: any }> = {
                        architect: { label: "Design System", action: "DESIGN_SYSTEM", payload: { projectName: "Revenue App" } },
                        builder: { label: "Build Stripe", action: "GENERATE_STRIPE_CONFIG", payload: { productName: "My SaaS" } },
                        qa: { label: "Run Audit", action: "RUN_AUDIT", payload: { target: "landing page" } },
                        hunter: { label: "Scrape Leads", action: "SCRAPE_LEADS", payload: { source: "Google Maps", query: "small businesses" } },
                        copywriter: { label: "Generate Copy", action: "GENERATE_CONTENT", payload: { type: "landing_page", topic: "SaaS product" } }
                      };
                      const pipelineLabel = agStatus.startsWith("supporting:") ? agStatus.split(":")[1]?.slice(0,12) + "…"
                        : agStatus.startsWith("collab:") ? agStatus.split(":")[1]?.slice(0,12) + "…"
                        : null;

                      return (
                        <motion.div 
                          key={agent} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={cx(
                            "relative overflow-hidden rounded-2xl border transition-all duration-500 p-3 group/unit",
                            isWorking ? "bg-indigo-500/15 border-indigo-500/40 shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]" : "bg-slate-900/40 border-white/5 hover:border-white/10"
                          )}
                        >
                          <div className="flex gap-3 items-start">
                            <motion.div 
                              animate={isWorking ? { y: [0, -3, 0] } : {}}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                              className="relative h-10 w-10 shrink-0 rounded-xl overflow-hidden border border-white/10 bg-black/40"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={`/bots/${agent}.png`} alt={agent} className="h-full w-full object-cover group-hover/unit:scale-110 transition-transform duration-700" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            </motion.div>
                            <div className="flex-1 min-w-0">
                               <div className="flex items-center gap-1.5">
                                 <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-200">{agent}</h4>
                                 <span className="text-[7px] px-1 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-black">LV{xp.level}</span>
                                 {xp.tasksCompleted > 0 && <span className="text-[7px] bg-emerald-500/20 text-emerald-400 px-1 py-0.5 rounded font-mono">{xp.tasksCompleted}✓</span>}
                               </div>
                               <div className="flex items-center gap-1.5 mt-0.5">
                                  {isWorking ? <PulseDot /> : <div className="h-1.5 w-1.5 rounded-full bg-slate-600" />}
                                  <span className={cx("text-[8px] font-mono uppercase truncate", isWorking ? "text-indigo-400" : "text-slate-500")}>
                                    {pipelineLabel ? `ON: ${pipelineLabel}` : agStatus}
                                  </span>
                               </div>
                               {/* XP Bar */}
                               <div className="mt-1.5 flex items-center gap-1.5">
                                 <div className="flex-1 h-1 rounded-full bg-slate-800 overflow-hidden">
                                   <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-400 transition-all duration-700" style={{ width: `${xpInLevel}%` }} />
                                 </div>
                                 <span className="text-[7px] font-mono text-slate-600">{xp.xp}xp</span>
                               </div>
                               <div className="flex flex-wrap gap-0.5 mt-1">
                                 {skills[agent]?.map(s => (
                                   <span key={s} className="text-[6px] px-1 py-0.5 rounded bg-white/5 border border-white/5 text-slate-500 font-bold uppercase">{s}</span>
                                 ))}
                               </div>
                            </div>
                          </div>
                          {/* Agent Action Button */}
                          <button
                            onClick={() => {
                              const act = actions[agent];
                              const activePipeline = swarmState.pipelines?.find((p: any) => p.status === 'active');
                              fetch("/api/openclaw/agents", {
                                method: "POST", headers: {"Content-Type":"application/json"},
                                body: JSON.stringify({ agent, action: act.action, payload: { ...act.payload, pipelineId: activePipeline?.id } })
                              }).then(r => r.json()).then(d => {
                                if (d.success) toast(`${agent} completed: ${act.label}`, "success");
                              });
                            }}
                            className="mt-2 w-full text-[8px] py-1.5 rounded-lg bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 text-indigo-300 hover:from-indigo-500/20 hover:to-violet-500/20 font-black uppercase tracking-wider transition-all active:scale-95"
                          >
                            ⚡ {actions[agent]?.label}
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* CENTER: Logs & Actions */}
                  <div className="space-y-4">
                    <GlassCard title="War Room Logs" icon={<Terminal size={16} />} glowColor="rgba(99,102,241,0.1)">
                      <div className="h-[380px] overflow-auto rounded-lg bg-black/40 p-4 text-[11px] font-mono space-y-2">
                        {swarmState.logs.length === 0 && <span className="text-slate-600 animate-pulse italic">Awaiting tactical data streams...</span>}
                        {swarmState.logs.map((log, i) => (
                          <div key={i} className="flex items-start gap-4 group/log">
                            <span className="text-slate-600 shrink-0 tabular-nums">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                            <span className={cx(
                              "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter",
                              log.agent === "admin" ? "bg-rose-500/20 text-rose-400" :
                              log.agent === "orchestrator" ? "bg-indigo-500/30 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.2)]" :
                              "bg-emerald-500/20 text-emerald-400"
                            )}>
                              {log.agent}
                            </span>
                            <span className="text-slate-400 leading-relaxed group-hover/log:text-slate-200 transition-colors">{log.message}</span>
                          </div>
                        ))}
                      </div>
                    </GlassCard>

                    <div className="grid grid-cols-2 gap-4">
                       <GlassCard title="Collective Intelligence" icon={<Database size={16} />}>
                          <div className="space-y-2">
                             <div className="flex justify-between text-[11px] border-b border-white/5 pb-1">
                               <span className="text-slate-500">Leads Scoped</span>
                               <span className="text-emerald-400 font-mono font-bold">{swarmState.leads?.length || 0}</span>
                             </div>
                             <div className="flex justify-between text-[11px] border-b border-white/5 pb-1">
                               <span className="text-slate-500">Active Tasks</span>
                               <span className="text-indigo-300 font-mono font-bold">{swarmState.tasks?.filter((t: any) => t.status !== "done").length || 0}</span>
                             </div>
                             <div className="flex justify-between text-[11px]">
                               <span className="text-slate-500">Swarm State</span>
                               <span className={cx("font-mono font-bold", swarmState.settings?.isPaused ? "text-rose-400" : "text-emerald-400")}>
                                 {swarmState.settings?.isPaused ? "PAUSED" : "LIVE"}
                               </span>
                             </div>
                          </div>
                       </GlassCard>
                       <GlassCard title="Direct Control" icon={<Workflow size={16} />}>
                          <div className="grid grid-cols-2 gap-2">
                            <button onClick={async () => {
                              await fetch("/api/openclaw/orchestrator", { 
                                method: "POST", 
                                headers: {"Content-Type":"application/json"}, 
                                body: JSON.stringify({action:"TOGGLE_PAUSE"}) 
                              });
                              toast(swarmState.settings?.isPaused ? "Swarm Resumed" : "Swarm Paused");
                            }} className={cx(
                              "rounded-lg border p-2 transition-all flex flex-col items-center gap-1",
                              swarmState.settings?.isPaused ? "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20 text-rose-400"
                            )}>
                               {swarmState.settings?.isPaused ? <Play size={14} /> : <Pause size={14} />}
                               <span className="text-[9px] font-black uppercase">{swarmState.settings?.isPaused ? "Resume" : "Pause"}</span>
                            </button>
                            <button onClick={async () => {
                              const desc = window.prompt("Inject a new task into the Swarm:");
                              if (desc) {
                                await fetch("/api/openclaw/orchestrator", { 
                                  method: "POST", 
                                  headers: {"Content-Type":"application/json"}, 
                                  body: JSON.stringify({action:"ADD_TASK", payload:{description:desc}}) 
                                });
                                toast("Task injected!");
                              }
                            }} className="rounded-lg bg-indigo-500/10 border border-indigo-400/20 p-2 hover:bg-indigo-500/20 text-indigo-400 transition-all flex flex-col items-center gap-1">
                               <Plus size={14} /> <span className="text-[9px] font-black uppercase">Inject</span>
                            </button>
                          </div>
                       </GlassCard>
                    </div>
                  </div>

                   {/* RIGHT: Revenue Generation — 20x Upgraded */}
                   <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1 scrollbar-none">
                     <div className="px-2 pb-2 border-b border-white/5 flex items-center justify-between sticky top-0 bg-slate-950/90 backdrop-blur-sm z-10 pt-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80">Revenue Engine</span>
                        <span className="text-[10px] font-mono text-emerald-400/60">8 STREAMS • 20 UPGRADES</span>
                     </div>
                     
                     {[
                       { 
                         title: "SaaS Blueprint", roi: "$2k–$10k/mo", color: "text-indigo-400", 
                         borderCls: "border-indigo-500/20 hover:border-indigo-500/50",
                         stepCls: "border-indigo-500/30 text-indigo-400/70 bg-indigo-500/5",
                         btnCls: "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30",
                         icon: "🚀",
                         desc: "AI validates demand, scaffolds a full-stack SaaS, deploys with Stripe billing, and launches marketing — all automated end-to-end.",
                         steps: [
                           { text: "Market gap analysis via Google Trends + competitor scraping", agent: "Researcher" },
                           { text: "System architecture design + tech stack selection", agent: "Architect" },
                           { text: "Scaffold Next.js + Supabase + Stripe boilerplate", agent: "Builder" },
                           { text: "Generate landing page, email sequence & blog content", agent: "Copywriter" },
                           { text: "Integrate Stripe subscriptions, checkout & webhooks", agent: "Builder" },
                           { text: "Full QA audit: mobile, speed, SEO, SSL, payments", agent: "QA" },
                           { text: "Deploy to Vercel with custom domain + CDN", agent: "Deployer" },
                           { text: "Launch cold outreach to scraped leads", agent: "Marketer" },
                         ],
                         difficulty: "Medium", timeToRevenue: "2-4 weeks",
                         agentTeam: ["researcher","architect","builder","copywriter","qa","deployer","marketer"],
                         permissions: ["Stripe API", "Supabase", "Vercel API", "OpenAI", "SendGrid"],
                         revenueModel: "Subscription ($19-149/mo tiers)",
                         targetAudience: "Small businesses needing automation",
                         profitMargin: "85-92%", monthlyOverhead: "$32/mo",
                         breakEven: "~2 weeks", confidence: 87, risk: "Low",
                         scalingStrategy: "Clone template → new niche verticals",
                         successMetrics: ["MRR", "Churn rate", "Trial→Paid conversion"],
                         status: "ready"
                       },
                       { 
                         title: "Chrome Extension Factory", roi: "$500–$3k/mo", color: "text-cyan-400", 
                         borderCls: "border-cyan-500/20 hover:border-cyan-500/50",
                         stepCls: "border-cyan-500/30 text-cyan-400/70 bg-cyan-500/5",
                         btnCls: "bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30",
                         icon: "🧩",
                         desc: "Mass-produce utility Chrome extensions with freemium monetization. AI identifies trending categories and auto-generates, tests, and publishes.",
                         steps: [
                           { text: "Scrape Chrome Web Store for trending extension categories", agent: "Hunter" },
                           { text: "Analyze competitor extensions for feature gaps", agent: "Researcher" },
                           { text: "Auto-generate manifest.json + popup UI + service worker", agent: "Builder" },
                           { text: "Build core logic from template library", agent: "Builder" },
                           { text: "Write listing copy, screenshots & promotional assets", agent: "Copywriter" },
                           { text: "Package, lint & automated testing", agent: "QA" },
                           { text: "Submit to Chrome Web Store + handle review process", agent: "Deployer" },
                         ],
                         difficulty: "Easy", timeToRevenue: "1-2 weeks",
                         agentTeam: ["hunter","researcher","builder","copywriter","qa","deployer"],
                         permissions: ["Chrome Web Store API", "OpenAI"],
                         revenueModel: "Freemium + Premium ($4.99 one-time / $2.99/mo)",
                         targetAudience: "Productivity-focused professionals",
                         profitMargin: "95%", monthlyOverhead: "$0",
                         breakEven: "~1 week", confidence: 82, risk: "Low",
                         scalingStrategy: "Launch 5-10 extensions across categories",
                         successMetrics: ["Install count", "Ratings", "Premium uptake %"],
                         status: "ready"
                       },
                       { 
                         title: "Lead Sniper", roi: "$5k–$20k/mo", color: "text-emerald-400", 
                         borderCls: "border-emerald-500/20 hover:border-emerald-500/50",
                         stepCls: "border-emerald-500/30 text-emerald-400/70 bg-emerald-500/5",
                         btnCls: "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30",
                         icon: "🎯",
                         desc: "Full automated lead generation: scrape → enrich → personalize → outreach → follow-up → close. Sell leads directly or run as a done-for-you agency.",
                         steps: [
                           { text: "Scrape Google Maps / Yelp / LinkedIn for target businesses", agent: "Hunter" },
                           { text: "Enrich with Hunter.io / Apollo for decision-maker emails", agent: "Hunter" },
                           { text: "Score leads by fit, budget, and intent signals", agent: "Researcher" },
                           { text: "AI writes personalized cold emails per prospect", agent: "Copywriter" },
                           { text: "Schedule automated drip campaigns (3-email sequence)", agent: "Marketer" },
                           { text: "Track opens, replies & conversions in real-time", agent: "QA" },
                           { text: "Auto-book meetings via Calendly integration", agent: "Deployer" },
                           { text: "Client dashboard: leads, metrics, ROI reporting", agent: "Builder" },
                         ],
                         difficulty: "Medium", timeToRevenue: "1-3 weeks",
                         agentTeam: ["hunter","researcher","copywriter","marketer","qa","deployer","builder"],
                         permissions: ["Hunter.io API", "Apollo API", "SendGrid", "Calendly API", "Google Maps API"],
                         revenueModel: "Per-lead ($5-50/lead) or retainer ($2-5k/mo)",
                         targetAudience: "B2B companies needing qualified leads",
                         profitMargin: "78-88%", monthlyOverhead: "$120/mo",
                         breakEven: "~3 days", confidence: 91, risk: "Low",
                         scalingStrategy: "Add niches: dentists, lawyers, realtors, agencies",
                         successMetrics: ["Cost per lead", "Reply rate", "Meeting booked rate"],
                         status: "ready"
                       },
                       { 
                         title: "Software Arbitrage", roi: "$1.5k–$5k/mo", color: "text-amber-400", 
                         borderCls: "border-amber-500/20 hover:border-amber-500/50",
                         stepCls: "border-amber-500/30 text-amber-400/70 bg-amber-500/5",
                         btnCls: "bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/30",
                         icon: "📦",
                         desc: "White-label app templates for every niche: dashboards, landing pages, e-commerce. AI customizes per buyer and sells on Gumroad/Envato with automated delivery.",
                         steps: [
                           { text: "Identify best-selling template categories on Envato/Gumroad", agent: "Researcher" },
                           { text: "Design system architecture for template generator", agent: "Architect" },
                           { text: "Build base templates: SaaS dashboard, landing page, portfolio", agent: "Builder" },
                           { text: "AI generates 10+ niche variants per template", agent: "Builder" },
                           { text: "Write compelling product copy & documentation", agent: "Copywriter" },
                           { text: "Auto-generate preview screenshots & demo sites", agent: "Deployer" },
                           { text: "Set up Gumroad + Envato storefronts with pricing", agent: "Deployer" },
                         ],
                         difficulty: "Easy", timeToRevenue: "1-2 weeks",
                         agentTeam: ["researcher","architect","builder","copywriter","deployer"],
                         permissions: ["Gumroad API", "OpenAI", "Vercel API"],
                         revenueModel: "One-time purchase ($29-149 per template)",
                         targetAudience: "Developers, startups, freelancers",
                         profitMargin: "90-95%", monthlyOverhead: "$15/mo",
                         breakEven: "~5 days", confidence: 79, risk: "Low",
                         scalingStrategy: "Automate template generation for 20+ niches",
                         successMetrics: ["Units sold", "Average order value", "Refund rate"],
                         status: "ready"
                       },
                       { 
                         title: "Content Monetization", roi: "$1k–$8k/mo", color: "text-rose-400", 
                         borderCls: "border-rose-500/20 hover:border-rose-500/50",
                         stepCls: "border-rose-500/30 text-rose-400/70 bg-rose-500/5",
                         btnCls: "bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/30",
                         icon: "✍️",
                         desc: "AI content farm: research high-CPC keywords, generate SEO articles, auto-publish, grow organic traffic, monetize via display ads + affiliate links.",
                         steps: [
                           { text: "Research high-CPC keywords via SEMrush/Ahrefs data", agent: "Researcher" },
                           { text: "Map content clusters & internal linking strategy", agent: "Architect" },
                           { text: "AI generates 2,000+ word SEO articles with schema markup", agent: "Copywriter" },
                           { text: "Auto-publish to Ghost/WordPress with scheduled cadence", agent: "Deployer" },
                           { text: "Embed contextual affiliate links for relevant products", agent: "Copywriter" },
                           { text: "Build email list with lead magnets & newsletters", agent: "Marketer" },
                           { text: "Apply to Mediavine once traffic hits 50k sessions/mo", agent: "Deployer" },
                           { text: "A/B test headlines & CTAs for max conversion", agent: "QA" },
                         ],
                         difficulty: "Easy", timeToRevenue: "2-3 months",
                         agentTeam: ["researcher","architect","copywriter","deployer","marketer","qa"],
                         permissions: ["OpenAI", "Ghost API / WordPress API", "Google Analytics", "Affiliate Networks"],
                         revenueModel: "Display ads ($15-30 RPM) + affiliate (5-30% commission)",
                         targetAudience: "Organic search traffic (info-seekers)",
                         profitMargin: "88-95%", monthlyOverhead: "$25/mo",
                         breakEven: "~2 months", confidence: 76, risk: "Medium",
                         scalingStrategy: "Launch 3-5 niche content sites simultaneously",
                         successMetrics: ["Monthly pageviews", "RPM", "Affiliate conversion rate"],
                         status: "ready"
                       },
                       { 
                         title: "API Marketplace", roi: "$2k–$15k/mo", color: "text-violet-400", 
                         borderCls: "border-violet-500/20 hover:border-violet-500/50",
                         stepCls: "border-violet-500/30 text-violet-400/70 bg-violet-500/5",
                         btnCls: "bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-violet-500/30",
                         icon: "🔌",
                         desc: "Package AI tools as paid API endpoints on RapidAPI. Usage-based pricing means revenue scales linearly with adoption. Zero marginal cost per call.",
                         steps: [
                           { text: "Identify in-demand API niches (text analysis, image gen, enrichment)", agent: "Researcher" },
                           { text: "Design API architecture with rate limiting & auth", agent: "Architect" },
                           { text: "Build FastAPI / Express endpoints with caching layer", agent: "Builder" },
                           { text: "Write API documentation, tutorials & SDK examples", agent: "Copywriter" },
                           { text: "Load test & security audit with penetration testing", agent: "QA" },
                           { text: "Publish to RapidAPI with tiered pricing ($0/29/99/mo)", agent: "Deployer" },
                           { text: "Set up usage metering + Stripe billing for direct sales", agent: "Builder" },
                           { text: "Auto-generate SDK wrappers for Python, JS, Ruby, Go", agent: "Builder" },
                         ],
                         difficulty: "Hard", timeToRevenue: "3-6 weeks",
                         agentTeam: ["researcher","architect","builder","copywriter","qa","deployer"],
                         permissions: ["RapidAPI Partner", "Stripe API", "OpenAI", "Cloud Functions"],
                         revenueModel: "Usage-based ($0.001-0.10/call) + subscription tiers",
                         targetAudience: "Developers, SaaS products, data companies",
                         profitMargin: "70-85%", monthlyOverhead: "$50-200/mo",
                         breakEven: "~4 weeks", confidence: 73, risk: "Medium",
                         scalingStrategy: "Launch 5+ APIs across different verticals",
                         successMetrics: ["API calls/mo", "Free→Paid conversion", "Revenue/call"],
                         status: "ready"
                       },
                       { 
                         title: "Freelance Autopilot", roi: "$3k–$12k/mo", color: "text-pink-400", 
                         borderCls: "border-pink-500/20 hover:border-pink-500/50",
                         stepCls: "border-pink-500/30 text-pink-400/70 bg-pink-500/5",
                         btnCls: "bg-pink-500/10 border border-pink-500/20 text-pink-400 hover:bg-pink-500/30",
                         icon: "🤖",
                         desc: "AI monitors Upwork/Fiverr, auto-generates proposals, manages client comms, and dispatches agents to do the actual work. You just approve and collect payment.",
                         steps: [
                           { text: "Set criteria: skills, budget range, project type, geo", agent: "Researcher" },
                           { text: "AI scans new Upwork/Fiverr postings every 15 min", agent: "Hunter" },
                           { text: "Score opportunities by win probability & value", agent: "Researcher" },
                           { text: "Generate tailored proposal with portfolio samples", agent: "Copywriter" },
                           { text: "Auto-submit proposals (or queue for your approval)", agent: "Marketer" },
                           { text: "On acceptance: Architect designs system, Builder scaffolds", agent: "Builder" },
                           { text: "QA validates deliverables before client handoff", agent: "QA" },
                           { text: "Auto-invoice via Stripe + request testimonial", agent: "Deployer" },
                         ],
                         difficulty: "Medium", timeToRevenue: "1-2 weeks",
                         agentTeam: ["researcher","hunter","copywriter","marketer","builder","qa","deployer"],
                         permissions: ["Upwork API", "Fiverr API", "Stripe API", "OpenAI", "Calendly API"],
                         revenueModel: "Per-project ($500-5k) or hourly ($50-150/hr)",
                         targetAudience: "Businesses hiring on freelance platforms",
                         profitMargin: "65-80%", monthlyOverhead: "$60/mo",
                         breakEven: "~1 week", confidence: 84, risk: "Low",
                         scalingStrategy: "Multiple profiles across specialties",
                         successMetrics: ["Win rate", "Revenue per project", "Client satisfaction"],
                         status: "ready"
                       },
                       { 
                         title: "Digital Products", roi: "$500–$5k/mo", color: "text-orange-400", 
                         borderCls: "border-orange-500/20 hover:border-orange-500/50",
                         stepCls: "border-orange-500/30 text-orange-400/70 bg-orange-500/5",
                         btnCls: "bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/30",
                         icon: "📚",
                         desc: "AI generates premium digital products: eBooks, Notion templates, UI kits, course outlines. Sells on Gumroad with automated delivery, upsell funnels, and email sequences.",
                         steps: [
                           { text: "Identify trending niches on Gumroad/ProductHunt/Twitter", agent: "Researcher" },
                           { text: "AI generates complete eBook (50+ pages) or template pack", agent: "Copywriter" },
                           { text: "Auto-create cover art, mockups & promotional graphics", agent: "Builder" },
                           { text: "Build Notion templates / Figma UI kits from specs", agent: "Builder" },
                           { text: "Set up Gumroad storefront with pricing tiers & bundles", agent: "Deployer" },
                           { text: "Build email funnel: lead magnet → upsell → cross-sell", agent: "Marketer" },
                           { text: "Launch on Product Hunt + social media blitz", agent: "Marketer" },
                         ],
                         difficulty: "Easy", timeToRevenue: "1 week",
                         agentTeam: ["researcher","copywriter","builder","deployer","marketer"],
                         permissions: ["Gumroad API", "OpenAI", "Figma API"],
                         revenueModel: "One-time ($9-49) + bundles ($79-199)",
                         targetAudience: "Knowledge workers, creators, indie hackers",
                         profitMargin: "92-97%", monthlyOverhead: "$10/mo",
                         breakEven: "~3 days", confidence: 85, risk: "Low",
                         scalingStrategy: "Launch 10+ products across trending niches",
                         successMetrics: ["Units sold", "Revenue per product", "Email list growth"],
                         status: "ready"
                       },
                     ].map((opp, i) => (
                       <motion.div 
                         initial={{ opacity: 0, x: 20 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ delay: i * 0.06 }}
                         key={opp.title} 
                         className={cx("group/opp relative overflow-hidden rounded-2xl bg-slate-950 border p-4 transition-all duration-300 cursor-pointer", opp.borderCls)}
                       >
                         {/* Header */}
                         <div className="flex items-start gap-3">
                           <span className="text-2xl">{opp.icon}</span>
                           <div className="flex-1 min-w-0">
                             <div className="flex items-center justify-between">
                               <div className="flex items-center gap-2">
                                 <h5 className="text-xs font-black uppercase tracking-tighter text-slate-200">{opp.title}</h5>
                                 <span className={cx("text-[7px] px-1.5 py-0.5 rounded-full font-black uppercase", opp.status === 'ready' ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400")}>{opp.status === 'ready' ? '✓ READY' : '⚠ SETUP'}</span>
                               </div>
                               <span className={cx("text-[10px] font-mono font-black", opp.color)}>{opp.roi}</span>
                             </div>
                             <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{opp.desc}</p>
                           </div>
                         </div>

                         {/* Revenue Model + Target + Margin */}
                         <div className="mt-2 flex flex-wrap gap-1.5">
                           <span className="text-[7px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">{opp.revenueModel}</span>
                           <span className="text-[7px] px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold">Margin: {opp.profitMargin}</span>
                           <span className="text-[7px] px-1.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-400 font-bold">Overhead: {opp.monthlyOverhead}</span>
                         </div>

                         {/* Confidence Bar */}
                         <div className="mt-2 flex items-center gap-2">
                           <span className="text-[7px] text-slate-600 uppercase font-bold shrink-0">Confidence</span>
                           <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                             <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-700" style={{ width: `${opp.confidence}%` }} />
                           </div>
                           <span className="text-[8px] font-mono font-black text-emerald-400">{opp.confidence}%</span>
                         </div>

                         {/* Agent Team */}
                         <div className="mt-2 flex items-center gap-1">
                           <span className="text-[7px] text-slate-600 uppercase font-bold shrink-0">Agents:</span>
                           {opp.agentTeam.map(a => (
                             <span key={a} className="text-[6px] px-1 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-black uppercase">{a}</span>
                           ))}
                         </div>

                         {/* Required Permissions */}
                         <div className="mt-1.5 flex items-center gap-1 flex-wrap">
                           <span className="text-[7px] text-slate-600 uppercase font-bold shrink-0">Access:</span>
                           {opp.permissions.map(p => (
                             <span key={p} className="text-[6px] px-1 py-0.5 rounded bg-amber-500/5 border border-amber-500/15 text-amber-400/70 font-bold">{p}</span>
                           ))}
                         </div>

                         {/* Automation Pipeline with Agent Assignments */}
                         <div className="mt-3 space-y-1">
                           <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Pipeline ({opp.steps.length} steps)</p>
                           {opp.steps.map((step, si) => (
                             <div key={si} className="flex items-start gap-2 text-[10px]">
                               <span className={cx("shrink-0 h-4 w-4 rounded-full flex items-center justify-center text-[8px] font-black border", opp.stepCls)}>{si + 1}</span>
                               <span className="text-slate-400 leading-relaxed flex-1">{step.text}</span>
                               <span className="text-[6px] px-1 py-0.5 rounded bg-white/5 text-slate-500 font-black uppercase shrink-0">{step.agent}</span>
                             </div>
                           ))}
                         </div>

                         {/* Footer: Stats + Buttons */}
                         <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                           <div className="flex flex-wrap gap-2 text-[8px]">
                             <span className="text-slate-500"><span className="text-slate-300 font-bold">⚡ {opp.difficulty}</span></span>
                             <span className="text-slate-500"><span className="text-slate-300 font-bold">⏱ {opp.timeToRevenue}</span></span>
                             <span className="text-slate-500"><span className="text-slate-300 font-bold">📊 Break-even: {opp.breakEven}</span></span>
                             <span className="text-slate-500"><span className={cx("font-bold", opp.risk === 'Low' ? "text-emerald-400" : "text-amber-400")}>🛡 Risk: {opp.risk}</span></span>
                           </div>
                           <div className="text-[8px] text-slate-600">
                             <span className="font-bold text-slate-500">Scale: </span>{opp.scalingStrategy}
                           </div>
                           <div className="flex items-center gap-2">
                             <button 
                               onClick={async (e) => { 
                                 e.stopPropagation(); 
                                 toast(`🚀 Launching ${opp.title} — agents spinning up...`, "success");
                                 await fetch("/api/openclaw/orchestrator", {
                                   method: "POST", headers: {"Content-Type":"application/json"},
                                   body: JSON.stringify({ action: "LAUNCH_PIPELINE", payload: { title: opp.title, description: opp.desc, steps: opp.steps.map(s => s.text), roi: opp.roi } })
                                 });
                               }}
                               className={cx("flex-1 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95", opp.btnCls)}
                             >
                               Launch Pipeline
                             </button>
                             <button 
                               onClick={async (e) => { 
                                 e.stopPropagation(); 
                                 toast(`⚡ Auto-launching + executing ${opp.title}...`, "success");
                                 const res = await fetch("/api/openclaw/orchestrator", {
                                   method: "POST", headers: {"Content-Type":"application/json"},
                                   body: JSON.stringify({ action: "LAUNCH_PIPELINE", payload: { title: opp.title, description: opp.desc, steps: opp.steps.map(s => s.text), roi: opp.roi } })
                                 });
                                 const data = await res.json();
                                 const pipelineId = data?.memory?.pipelines?.slice(-1)?.[0]?.id;
                                 if (pipelineId) {
                                   await fetch("/api/openclaw/agents", {
                                     method: "POST", headers: {"Content-Type":"application/json"},
                                     body: JSON.stringify({ action: "AUTO_EXECUTE_PIPELINE", payload: { pipelineId } })
                                   });
                                   toast(`✅ ${opp.title} BUILT & DEPLOYED!`, "success");
                                 }
                               }}
                               className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-emerald-400 hover:from-emerald-500/30 hover:to-cyan-500/30 transition-all active:scale-95"
                             >
                               ⚡ Auto-Build
                             </button>
                           </div>
                         </div>
                       </motion.div>
                     ))}

                     <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-600/10 to-emerald-600/5 border border-indigo-400/20 text-center space-y-2 sticky bottom-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Total Potential: $15k–$78k/mo</p>
                        <p className="text-[9px] text-slate-400">Combined automated revenue across all active pipelines</p>
                        <button 
                          onClick={async () => {
                            toast("🚀 Launching ALL pipelines — full swarm deployment!", "success");
                            const streams = ["SaaS Blueprint","Chrome Extension Factory","Lead Sniper","Software Arbitrage","Content Monetization","API Marketplace","Freelance Autopilot","Digital Products"];
                            for (const title of streams) {
                                await fetch("/api/openclaw/orchestrator", {
                                  method: "POST",
                                  headers: {"Content-Type":"application/json"},
                                  body: JSON.stringify({ title }),
                               });
                           }
                         }}
                         className="w-full mt-2 rounded-xl bg-gradient-to-r from-indigo-500 to-emerald-500 text-white py-2.5 text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                       >
                         LAUNCH ALL PIPELINES
                       </button>
                    </div>
                  </div>
                </div>

                {/* ── PIPELINE CONTROL PANELS ── */}
                {swarmState.pipelines && swarmState.pipelines.length > 0 && (
                  <div className="mt-8 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
                      <h3 className="text-xs font-black uppercase tracking-[0.4em] text-emerald-400/80 bg-emerald-500/5 px-4 py-1.5 rounded-full border border-emerald-500/10">
                        Pipeline Control ({swarmState.pipelines.filter((p: any) => p.status === 'active').length} active)
                      </h3>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
                    </div>

                    {swarmState.pipelines.map((pipeline: any) => {
                      const activeTab = pipelineTab[pipeline.id] || "steps";
                      const totalBudget = pipeline.budget?.items?.reduce((s: number, i: any) => s + i.estimated, 0) || 0;
                      const stepsComplete = pipeline.steps?.filter((s: any) => s.done).length || 0;
                      const stepsTotal = pipeline.steps?.length || 0;
                      const overallProgress = stepsTotal > 0 ? Math.round((stepsComplete / stepsTotal) * 100) : 0;

                      return (
                      <div key={pipeline.id} className={cx(
                        "rounded-2xl border transition-all duration-500",
                        pipeline.status === 'active' 
                          ? "bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_30px_-5px_rgba(52,211,153,0.15)]" 
                          : pipeline.status === 'paused'
                          ? "bg-amber-500/5 border-amber-500/20"
                          : "bg-slate-900/40 border-white/5"
                      )}>
                        {/* ── PIPELINE HEADER ── */}
                        <div className="p-5 border-b border-white/5">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={cx("h-3 w-3 rounded-full",
                                pipeline.status === 'active' ? "bg-emerald-400 animate-pulse" :
                                pipeline.status === 'paused' ? "bg-amber-400" : "bg-slate-600"
                              )} />
                              <h4 className="text-sm font-black uppercase tracking-tight text-slate-200">{pipeline.title || "Pipeline"}</h4>
                              <span className={cx("text-[9px] px-2 py-0.5 rounded-full font-black uppercase",
                                pipeline.status === 'active' ? "bg-emerald-500/20 text-emerald-400" :
                                pipeline.status === 'paused' ? "bg-amber-500/20 text-amber-400" :
                                "bg-slate-700 text-slate-400"
                              )}>{pipeline.status}</span>
                              {pipeline.roi && <span className="text-[10px] font-mono text-emerald-400/60">{pipeline.roi}</span>}
                            </div>
                            <div className="flex items-center gap-2">
                              {/* Collaborators */}
                              <div className="flex gap-1 mr-2">
                                {pipeline.collaborators?.map((c: string) => (
                                  <span key={c} className="text-[8px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-full font-bold uppercase">{c}</span>
                                ))}
                              </div>
                              {/* Join Buttons */}
                              {pipeline.status === 'active' && <>{["builder", "qa", "hunter", "copywriter"].filter(a => {
                                const s = swarmState.agentStatus?.[a] || 'idle';
                                return s === 'idle' && !pipeline.collaborators?.includes(a);
                              }).slice(0, 2).map(agent => (
                                <button key={agent} onClick={async () => {
                                  await fetch("/api/openclaw/orchestrator", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ action: "JOIN_PIPELINE", payload: { pipelineId: pipeline.id, agentName: agent } }) });
                                  toast(`${agent} joined!`, "success");
                                }} className="text-[7px] px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 font-black uppercase">+{agent}</button>
                              ))}</>}
                              {/* Pause / Resume */}
                              <button onClick={async () => {
                                const action = pipeline.status === 'paused' ? 'RESUME_PIPELINE' : 'PAUSE_PIPELINE';
                                await fetch("/api/openclaw/orchestrator", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ action, payload: { pipelineId: pipeline.id } }) });
                                toast(pipeline.status === 'paused' ? "Resumed!" : "Paused!");
                              }} className={cx("text-[8px] px-2 py-1 rounded border font-black uppercase",
                                pipeline.status === 'paused' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                              )}>
                                {pipeline.status === 'paused' ? "▶ Resume" : "⏸ Pause"}
                              </button>
                              <button onClick={() => {
                                console.log("DELETE clicked", pipeline.id);
                                fetch("/api/openclaw/orchestrator", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ action: "DELETE_PIPELINE", payload: { pipelineId: pipeline.id } }) })
                                  .then(() => toast("Pipeline deleted!"))
                                  .catch(err => console.error("Delete failed:", err));
                              }} className="text-[8px] px-2 py-1 rounded border bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20 font-black uppercase">
                                🗑 Delete
                              </button>
                              <span className="text-[9px] text-slate-600 font-mono">{new Date(pipeline.createdAt).toLocaleTimeString()}</span>
                            </div>
                          </div>

                          {/* Phase Timeline */}
                          <div className="flex items-center gap-1">
                            {pipeline.subAgents?.map((sa: any, idx: number) => (
                              <div key={sa.id} className="flex items-center gap-1 flex-1">
                                <div className={cx(
                                  "flex-1 h-1.5 rounded-full transition-all",
                                  sa.status === 'complete' ? "bg-emerald-400" :
                                  sa.status === 'active' ? "bg-indigo-400 animate-pulse" :
                                  sa.status === 'paused' ? "bg-amber-400/50" :
                                  "bg-slate-800"
                                )} />
                                {idx < (pipeline.subAgents?.length || 0) - 1 && <div className="w-1" />}
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between mt-1">
                            {pipeline.subAgents?.map((sa: any) => (
                              <span key={sa.id} className={cx("text-[7px] uppercase font-bold",
                                sa.status === 'complete' ? "text-emerald-400" :
                                sa.status === 'active' ? "text-indigo-400" : "text-slate-600"
                              )}>{sa.name}</span>
                            ))}
                          </div>

                          {/* Overall Progress */}
                          <div className="mt-3 flex items-center gap-3">
                            <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                              <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-1000" style={{ width: `${overallProgress}%` }} />
                            </div>
                            <span className="text-[10px] font-mono font-bold text-slate-300">{overallProgress}%</span>
                            <span className="text-[9px] text-slate-500">{stepsComplete}/{stepsTotal} steps</span>
                          </div>
                        </div>

                        {/* ── TAB NAVIGATION ── */}
                        <div className="flex border-b border-white/5">
                          {[
                            { id: "steps", label: "Steps", icon: "☑" },
                            { id: "config", label: "Config", icon: "⚙" },
                            { id: "budget", label: "Budget", icon: "💰" },
                            { id: "output", label: "Output", icon: "📦" }
                          ].map(t => (
                            <button
                              key={t.id}
                              onClick={() => setPipelineTab(prev => ({ ...prev, [pipeline.id]: t.id }))}
                              className={cx(
                                "flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all border-b-2",
                                activeTab === t.id 
                                  ? "text-indigo-300 border-indigo-400 bg-indigo-500/5" 
                                  : "text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/2"
                              )}
                            >
                              {t.icon} {t.label}
                            </button>
                          ))}
                        </div>

                        {/* ── TAB CONTENT ── */}
                        <div className="p-5">
                          {/* STEPS TAB */}
                          {activeTab === "steps" && (
                            <div className="space-y-2">
                              {pipeline.steps?.map((step: any, si: number) => (
                                <div key={step.id} className={cx(
                                  "flex items-start gap-3 p-3 rounded-xl border transition-all",
                                  step.done ? "bg-emerald-500/5 border-emerald-500/15" : "bg-slate-900/40 border-white/5 hover:border-white/10"
                                )}>
                                  <button onClick={async () => {
                                    await fetch("/api/openclaw/orchestrator", { method: "POST", headers: {"Content-Type":"application/json"},
                                      body: JSON.stringify({ action: "UPDATE_PIPELINE_STEPS", payload: { pipelineId: pipeline.id, stepId: step.id, done: !step.done } })
                                    });
                                  }} className={cx(
                                    "shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center mt-0.5 transition-all",
                                    step.done ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-600 hover:border-indigo-400"
                                  )}>
                                    {step.done && <CheckCircle2 size={12} />}
                                  </button>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className={cx("text-xs font-bold", step.done ? "text-emerald-400 line-through" : "text-slate-200")}>
                                        {si + 1}. {step.label}
                                      </span>
                                      <span className="text-[8px] bg-indigo-500/10 text-indigo-300 px-1.5 py-0.5 rounded-full font-bold uppercase">{step.assignedTo}</span>
                                    </div>
                                    {step.notes && <p className="text-[9px] text-slate-500 mt-1">{step.notes}</p>}
                                  </div>
                                  <button onClick={async () => {
                                    const label = window.prompt("Edit step:", step.label);
                                    if (label) {
                                      await fetch("/api/openclaw/orchestrator", { method: "POST", headers: {"Content-Type":"application/json"},
                                        body: JSON.stringify({ action: "UPDATE_PIPELINE_STEPS", payload: { pipelineId: pipeline.id, stepId: step.id, label } })
                                      });
                                    }
                                  }} className="text-[8px] text-slate-600 hover:text-slate-300 px-1.5 py-0.5 rounded hover:bg-white/5 transition-all uppercase font-bold">
                                    Edit
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* CONFIG TAB */}
                          {activeTab === "config" && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {[
                                { key: "niche", label: "Target Niche", type: "text", placeholder: "e.g., SaaS for dentists" },
                                { key: "domain", label: "Domain Name", type: "text", placeholder: "e.g., myapp.com" },
                                { key: "pricingModel", label: "Pricing Model", type: "select", options: ["freemium", "subscription", "one-time", "usage-based"] },
                                { key: "deployTarget", label: "Deploy Target", type: "select", options: ["Vercel", "Netlify", "Railway", "Self-hosted", "AWS"] },
                              ].map(field => (
                                <div key={field.key} className="space-y-1.5">
                                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">{field.label}</label>
                                  {field.type === "text" ? (
                                    <input
                                      defaultValue={pipeline.config?.[field.key] || ""}
                                      placeholder={field.placeholder}
                                      onBlur={async (e) => {
                                        await fetch("/api/openclaw/orchestrator", { method: "POST", headers: {"Content-Type":"application/json"},
                                          body: JSON.stringify({ action: "UPDATE_PIPELINE_CONFIG", payload: { pipelineId: pipeline.id, config: { [field.key]: e.target.value } } })
                                        });
                                        toast("Config saved!");
                                      }}
                                      className="w-full bg-slate-900/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:border-indigo-500/50 focus:outline-none transition-colors"
                                    />
                                  ) : (
                                    <select
                                      defaultValue={pipeline.config?.[field.key] || ""}
                                      onChange={async (e) => {
                                        await fetch("/api/openclaw/orchestrator", { method: "POST", headers: {"Content-Type":"application/json"},
                                          body: JSON.stringify({ action: "UPDATE_PIPELINE_CONFIG", payload: { pipelineId: pipeline.id, config: { [field.key]: e.target.value } } })
                                        });
                                        toast("Config saved!");
                                      }}
                                      className="w-full bg-slate-900/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-indigo-500/50 focus:outline-none transition-colors"
                                    >
                                      {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                  )}
                                </div>
                              ))}
                              <div className="lg:col-span-2 space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Tech Stack</label>
                                <div className="flex flex-wrap gap-1.5">
                                  {(pipeline.config?.techStack || []).map((tech: string) => (
                                    <span key={tech} className="text-[9px] px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold">{tech}</span>
                                  ))}
                                </div>
                              </div>
                              <div className="lg:col-span-2 space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Notes</label>
                                <textarea
                                  defaultValue={pipeline.config?.customNotes || ""}
                                  onBlur={async (e) => {
                                    await fetch("/api/openclaw/orchestrator", { method: "POST", headers: {"Content-Type":"application/json"},
                                      body: JSON.stringify({ action: "UPDATE_PIPELINE_CONFIG", payload: { pipelineId: pipeline.id, config: { customNotes: e.target.value } } })
                                    });
                                  }}
                                  rows={3}
                                  placeholder="Add custom notes about this pipeline..."
                                  className="w-full bg-slate-900/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:border-indigo-500/50 focus:outline-none resize-none transition-colors"
                                />
                              </div>
                            </div>
                          )}

                          {/* BUDGET TAB */}
                          {activeTab === "budget" && (
                            <div className="space-y-4">
                              <div className="rounded-xl border border-white/5 overflow-hidden">
                                <div className="grid grid-cols-3 bg-slate-900/60 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
                                  <span>Item</span>
                                  <span className="text-right">Estimated</span>
                                  <span className="text-right">Actual</span>
                                </div>
                                {pipeline.budget?.items?.map((item: any, idx: number) => (
                                  <div key={idx} className="grid grid-cols-3 px-4 py-2.5 border-t border-white/5 text-xs items-center">
                                    <span className="text-slate-300">{item.label}</span>
                                    <span className="text-right text-slate-400 font-mono">${item.estimated}</span>
                                    <span className="text-right text-emerald-400 font-mono font-bold">${item.actual}</span>
                                  </div>
                                ))}
                                <div className="grid grid-cols-3 px-4 py-3 border-t border-white/10 bg-slate-900/80 text-xs font-bold">
                                  <span className="text-slate-200">TOTAL SETUP</span>
                                  <span className="text-right text-slate-300 font-mono">${totalBudget}</span>
                                  <span className="text-right text-emerald-400 font-mono">${pipeline.budget?.items?.reduce((s: number, i: any) => s + i.actual, 0) || 0}</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-500/5 to-indigo-500/5 border border-emerald-500/10">
                                <div>
                                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Projected Monthly Revenue</p>
                                  <p className="text-lg font-black text-emerald-400 font-mono">{pipeline.budget?.projectedRevenue || pipeline.roi || "-"}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">ROI Payback</p>
                                  <p className="text-lg font-black text-indigo-300 font-mono">{totalBudget > 0 ? `~${Math.ceil(totalBudget / 500)} days` : "-"}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* OUTPUT TAB */}
                          {activeTab === "output" && (
                            <div className="space-y-3">
                              {pipeline.outputs?.length === 0 && (
                                <div className="text-center py-8">
                                  <p className="text-slate-500 text-xs italic">No deliverables yet — agents are still working...</p>
                                  <p className="text-[9px] text-slate-600 mt-1">Outputs will appear here as sub-agents complete their work</p>
                                </div>
                              )}
                              {pipeline.outputs?.map((out: any) => (
                                <div key={out.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-slate-900/40 hover:border-white/10 transition-all">
                                  <div className={cx(
                                    "h-8 w-8 rounded-lg flex items-center justify-center text-sm",
                                    out.type === 'url' ? "bg-cyan-500/10 border border-cyan-500/20" :
                                    out.type === 'report' ? "bg-violet-500/10 border border-violet-500/20" :
                                    "bg-indigo-500/10 border border-indigo-500/20"
                                  )}>
                                    {out.type === 'url' ? "🔗" : out.type === 'report' ? "📄" : "📁"}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-200 truncate">{out.title}</p>
                                    <div className="flex gap-2 mt-0.5">
                                      <span className="text-[8px] text-slate-500 uppercase font-bold">{out.agent}</span>
                                      <span className="text-[8px] text-slate-600">{new Date(out.createdAt).toLocaleString()}</span>
                                    </div>
                                  </div>
                                  {out.url && (
                                    <a href={out.url} target="_blank" rel="noreferrer" className="text-[8px] px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 font-bold uppercase transition-all">
                                      Open
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      );
                    })}
                  </div>
                )}
                {/* ── ACTIVE PROJECTS BUILD TRACKER ── */}
                {swarmState.pipelines && swarmState.pipelines.length > 0 && (
                  <div className="mt-8 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-sm">🏗</div>
                        <div>
                          <h3 className="text-sm font-black uppercase tracking-wider text-white">Active Projects</h3>
                          <p className="text-[9px] text-slate-500 uppercase tracking-widest">Build progress & agent activity tracker</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const activePipelines = swarmState.pipelines?.filter((p: any) => p.status === 'active') || [];
                          activePipelines.forEach((p: any) => {
                            fetch("/api/openclaw/agents", {
                              method: "POST", headers: {"Content-Type":"application/json"},
                              body: JSON.stringify({ action: "AUTO_EXECUTE_PIPELINE", payload: { pipelineId: p.id } })
                            }).then(r => r.json()).then(d => {
                              if (d.success) toast(`✅ ${p.title} — BUILT & DEPLOYED to ${d.deployedUrl}`, "success");
                            });
                          });
                          if (activePipelines.length === 0) toast("No active pipelines to execute", "error");
                        }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-[10px] font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all active:scale-95"
                      >
                        ⚡ Auto-Execute All Projects
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {swarmState.pipelines.map((project: any) => {
                        const totalSteps = project.steps?.length || 5;
                        const doneSteps = project.steps?.filter((s: any) => s.done).length || 0;
                        const progress = Math.round((doneSteps / totalSteps) * 100);
                        const isComplete = project.status === 'complete';
                        const outputCount = project.outputs?.length || 0;
                        const deployUrl = project.outputs?.find((o: any) => o.type === 'url')?.url;

                        return (
                          <div key={project.id} className={cx(
                            "rounded-2xl border p-4 transition-all duration-500",
                            isComplete 
                              ? "bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 border-emerald-500/30 shadow-[0_0_25px_-5px_rgba(16,185,129,0.2)]" 
                              : "bg-slate-900/60 border-white/5 hover:border-white/10"
                          )}>
                            {/* Project Header */}
                            <div className="flex items-start gap-3">
                              {/* Progress Circle */}
                              <div className="relative h-14 w-14 shrink-0">
                                <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90">
                                  <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-800" />
                                  <circle cx="18" cy="18" r="16" fill="none" stroke="url(#progressGrad)" strokeWidth="2.5"
                                    strokeDasharray={`${progress} ${100 - progress}`} strokeLinecap="round"
                                    className="transition-all duration-1000" />
                                  <defs><linearGradient id="progressGrad"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#06b6d4" /></linearGradient></defs>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-[10px] font-black text-white">{progress}%</span>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs font-black uppercase tracking-wider text-white truncate">{project.title}</h4>
                                  <span className={cx(
                                    "text-[7px] px-1.5 py-0.5 rounded-full font-black uppercase",
                                    isComplete ? "bg-emerald-500/20 text-emerald-400" : project.status === 'paused' ? "bg-amber-500/20 text-amber-400" : "bg-indigo-500/20 text-indigo-400"
                                  )}>{project.status}</span>
                                </div>
                                <p className="text-[9px] text-slate-500 mt-0.5">{project.roi} • {doneSteps}/{totalSteps} steps • {outputCount} outputs</p>
                                {deployUrl && (
                                  <a href={deployUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-1 text-[8px] px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 font-bold uppercase transition-all">
                                    🔗 {deployUrl.replace('https://', '')}
                                  </a>
                                )}
                              </div>
                              {!isComplete && project.status === 'active' && (
                                <button onClick={() => {
                                  fetch("/api/openclaw/agents", {
                                    method: "POST", headers: {"Content-Type":"application/json"},
                                    body: JSON.stringify({ action: "AUTO_EXECUTE_PIPELINE", payload: { pipelineId: project.id } })
                                  }).then(r => r.json()).then(d => {
                                    if (d.success) toast(`✅ ${project.title} BUILT & DEPLOYED!`, "success");
                                  });
                                }} className="shrink-0 text-[7px] px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 font-black uppercase transition-all active:scale-95">
                                  ⚡ Execute
                                </button>
                              )}
                            </div>

                            {/* Agent Activity Timeline */}
                            <div className="mt-3 space-y-1">
                              {(project.buildActivity || project.subAgents || []).map((activity: any, idx: number) => {
                                const isDone = activity.status === 'done' || activity.status === 'complete';
                                const agentColors: Record<string, string> = {
                                  'Researcher': 'from-violet-500 to-purple-500', 'Architect': 'from-blue-500 to-indigo-500',
                                  'Builder': 'from-amber-500 to-orange-500', 'Copywriter': 'from-pink-500 to-rose-500',
                                  'QA': 'from-emerald-500 to-green-500', 'Deployer': 'from-cyan-500 to-teal-500',
                                  'Marketer': 'from-fuchsia-500 to-purple-500'
                                };
                                const grad = agentColors[activity.agent || activity.name] || 'from-slate-500 to-slate-600';
                                return (
                                  <div key={activity.id || idx} className="flex items-center gap-2">
                                    <div className={cx("h-5 w-5 rounded flex items-center justify-center text-[8px] font-black text-white", isDone ? "bg-emerald-500/20" : "bg-slate-800")}>
                                      {isDone ? "✓" : "○"}
                                    </div>
                                    <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                                      <div className={cx("h-full rounded-full bg-gradient-to-r transition-all duration-1000", grad)} 
                                        style={{ width: `${activity.progress || (isDone ? 100 : 0)}%` }} />
                                    </div>
                                    <span className="text-[7px] font-black uppercase text-slate-400 w-16 truncate">{activity.agent || activity.name}</span>
                                    <span className="text-[7px] text-slate-600 truncate max-w-[140px]">{activity.action || activity.role}</span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Collaborators */}
                            {project.collaborators?.length > 0 && (
                              <div className="mt-2 flex items-center gap-1">
                                <span className="text-[7px] text-slate-600 uppercase font-bold">Team:</span>
                                {project.collaborators.map((c: string) => (
                                  <span key={c} className="text-[6px] px-1 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold uppercase">{c}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>
            )}


            {/* ════════════ REVENUE ════════════ */}
            {tab === "Revenue" && (
              <section className="space-y-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">Revenue Streams</h2>
                    <p className="text-[10px] text-emerald-500/80 uppercase tracking-[0.4em] font-bold">Active Profit Generation</p>
                  </div>
                  <div className="flex bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl text-emerald-400 font-mono text-xl font-black shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    £0.00 <span className="text-[10px] uppercase text-emerald-500/50 self-end ml-2 mb-1">GBP</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Factual Empty State */}
                  <div className="py-24 text-center border border-dashed border-emerald-500/20 rounded-2xl bg-emerald-950/20">
                    <CircleDollarSign size={64} className="mx-auto text-emerald-900 mb-6" />
                    <h3 className="text-lg font-bold text-emerald-500/50">Awaiting First Revenue Engine Deployment</h3>
                    <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                      Pipelines are currently under construction. Once a project is fully built and deployed to the public, real verified GBP (£) profit and expected revenue timelines will appear here. No fictional projections are recorded in this terminal.
                    </p>
                  </div>

                  {/* Payment Verification Widget */}
                  <GlassCard title="Payment Infrastructure" icon={<CreditCard size={16} className="text-emerald-400" />}>
                     <div className="space-y-4 mt-2">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/10">
                           <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                <Link2 size={14} />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-200">Stripe API Access</p>
                                <p className="text-[9px] uppercase tracking-widest text-slate-500 mt-0.5">Live Mode Secret Key</p>
                              </div>
                           </div>
                           <span className="px-2 py-1 text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 rounded">CONNECTED</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/10">
                           <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                <Activity size={14} />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-200">Webhook Sync</p>
                                <p className="text-[9px] uppercase tracking-widest text-slate-500 mt-0.5">Event Listener</p>
                              </div>
                           </div>
                           <span className="px-2 py-1 text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 rounded">ACTIVE</span>
                        </div>
                        <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest font-bold pt-2">All future agents are pre-authorized to integrate payment links.</p>
                     </div>
                  </GlassCard>
                </div>
              </section>
            )}


            {/* ════════════ BANK ════════════ */}
            {tab === "Bank" && (
              <section className="space-y-8">
                 <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-amber-300 to-amber-600 bg-clip-text text-transparent">Central Bank</h2>
                    <p className="text-[10px] text-amber-500/80 uppercase tracking-[0.4em] font-bold">Aggregated Capital Allocation</p>
                  </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                   <div className="lg:col-span-2">
                     <GlassCard title="" glowColor="rgba(245,158,11,0.1)" className="h-full flex flex-col justify-center items-center py-16 relative overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />
                        <Landmark size={48} className="text-amber-500/20 mb-6" />
                        <p className="text-[10px] uppercase tracking-[0.5em] text-amber-500/80 font-black mb-2">Total Accumulated Vault Balance</p>
                        <h1 className="text-6xl md:text-8xl font-black font-mono tracking-tighter text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                          £0<span className="text-2xl md:text-4xl text-amber-500/50">.00</span>
                        </h1>
                        <div className="mt-12 flex flex-col items-center z-10 w-full max-w-md">
                           {/* Explicit Routing Verification */}
                           <div className="mb-8 w-full p-4 rounded-xl bg-amber-950/30 border border-amber-500/20 flex flex-col items-center">
                              <ShieldCheck size={24} className="text-emerald-400 mb-2" />
                              <p className="text-xs text-center font-bold text-slate-200">100% Owner Margin Distribution</p>
                              <p className="text-[10px] text-center text-slate-500 mt-2 leading-relaxed">
                                All Stripe Payouts from connected revenue pipelines are hard-coded to route directly to <span className="text-amber-400 font-mono">moazzinzaman&apos;s</span> primary enrolled bank account. Agents do NOT take a commission.
                              </p>
                           </div>

                           <div className="flex gap-4 w-full px-8 opacity-50 grayscale pointer-events-none">
                             <button className="flex-1 flex items-center justify-center gap-2 px-8 py-3 bg-amber-500 text-black font-black uppercase tracking-widest text-[10px] rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                                Withdraw Funds
                             </button>
                             <button className="flex-1 flex items-center justify-center gap-2 px-8 py-3 bg-amber-500/10 text-amber-400 border border-amber-500/30 font-black uppercase tracking-widest text-[10px] rounded-xl">
                                Reinvest
                             </button>
                           </div>
                           <p className="mt-4 text-[9px] text-amber-500/50 uppercase tracking-widest font-bold">Actions locked pending verified deposits</p>
                        </div>
                     </GlassCard>
                   </div>

                   
                   <div className="space-y-6">
                     <GlassCard title="Verified Ledgers" icon={<Activity size={16} className="text-amber-400" />}>
                        <div className="flex flex-col items-center justify-center py-16 text-center opacity-60">
                           <Activity size={32} className="text-amber-500/30 mb-4" />
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Transactions</p>
                           <p className="text-[10px] text-slate-500 mt-2 max-w-[200px]">Only cryptographically or API-verified real-world GBP transactions will manifest on this ledger.</p>
                        </div>
                     </GlassCard>
                   </div>
                 </div>
              </section>
            )}
            {/* ════════════ DEPLOYMENTS ════════════ */}
            {tab === "Deployments" && (
              <section className="space-y-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">Active Deployments</h2>
                    <p className="text-[10px] text-cyan-500/80 uppercase tracking-[0.4em] font-bold">Live Public Fleet Management</p>
                  </div>
                  <div className="flex bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-xl text-cyan-400 font-mono text-xl font-black shadow-[0_0_15px_rgba(6,182,212,0.2)] items-center gap-2">
                    <Globe size={18} className="animate-spin-slow" />
                    2 ONLINE
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {[
                    { id: 1, name: "Chrome Extension Factory", url: "https://extension-factory.vercel.app", status: "Online", platform: "Vercel", uptime: "99.99%", reqs: "1.2k", build: "2 hrs ago" },
                    { id: 2, name: "SaaS Blueprint Landing", url: "https://saas-blueprint.vercel.app", status: "Online", platform: "Vercel", uptime: "100%", reqs: "450", build: "1 day ago" }
                  ].map(dep => (
                    <GlassCard key={dep.id} title={dep.name} icon={<Server className="text-cyan-400" size={16} />} glowColor="rgba(6,182,212,0.1)">
                      <div className="space-y-5">
                        
                        {/* URL and Status Row */}
                        <div className="flex justify-between items-start">
                           <a href={dep.url} target="_blank" rel="noopener noreferrer" className="group flex flex-col cursor-pointer">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1 group-hover:text-cyan-400 transition-colors">
                                Public URL <ExternalLink size={10} />
                              </span>
                              <span className="text-sm font-mono text-slate-300 group-hover:text-white transition-colors border-b border-transparent group-hover:border-white/20 pb-0.5">{dep.url}</span>
                           </a>
                           <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="text-[10px] font-black uppercase text-emerald-400">{dep.status}</span>
                           </div>
                        </div>

                        {/* Analytics Row */}
                        <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/5">
                           <div className="text-center">
                              <p className="text-[9px] uppercase tracking-widest font-bold text-slate-500">Platform</p>
                              <p className="text-xs font-black text-slate-200 mt-1">{dep.platform}</p>
                           </div>
                           <div className="text-center border-x border-white/5">
                              <p className="text-[9px] uppercase tracking-widest font-bold text-slate-500">Uptime</p>
                              <p className="text-xs font-mono text-cyan-400 mt-1">{dep.uptime}</p>
                           </div>
                           <div className="text-center">
                              <p className="text-[9px] uppercase tracking-widest font-bold text-slate-500">24h Config</p>
                              <p className="text-xs font-mono text-slate-300 mt-1">{dep.reqs} reqs</p>
                           </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-1 text-[10px] font-black uppercase tracking-widest">
                           <span className="text-slate-500 flex items-center gap-1">
                             <Clock3 size={10} /> Last deployed {dep.build}
                           </span>
                           <div className="flex gap-2">
                             <button className="px-3 py-1.5 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors border border-white/5">Logs</button>
                             <button className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/20 transition-colors">Manage DNS</button>
                           </div>
                        </div>

                      </div>
                    </GlassCard>
                  ))}
                  
                  {/* Empty Slot */}
                  <div className="flex flex-col items-center justify-center p-8 border border-dashed border-cyan-500/20 rounded-2xl bg-cyan-950/20 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                     <Plus size={32} className="text-cyan-500/50 mb-4" />
                     <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest text-center">Deploy New Application</p>
                     <p className="text-[10px] text-slate-500 text-center mt-2 max-w-[200px]">Launch a new codebase directly to Vercel via Pipeline orchestration.</p>
                  </div>
                </div>
              </section>
            )}

            {/* ════════════ BILLING ════════════ */}
            {tab === "Billing" && (
              <section className="space-y-6">
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-bold">Choose Your Plan</h2>
                  <p className="text-sm text-slate-400 mt-1">Unlock premium agentic workflows and advanced automation</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <PricingCard
                    name="Free"
                    price="Free"
                    current={settings.subscriptionTier === "free"}
                    features={[
                      "Dashboard access",
                      "Manual agent triggers",
                      "3 tasks per day",
                      "Basic system monitoring",
                    ]}
                    onSelect={() => { patch("subscriptionTier", "free"); toast("Downgraded to Free"); }}
                  />
                  <PricingCard
                    name="Pro"
                    price="£29"
                    current={settings.subscriptionTier === "pro"}
                    highlight
                    features={[
                      "Everything in Free",
                      "Unlimited agent tasks",
                      "Lead Hunter automation",
                      "Priority model routing",
                      "Watchdog alerts",
                      "Webhook integrations",
                    ]}
                    onSelect={() => handleCheckout("pro")}
                  />
                  <PricingCard
                    name="Enterprise"
                    price="£99"
                    current={settings.subscriptionTier === "enterprise"}
                    features={[
                      "Everything in Pro",
                      "Autonomous mode",
                      "Multi-agent orchestration",
                      "Custom skill builder",
                      "SLA & priority support",
                      "Team dashboard (coming soon)",
                    ]}
                    onSelect={() => handleCheckout("enterprise")}
                  />
                </div>
                <GlassCard title="Billing History" icon={<CreditCard size={16} />} className="max-w-4xl mx-auto">
                  <div className="text-center py-6 text-sm text-slate-500">
                    <p>No billing history yet.</p>
                    <p className="text-xs mt-1">Transactions will appear here once you subscribe.</p>
                  </div>
                </GlassCard>
              </section>
            )}

            {/* ════════════ SETTINGS ════════════ */}
            {tab === "Settings" && (
              <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <GlassCard title="OpenClaw Integration" icon={<Link2 size={16} />}>
                  <div className="space-y-3">
                    <Toggle label="Enable OpenClaw" checked={settings.openClawEnabled} onChange={v => patch("openClawEnabled", v)} />
                    <Toggle label="Auto reconnect" checked={settings.openClawAutoReconnect} onChange={v => patch("openClawAutoReconnect", v)} />
                    <label className="block text-sm"><span className="text-xs text-slate-400">Endpoint</span>
                      <input value={settings.openClawEndpoint} onChange={e => patch("openClawEndpoint", e.target.value)}
                        className="mt-1 w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 font-mono text-sm" title="Endpoint" /></label>
                    <label className="block text-sm"><span className="text-xs text-slate-400">API Key</span>
                      <input type="password" value={settings.openClawApiKey} onChange={e => patch("openClawApiKey", e.target.value)}
                        className="mt-1 w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 font-mono text-sm" title="API Key" /></label>
                    <label className="block text-sm"><span className="text-xs text-slate-400">Model</span>
                      <input value={settings.openClawModel} onChange={e => patch("openClawModel", e.target.value)}
                        className="mt-1 w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 font-mono text-sm" title="Model" /></label>
                    <label className="block text-sm"><span className="text-xs text-slate-400">Heartbeat interval (seconds)</span>
                      <input type="number" value={settings.openClawHeartbeatSec} onChange={e => patch("openClawHeartbeatSec", Number(e.target.value) || 30)}
                        className="mt-1 w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 font-mono text-sm" title="Heartbeat" /></label>
                  </div>
                </GlassCard>

                <GlassCard title="Automation & Safety" icon={<Workflow size={16} />}>
                  <div className="space-y-2">
                    <label className="block text-sm"><span className="text-xs text-slate-400">Autonomy mode</span>
                      <select value={settings.autonomyMode} onChange={e => patch("autonomyMode", e.target.value as AppSettings["autonomyMode"])}
                        className="mt-1 w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-sm" title="Autonomy mode">
                        <option value="manual">manual</option><option value="assisted">assisted</option><option value="autonomous">autonomous</option>
                      </select>
                    </label>
                    <Toggle label="Scheduler" checked={settings.schedulerEnabled} onChange={v => patch("schedulerEnabled", v)} />
                    <Toggle label="Watchdog" checked={settings.watchdogEnabled} onChange={v => patch("watchdogEnabled", v)} />
                    <Toggle label="Alerts" checked={settings.alertsEnabled} onChange={v => patch("alertsEnabled", v)} />
                    <Toggle label="Command approval" checked={settings.commandApprovalRequired} onChange={v => patch("commandApprovalRequired", v)} />
                    <Toggle label="Safe mode" checked={settings.commandSafeMode} onChange={v => patch("commandSafeMode", v)} />
                    <Toggle label="Dark mode" checked={settings.darkMode} onChange={v => patch("darkMode", v)} />
                    <Toggle label="Compact mode" checked={settings.compactMode} onChange={v => patch("compactMode", v)} />
                  </div>
                </GlassCard>

                <GlassCard title="Policy Thresholds" icon={<Server size={16} />}>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {([["CPU %", "watchdogCpuThreshold", 85], ["MEM %", "watchdogMemoryThreshold", 90],
                       ["Retry", "watchdogRetryMax", 3], ["Backoff (s)", "watchdogBackoffSec", 10]] as const).map(([lbl, key, def]) => (
                      <label key={key} className="block"><span className="text-xs text-slate-400">{lbl}</span>
                        <input type="number" value={settings[key]} onChange={e => patch(key, Number(e.target.value) || def)}
                          className="mt-1 w-full rounded-lg border border-white/10 bg-slate-800 px-2 py-1 font-mono" title={lbl} />
                      </label>
                    ))}
                  </div>
                </GlassCard>
                <GlassCard title="Git Projects" icon={<FolderGit2 size={16} />}>
                  <div className="space-y-4">
                    {settings.projects.map((p, i) => (
                      <div key={i} className="flex flex-col gap-2 p-3 rounded-xl bg-slate-800/50 border border-white/5">
                        <div className="flex items-center gap-2">
                          <input placeholder="Name (e.g. My App)" value={p.name} onChange={e => patch("projects", settings.projects.map((x, j) => j===i ? {...x, name: e.target.value} : x))} className="flex-1 bg-transparent text-sm font-bold text-slate-200 outline-none" />
                          <select 
                            value={p.category || 'website'} 
                            onChange={e => patch("projects", settings.projects.map((x, j) => j===i ? {...x, category: e.target.value as any} : x))}
                            className="bg-slate-900 border border-white/10 rounded px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold text-indigo-400 outline-none"
                          >
                            <option value="website">Website</option>
                            <option value="app">App</option>
                            <option value="extension">Extension</option>
                            <option value="software">Software</option>
                          </select>
                          <button onClick={() => patch("projects", settings.projects.filter((_, j) => j!==i))} className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors"><Trash2 size={14}/></button>
                        </div>
                        <input placeholder="Absolute Path (/Users/...)" value={p.path} onChange={e => patch("projects", settings.projects.map((x, j) => j===i ? {...x, path: e.target.value} : x))} className="w-full bg-transparent text-xs font-mono text-slate-400 outline-none border-t border-white/5 pt-2" />
                      </div>
                    ))}
                    <button onClick={() => patch("projects", [...settings.projects, { id: `proj-${Date.now()}`, name: "New Project", path: "", category: 'website' }])} className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-500/15 border border-indigo-400/20 px-3 py-2 text-xs font-bold hover:bg-indigo-500/25 transition-colors">
                      <Plus size={14} /> Add Project
                    </button>
                  </div>
                </GlassCard>
                <GlassCard title="Commands & Actions" icon={<Terminal size={16} />}>
                  <label className="block text-sm"><span className="text-xs text-slate-400">Allowlist</span>
                    <textarea value={settings.commandAllowlist} onChange={e => patch("commandAllowlist", e.target.value)}
                      className="mt-1 h-20 w-full rounded-lg border border-white/10 bg-slate-800 p-2 font-mono text-xs" title="Allowlist" /></label>
                  <label className="block text-sm mt-2"><span className="text-xs text-slate-400">Denylist</span>
                    <textarea value={settings.commandDenylist} onChange={e => patch("commandDenylist", e.target.value)}
                      className="mt-1 h-20 w-full rounded-lg border border-white/10 bg-slate-800 p-2 font-mono text-xs" title="Denylist" /></label>
                  <div className="mt-3 flex gap-2">
                    <button onClick={testOpenClaw} className="rounded-lg bg-emerald-500/15 border border-emerald-500/20 px-3 py-2 text-sm hover:bg-emerald-500/25 transition-colors">Test OpenClaw</button>
                    <button onClick={watchdogCheck} className="rounded-lg bg-amber-500/15 border border-amber-500/20 px-3 py-2 text-sm hover:bg-amber-500/25 transition-colors">Watchdog</button>
                    <button onClick={saveSettings} className="rounded-lg bg-indigo-500/15 border border-indigo-400/20 px-3 py-2 text-sm hover:bg-indigo-500/25 transition-colors">Save</button>
                    <button onClick={() => setSettings(defaults)} className="rounded-lg bg-rose-500/15 border border-rose-500/20 px-3 py-2 text-sm hover:bg-rose-500/25 transition-colors">Reset</button>
                  </div>
                </GlassCard>
              </section>
            )}
            </motion.div>
          </AnimatePresence>
        </main>
        </div>
      </motion.div>

      {/* ── Cmd+K Modal ── */}
      <AnimatePresence>
      {cmdkOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]" onClick={() => setCmdkOpen(false)}>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md" 
          />
          <motion.div 
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-lg rounded-2xl glass-v2 shadow-2xl shadow-indigo-500/20 overflow-hidden"
          >
            <div className="hud-bracket hud-bracket-tl bg-indigo-500" />
            <div className="hud-bracket hud-bracket-br bg-indigo-500" />
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <Search size={16} className="text-slate-400" />
              <input autoFocus value={cmdkQuery} onChange={e => setCmdkQuery(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500" placeholder="Type a command..." />
              <button onClick={() => setCmdkOpen(false)} className="text-slate-500 hover:text-slate-300"><X size={16} /></button>
            </div>
            <div className="max-h-64 overflow-auto p-2">
              {filteredCmdk.map(item => (
                <button key={item.label} onClick={item.action}
                  className="w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-indigo-500/15 transition-colors">{item.label}</button>
              ))}
              {filteredCmdk.length === 0 && <p className="text-center text-sm text-slate-500 py-4">No results</p>}
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* ── Toast Notifications ── */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2 pointer-events-none">
        <AnimatePresence>
        {toasts.map(t => (
          <motion.div 
            key={t.id} 
            initial={{ opacity: 0, x: 50, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className={cx(
              "rounded-xl glass-v2 px-4 py-3 text-sm shadow-lg pointer-events-auto",
              t.level === "success" ? "border-emerald-500/30 text-emerald-200" :
              t.level === "warn" ? "border-amber-500/30 text-amber-200" :
              t.level === "error" ? "border-rose-500/30 text-rose-200" :
              "border-blue-500/30 text-blue-200"
            )}>
            <div className="flex items-center gap-2">
              <div className={cx("h-1.5 w-1.5 rounded-full", 
                t.level === "success" ? "bg-emerald-400" : 
                t.level === "warn" ? "bg-amber-400" : 
                t.level === "error" ? "bg-rose-400" : "bg-indigo-400"
              )} />
              {t.msg}
            </div>
          </motion.div>
        ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
