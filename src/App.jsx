import { useState, useEffect, useCallback, useRef } from "react";

const GEMINI_KEY = "AIzaSyBKSxvPhBZNoYGOaSCMT_zrRBCM9dQTpMs";
const uid = () => Math.random().toString(36).slice(2, 10);

const STATUSES = {
  todo: { label: "To Do", color: "#888" },
  progress: { label: "In Progress", color: "#60A5FA" },
  blocked: { label: "Blocked", color: "#F87171" },
  done: { label: "Done", color: "#4ADE80" },
};

const PRIOS = {
  none: { label: "None", color: "#555" },
  low: { label: "Low", color: "#60A5FA" },
  medium: { label: "Medium", color: "#FBBF24" },
  high: { label: "High", color: "#FB923C" },
  urgent: { label: "Urgent", color: "#F87171" },
};

// ── Styles ──
const css = {
  inp: { background: "#0A0A12", border: "1px solid #1e1e30", borderRadius: 7, padding: "7px 10px", color: "#ccc", fontSize: 12, width: "100%", fontFamily: "inherit", outline: "none" },
  btn: { background: "#818CF822", color: "#818CF8", border: "1px solid #818CF844", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  btnSm: { background: "transparent", color: "#777", border: "1px solid #1e1e30", borderRadius: 5, padding: "4px 10px", fontSize: 10, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 3, fontFamily: "inherit" },
  btnIc: { background: "transparent", border: "none", color: "#555", fontSize: 13, cursor: "pointer", padding: "3px 5px", borderRadius: 4, fontFamily: "inherit" },
  lbl: { fontSize: 9, color: "#555", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 10, marginBottom: 3 },
};

// ── Default data ──
const defaultTeam = [
  { id: "tm1", name: "Christian", role: "Co-Lead (GHL/AI)", color: "#818CF8" },
  { id: "tm2", name: "John", role: "Co-Lead (Design)", color: "#F472B6" },
  { id: "tm3", name: "Ren", role: "Operations Lead", color: "#FB923C" },
  { id: "tm4", name: "Sonny", role: "Owner/CEO", color: "#FBBF24" },
  { id: "tm5", name: "Muriel", role: "Senior Designer", color: "#34D399" },
];

const defaultTags = [
  { id: "tg1", name: "ClickUp", color: "#818CF8" },
  { id: "tg2", name: "GHL", color: "#4ADE80" },
  { id: "tg3", name: "Design", color: "#FB923C" },
  { id: "tg4", name: "Ops", color: "#60A5FA" },
];

function makeWeeks() {
  const w = (num, dates, obj, tasks) => ({ id: uid(), num, dates, objective: obj, tasks: tasks.map(t => ({ id: uid(), status: "todo", tags: [], priority: "none", details: "", ...t })) });
  return [
    w(1, "Apr 14–18", "GHL Setup + ClickUp Automations + Knowledge Transfer", [
      { title: "Complete GHL setup checklist Steps 1–11", owner: "tm1", priority: "urgent", tags: ["tg2"], details: "Verify integrations. Document in GHL Config Reference." },
      { title: "Begin Colleen-to-Ren knowledge transfer", owner: "tm3", priority: "high", tags: ["tg4"], details: "Screen-capture every process." },
      { title: "Build ClickUp Automations #1–3", owner: "tm3", priority: "high", tags: ["tg1"], details: "Mockup Sent Follow-Up, Stale PRE PURCHASE, New Task Assignment." },
      { title: "Grant Shopify API access for GHL", owner: "tm4", priority: "urgent", tags: ["tg2"], details: "BLOCKER: Must be done by Tue Apr 15." },
    ]),
    w(2, "Apr 21–25", "Complete ClickUp Automations + Email Templates", [
      { title: "Build ClickUp automations #4–10", owner: "tm1", priority: "high", tags: ["tg1"], details: "Set up Zapier + first zap." },
      { title: "Complete knowledge transfer by Fri", owner: "tm3", priority: "high", tags: ["tg4"], details: "Top 20 email scenarios." },
      { title: "Draft 14 GHL email templates", owner: "tm3", priority: "medium", tags: ["tg2"], details: "Use Coordinator System Prompt." },
      { title: "Approve email template language", owner: "tm4", priority: "medium", tags: ["tg2"], details: "Final brand voice sign-off." },
    ]),
    w(3, "Apr 28 – May 2", "First GHL Workflows: Order Confirmation + Artwork Request", [
      { title: "Build GHL Workflow #1: Shopify → Confirmation", owner: "tm1", priority: "urgent", tags: ["tg2"], details: "Trigger on paid order, email within 5 min." },
      { title: "Build GHL Workflow #2: No Artwork → Request", owner: "tm1", priority: "high", tags: ["tg2"], details: "24hr wait, check tag, reminder sequence." },
      { title: "Load templates + test deliverability", owner: "tm3", priority: "medium", tags: ["tg2"], details: "Test Gmail, Outlook, Yahoo." },
    ]),
    w(4, "May 5–9", "Mockup Delivery + Approval + Stale Lead Sequences", [
      { title: "Build GHL Workflows #3–5", owner: "tm1", priority: "high", tags: ["tg2"], details: "Mockup Ready, Approved, Stale lead." },
      { title: "Test Workflows 3–4 on real tasks", owner: "tm3", priority: "medium", tags: ["tg4"], details: "Drive cleanup of 181 folders." },
      { title: "Approve stale lead email sequence", owner: "tm4", priority: "medium", tags: ["tg2"], details: "DID NOT PURCHASE content." },
    ]),
    w(5, "May 12–16", "Tracking/Shipping + DID NOT PURCHASE + Drive Cleanup", [
      { title: "Build GHL Workflows #6–7", owner: "tm1", priority: "high", tags: ["tg2"], details: "Tracking email + Shopify fulfillment." },
      { title: "Continue Google Drive cleanup", owner: "tm3", priority: "medium", tags: ["tg4"], details: "Move stale folders per tier." },
    ]),
    w(6, "May 19–23", "Post-Delivery Automations + First Full System Test", [
      { title: "Build GHL Workflows #8–10", owner: "tm1", priority: "high", tags: ["tg2"], details: "Review request, setup instructions, split shipment." },
      { title: "Run FIRST FULL SYSTEM TEST (3 orders)", owner: "tm3", priority: "urgent", tags: ["tg4"], details: "Document every failure point." },
      { title: "Create tent setup instructions video", owner: "tm4", priority: "medium", tags: ["tg4"], details: "Needed for Workflow #9." },
    ]),
    w(7, "May 26–30", "Bug Fixes + AI Design Brief Agent V1", [
      { title: "Fix all Week 6 system test issues", owner: "tm1", priority: "urgent", tags: ["tg4"], details: "Fix before building new." },
      { title: "Build V1 AI Design Brief Generator", owner: "tm1", priority: "high", tags: ["tg3"], details: "ClickUp → client site → structured brief." },
      { title: "Write workflow how-to guides", owner: "tm3", priority: "medium", tags: ["tg4"], details: "Failure procedures documented." },
    ]),
    w(8, "Jun 2–6", "Design Automations + Freepik + Mockup Script", [
      { title: "Build Freepik API integration", owner: "tm1", priority: "high", tags: ["tg3"], details: "Keywords → background images." },
      { title: "Fix mockup script + PNG export", owner: "tm2", priority: "high", tags: ["tg3"], details: "Batch select. Train Muriel." },
      { title: "Write Workflow Playbook", owner: "tm3", priority: "medium", tags: ["tg4"], details: "Every automation documented." },
    ]),
    w(9, "Jun 9–13", "Mockup Script Rollout + Illustrator Chain V1", [
      { title: "Roll out mockup script to full team", owner: "tm2", priority: "high", tags: ["tg3"], details: "Kiara + Maria onboarded." },
      { title: "Begin Illustrator → 3D Mockup chain", owner: "tm1", priority: "medium", tags: ["tg3"], details: "Semi-automated chain." },
    ]),
    w(10, "Jun 16–20", "Stress Test + Edge Cases + Error Handling", [
      { title: "Build edge case handlers + error alerts", owner: "tm1", priority: "high", tags: ["tg4"], details: "Webhook failures, bounces." },
      { title: "Run SECOND FULL SYSTEM TEST", owner: "tm3", priority: "urgent", tags: ["tg4"], details: "5 orders, compare baseline." },
      { title: "Review docs + continuity planning", owner: "tm4", priority: "medium", tags: ["tg4"], details: "Plan for unavailability." },
    ]),
    w(11, "Jun 23–27", "Final Review + Metrics + Q3 Planning", [
      { title: "Create System Health Dashboard", owner: "tm1", priority: "high", tags: ["tg4"], details: "Status, errors, metrics." },
      { title: "Compile final metrics report", owner: "tm3", priority: "high", tags: ["tg4"], details: "Time saved, compliance." },
      { title: "Final review + approve Q3 roadmap", owner: "tm4", priority: "medium", tags: ["tg4"], details: "Celebrate wins." },
    ]),
  ];
}

const defaultProject = () => ({ id: uid(), name: "STX Promo Automation", desc: "Q2 2026 Implementation Roadmap", team: defaultTeam, tags: defaultTags, weeks: makeWeeks() });
const blankProject = () => ({ id: uid(), name: "New Project", desc: "Description", team: [{ id: uid(), name: "Lead", role: "Lead", color: "#818CF8" }], tags: [{ id: uid(), name: "General", color: "#818CF8" }], weeks: [{ id: uid(), num: 1, dates: "Week 1", objective: "Getting started", tasks: [] }] });

// ── Storage ──
import { saveData as saveStore, subscribeToData, isLiveSync } from "./storage.js";

// ── Sub Components ──
function InlineEdit({ value, onChange, style: s = {} }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  const ref = useRef(null);
  useEffect(() => { setVal(value); }, [value]);
  useEffect(() => { if (editing && ref.current) { ref.current.focus(); ref.current.select(); } }, [editing]);
  if (editing) {
    return <input ref={ref} value={val} onChange={e => setVal(e.target.value)}
      onBlur={() => { onChange(val); setEditing(false); }}
      onKeyDown={e => { if (e.key === "Enter") { onChange(val); setEditing(false); } if (e.key === "Escape") { setVal(value); setEditing(false); } }}
      style={{ ...s, background: "transparent", border: "none", borderBottom: "1px solid #818CF8", padding: "1px 0", width: "100%", outline: "none", fontFamily: "inherit" }} />;
  }
  return <div onClick={() => setEditing(true)} style={{ ...s, cursor: "text", minHeight: 16, borderBottom: "1px solid transparent" }}>{value || <span style={{ color: "#333", fontStyle: "italic", fontSize: 11 }}>Click to edit</span>}</div>;
}

function Modal({ title, children, onClose, onSave, saveLabel, saveColor, wide }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000077", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#0F0F18", border: "1px solid #22223a", borderRadius: 14, padding: 22, width: wide ? 620 : 420, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px #00000055" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>{title}</span>
          <button onClick={onClose} style={css.btnIc}>✕</button>
        </div>
        {children}
        {onSave && <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 16 }}>
          <button onClick={onClose} style={css.btnSm}>Cancel</button>
          <button onClick={onSave} style={{ ...css.btnSm, background: (saveColor || "#818CF8") + "22", color: saveColor || "#818CF8", borderColor: saveColor || "#818CF8" }}>{saveLabel || "Save"}</button>
        </div>}
      </div>
    </div>
  );
}

function ProgressBar({ value, color = "#818CF8", h = 4, style: s = {} }) {
  return <div style={{ background: "#1a1a28", borderRadius: h, height: h, overflow: "hidden", ...s }}>
    <div style={{ height: "100%", borderRadius: h, background: value >= 100 ? "#4ADE80" : color, width: `${value}%`, transition: "width 0.3s" }} />
  </div>;
}

// ── Main App ──
export default function App() {
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [view, setView] = useState("timeline");
  const [fOwner, setFOwner] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [fTag, setFTag] = useState("all");
  const [search, setSearch] = useState("");
  const [expWeeks, setExpWeeks] = useState({});
  const [allExp, setAllExp] = useState(false);
  const [sidebar, setSidebar] = useState(true);
  const [editTask, setEditTask] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState("general");
  const [showAI, setShowAI] = useState(false);
  const [aiText, setAiText] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiWeek, setAiWeek] = useState("");
  const [teamView, setTeamView] = useState(null);
  const [memberPanel, setMemberPanel] = useState(null);
  const [boardMode, setBoardMode] = useState("overview");
  const [boardWeek, setBoardWeek] = useState("");
  const [confirmDel, setConfirmDel] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const initializedRef = useRef(false);

  // Subscribe to realtime data (Firebase = instant, localStorage = 3s poll)
  useEffect(() => {
    const unsub = subscribeToData((d) => {
      if (d && d.projects) {
        setData(d);
        if (!initializedRef.current) { setActiveId(d.activeId || d.projects[0]?.id); }
      } else if (!initializedRef.current) {
        const p = defaultProject();
        const init = { projects: [p], activeId: p.id };
        setData(init); setActiveId(p.id); saveStore(init);
      }
      setLastSync(new Date());
      if (!initializedRef.current) { initializedRef.current = true; setLoaded(true); }
    });
    return typeof unsub === "function" ? unsub : () => {};
  }, []);

  const save = useCallback(n => { setData(n); saveStore(n); setLastSync(new Date()); }, []);
  const manualSync = useCallback(() => { setSyncing(true); setTimeout(() => setSyncing(false), 600); }, []);
  const proj = data?.projects?.find(p => p.id === activeId);

  const up = useCallback(fn => {
    if (!data || !activeId) return;
    const next = { ...data, projects: data.projects.map(p => {
      if (p.id !== activeId) return p;
      const copy = { ...p, team: [...(p.team || [])], tags: [...(p.tags || [])], weeks: (p.weeks || []).map(w => ({ ...w, tasks: [...(w.tasks || [])] })) };
      return fn(copy);
    })};
    save(next);
  }, [data, activeId, save]);

  // ── Helpers ──
  const getMember = id => proj?.team?.find(m => m.id === id);
  const getTag = id => proj?.tags?.find(t => t.id === id);

  const allTasks = proj?.weeks?.flatMap(w => w.tasks || []) || [];
  const matchTask = t => {
    if (fOwner !== "all" && t.owner !== fOwner) return false;
    if (fStatus !== "all" && t.status !== fStatus) return false;
    if (fTag !== "all" && !(t.tags || []).includes(fTag)) return false;
    if (search && !(t.title || "").toLowerCase().includes(search.toLowerCase()) && !(t.details || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  };

  const doneCount = allTasks.filter(t => t.status === "done").length;
  const pctAll = allTasks.length ? Math.round(doneCount / allTasks.length * 100) : 0;
  const wPct = w => { const ts = w.tasks || []; const d = ts.filter(t => t.status === "done").length; return { d, t: ts.length, p: ts.length ? Math.round(d / ts.length * 100) : 0 }; };
  const tagPct = tgId => { const ts = allTasks.filter(t => (t.tags || []).includes(tgId)); const d = ts.filter(t => t.status === "done").length; return { d, t: ts.length, p: ts.length ? Math.round(d / ts.length * 100) : 0 }; };
  const memStats = mid => {
    const ts = allTasks.filter(t => t.owner === mid);
    const d = ts.filter(t => t.status === "done").length;
    const byStatus = {}; Object.keys(STATUSES).forEach(s => { byStatus[s] = ts.filter(t => t.status === s).length; });
    const byPrio = {}; Object.keys(PRIOS).forEach(p => { byPrio[p] = ts.filter(t => t.priority === p).length; });
    return { tasks: ts, d, t: ts.length, p: ts.length ? Math.round(d / ts.length * 100) : 0, byStatus, byPrio };
  };

  // ── CRUD ──
  const addWeek = () => up(p => { p.weeks.push({ id: uid(), num: p.weeks.length + 1, dates: `Week ${p.weeks.length + 1}`, objective: "New phase", tasks: [] }); return p; });
  const delWeek = wid => up(p => { p.weeks = p.weeks.filter(w => w.id !== wid).map((w, i) => ({ ...w, num: i + 1 })); return p; });
  const upWeek = (wid, u) => up(p => { p.weeks = p.weeks.map(w => w.id === wid ? { ...w, ...u } : w); return p; });
  const dupWeek = wid => up(p => { const w = p.weeks.find(x => x.id === wid); if (w) p.weeks.push({ ...w, id: uid(), num: p.weeks.length + 1, tasks: w.tasks.map(t => ({ ...t, id: uid(), status: "todo" })) }); return p; });
  const moveWeek = (f, t) => up(p => { const a = [...p.weeks]; const [m] = a.splice(f, 1); a.splice(t, 0, m); p.weeks = a.map((w, i) => ({ ...w, num: i + 1 })); return p; });

  const addTask = wid => up(p => { p.weeks = p.weeks.map(w => w.id === wid ? { ...w, tasks: [...w.tasks, { id: uid(), title: "New task", owner: "", status: "todo", priority: "none", tags: [], details: "" }] } : w); return p; });
  const delTask = (wid, tid) => up(p => { p.weeks = p.weeks.map(w => w.id === wid ? { ...w, tasks: w.tasks.filter(t => t.id !== tid) } : w); return p; });
  const upTask = (wid, tid, u) => up(p => { p.weeks = p.weeks.map(w => w.id === wid ? { ...w, tasks: w.tasks.map(t => t.id === tid ? { ...t, ...u } : t) } : w); return p; });
  const dupTask = (wid, tid) => up(p => { p.weeks = p.weeks.map(w => { if (w.id !== wid) return w; const t = w.tasks.find(x => x.id === tid); if (t) w.tasks.push({ ...t, id: uid(), title: t.title + " (copy)", status: "todo" }); return w; }); return p; });
  const moveTask = (wid, f, t) => up(p => { p.weeks = p.weeks.map(w => { if (w.id !== wid) return w; const a = [...w.tasks]; const [m] = a.splice(f, 1); a.splice(t, 0, m); return { ...w, tasks: a }; }); return p; });

  const cycleStatus = (wid, tid, current) => { const ks = Object.keys(STATUSES); upTask(wid, tid, { status: ks[(ks.indexOf(current) + 1) % ks.length] }); };

  const addProject = () => { const p = blankProject(); const n = { ...data, projects: [...data.projects, p], activeId: p.id }; setActiveId(p.id); save(n); };
  const delProject = pid => { const ps = data.projects.filter(p => p.id !== pid); const nid = ps[0]?.id || null; save({ ...data, projects: ps, activeId: nid }); setActiveId(nid); setConfirmDel(null); setShowSettings(false); };
  const switchProj = pid => { setActiveId(pid); save({ ...data, activeId: pid }); setExpWeeks({}); setFOwner("all"); setFStatus("all"); setFTag("all"); setSearch(""); };

  const addMember = () => up(p => { p.team.push({ id: uid(), name: "New Member", role: "Role", color: `hsl(${Math.random() * 360 | 0},70%,65%)` }); return p; });
  const delMember = mid => up(p => { p.team = p.team.filter(m => m.id !== mid); return p; });
  const upMember = (mid, u) => up(p => { p.team = p.team.map(m => m.id === mid ? { ...m, ...u } : m); return p; });

  const addTag = () => up(p => { p.tags.push({ id: uid(), name: "New Tag", color: `hsl(${Math.random() * 360 | 0},70%,65%)` }); return p; });
  const delTag = tid => up(p => { p.tags = p.tags.filter(t => t.id !== tid); return p; });
  const upTag = (tid, u) => up(p => { p.tags = p.tags.map(t => t.id === tid ? { ...t, ...u } : t); return p; });

  const toggleAllWeeks = () => { if (!proj) return; const next = !allExp; setAllExp(next); const o = {}; proj.weeks.forEach(w => { o[w.id] = next; }); setExpWeeks(o); };

  // CSV
  const exportCSV = () => {
    if (!proj) return;
    const rows = [["Week", "Dates", "Task", "Owner", "Status", "Priority", "Tags", "Details"]];
    proj.weeks.forEach(w => w.tasks.forEach(t => {
      rows.push([`Week ${w.num}`, w.dates, t.title, getMember(t.owner)?.name || "", STATUSES[t.status]?.label || "", PRIOS[t.priority]?.label || "", (t.tags || []).map(id => getTag(id)?.name || "").join("; "), t.details || ""]);
    }));
    const c = rows.map(r => r.map(v => `"${(v || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([c], { type: "text/csv" }); const url = URL.createObjectURL(blob);
    Object.assign(document.createElement("a"), { href: url, download: `${proj.name.replace(/\s+/g, "_")}.csv` }).click();
    URL.revokeObjectURL(url);
  };

  // AI Parser
  const parseAI = async () => {
    if (!aiText.trim() || !proj) return; setAiLoading(true);
    try {
      const body = { model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: `Parse this into a task. Team: ${proj.team.map(m => `${m.name}(${m.id})`).join(",")}. Tags: ${proj.tags.map(t => `${t.name}(${t.id})`).join(",")}. Priorities: none,low,medium,high,urgent. Respond with ONLY JSON: {"title":"","owner":"id_or_empty","priority":"","tags":["id"],"details":""}\n\n${aiText}` }] };
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await res.json();
      const txt = (d.content || []).find(b => b.type === "text")?.text || "";
      const parsed = JSON.parse(txt.replace(/```json|```/g, "").trim());
      setAiResult({ title: parsed.title || aiText, owner: parsed.owner || "", priority: parsed.priority || "none", tags: parsed.tags || [], details: parsed.details || "" });
    } catch { setAiResult({ title: aiText, owner: "", priority: "none", tags: [], details: "Could not auto-parse. Edit manually." }); }
    setAiLoading(false);
  };

  const confirmAI = () => {
    if (!aiResult || !proj) return;
    const wid = aiWeek || proj.weeks[0]?.id; if (!wid) return;
    up(p => { p.weeks = p.weeks.map(w => w.id === wid ? { ...w, tasks: [...w.tasks, { id: uid(), status: "todo", ...aiResult }] } : w); return p; });
    setShowAI(false); setAiText(""); setAiResult(null); setAiWeek("");
  };

  // ── Drag state ──
  const [drag, setDrag] = useState(null);

  // ── RENDER ──
  if (!loaded) return <div style={{ background: "#08080e", color: "#555", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>Loading...</div>;

  if (!proj) return <div style={{ background: "#08080e", color: "#555", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
    <button onClick={addProject} style={css.btn}>Create Project</button>
  </div>;

  return (
    <div style={{ fontFamily: "'Outfit',sans-serif", background: "#08080e", color: "#f0f0f0", height: "100vh", display: "flex", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#222;border-radius:3px}select option{background:#111;color:#ccc}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* ═══ SIDEBAR ═══ */}
      {sidebar && <div style={{ width: 240, minWidth: 240, background: "#0A0A10", borderRight: "1px solid #161622", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Search */}
        <div style={{ padding: "12px 10px 6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#111118", borderRadius: 7, padding: "6px 8px", border: "1px solid #1e1e30" }}>
            <span style={{ color: "#444", fontSize: 12 }}>⌕</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." style={{ background: "transparent", border: "none", color: "#ccc", fontSize: 11, flex: 1, outline: "none", fontFamily: "inherit" }} />
            {search && <span onClick={() => setSearch("")} style={{ color: "#444", cursor: "pointer", fontSize: 10 }}>✕</span>}
          </div>
        </div>

        {/* Projects */}
        <div style={{ padding: "4px 10px 8px", borderBottom: "1px solid #161622" }}>
          <div style={{ fontSize: 9, color: "#444", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 5 }}>Projects</div>
          {data.projects.map(p => (
            <div key={p.id} onClick={() => switchProj(p.id)} style={{ padding: "6px 8px", borderRadius: 6, marginBottom: 2, cursor: "pointer", background: p.id === activeId ? "#161622" : "transparent" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: p.id === activeId ? "#eee" : "#666" }}>{p.name}</div>
            </div>
          ))}
          <button onClick={addProject} style={{ ...css.btnSm, width: "100%", justifyContent: "center", marginTop: 3, fontSize: 9 }}>+ New Project</button>
        </div>

        {/* Filters */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px" }}>
          {/* Owner filter */}
          <div style={{ fontSize: 9, color: "#444", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Owner</div>
          {[{ id: "all", name: "All", color: "#888" }, ...proj.team].map(m => {
            const active = fOwner === m.id;
            const s = m.id !== "all" ? memStats(m.id) : null;
            return <div key={m.id} onClick={() => setFOwner(m.id)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 8px", borderRadius: 5, marginBottom: 1, cursor: "pointer", fontSize: 10, background: active ? m.color + "12" : "transparent", color: active ? m.color : "#555", fontWeight: active ? 600 : 400 }}>
              {m.id !== "all" && <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.color }} />}
              <span style={{ flex: 1 }}>{m.name}</span>
              {s && <span style={{ fontSize: 8, opacity: 0.7 }}>{s.d}/{s.t}</span>}
            </div>;
          })}

          {/* Status filter */}
          <div style={{ fontSize: 9, color: "#444", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4, marginTop: 12 }}>Status</div>
          {[{ k: "all", label: "All", color: "#888" }, ...Object.entries(STATUSES).map(([k, v]) => ({ k, label: v.label, color: v.color }))].map(s => {
            const active = fStatus === s.k;
            const cnt = s.k !== "all" ? allTasks.filter(t => t.status === s.k).length : allTasks.length;
            return <div key={s.k} onClick={() => setFStatus(s.k)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 8px", borderRadius: 5, marginBottom: 1, cursor: "pointer", fontSize: 10, background: active ? s.color + "12" : "transparent", color: active ? s.color : "#555", fontWeight: active ? 600 : 400 }}>
              {s.k !== "all" && <span style={{ width: 6, height: 6, borderRadius: 2, background: s.color }} />}
              <span style={{ flex: 1 }}>{s.label}</span>
              <span style={{ fontSize: 8, opacity: 0.7 }}>{cnt}</span>
            </div>;
          })}

          {/* Tag filter */}
          <div style={{ fontSize: 9, color: "#444", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4, marginTop: 12 }}>Tags</div>
          <div onClick={() => setFTag("all")} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 8px", borderRadius: 5, marginBottom: 1, cursor: "pointer", fontSize: 10, background: fTag === "all" ? "#88888812" : "transparent", color: fTag === "all" ? "#888" : "#555" }}>All Tags</div>
          {(proj.tags || []).map(tg => {
            const active = fTag === tg.id;
            const s = tagPct(tg.id);
            return <div key={tg.id} onClick={() => setFTag(tg.id)} style={{ padding: "4px 8px", borderRadius: 5, marginBottom: 1, cursor: "pointer", fontSize: 10, background: active ? tg.color + "12" : "transparent", color: active ? tg.color : "#555", fontWeight: active ? 600 : 400 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: 2, background: tg.color }} />
                <span style={{ flex: 1 }}>{tg.name}</span>
                <span style={{ fontSize: 8, opacity: 0.7 }}>{s.d}/{s.t}</span>
              </div>
              <ProgressBar value={s.p} color={tg.color} h={2} style={{ marginTop: 3 }} />
            </div>;
          })}
        </div>
      </div>}

      {/* ═══ MAIN AREA ═══ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{ padding: "10px 14px", borderBottom: "1px solid #161622", display: "flex", alignItems: "center", gap: 8, background: "#0A0A10", flexWrap: "wrap" }}>
          <button onClick={() => setSidebar(!sidebar)} style={css.btnIc}>{sidebar ? "◁" : "▷"}</button>
          <div style={{ flex: 1, minWidth: 100 }}>
            <InlineEdit value={proj.name} onChange={v => up(p => { p.name = v; return p; })} style={{ fontSize: 15, fontWeight: 800, color: "#f0f0f0" }} />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: pctAll >= 100 ? "#4ADE80" : "#818CF8" }}>{pctAll}%</span>
          <ProgressBar value={pctAll} h={5} style={{ width: 50 }} />
          <span style={{ fontSize: 9, color: "#555" }}>{doneCount}/{allTasks.length}</span>
          <div style={{ display: "flex", gap: 2, background: "#111118", borderRadius: 6, padding: 2 }}>
            {["timeline", "board", "team"].map(v => (
              <button key={v} onClick={() => setView(v)} style={{ ...css.btnSm, background: view === v ? "#1E1E2E" : "transparent", color: view === v ? "#eee" : "#555", border: view === v ? "1px solid #2a2a40" : "1px solid transparent", textTransform: "capitalize" }}>{v}</button>
            ))}
          </div>
          <button onClick={toggleAllWeeks} style={css.btnSm} title="Collapse/Expand All">{allExp ? "⊟" : "⊞"}</button>
          <button onClick={() => setShowAI(true)} style={{ ...css.btnSm, color: "#C084FC", borderColor: "#C084FC44" }}>✦ AI</button>
          <button onClick={() => { setShowSettings(true); setSettingsTab("general"); }} style={css.btnIc}>⚙</button>
          <button onClick={exportCSV} style={css.btnSm}>↓ CSV</button>
          <button onClick={manualSync} style={{ ...css.btnSm, color: syncing ? "#4ADE80" : "#777" }} title="Sync with team">
            <span style={{ display: "inline-block", animation: syncing ? "spin 0.6s linear infinite" : "none" }}>↻</span> Sync
          </button>
          <span style={{ background: isLiveSync() ? "#4ADE8018" : "#FBBF2418", color: isLiveSync() ? "#4ADE80" : "#FBBF24", fontSize: 8, fontWeight: 700, padding: "3px 7px", borderRadius: 4, border: `1px solid ${isLiveSync() ? "#4ADE8033" : "#FBBF2433"}` }}>{isLiveSync() ? "LIVE SYNC" : "LOCAL"}</span>
          {lastSync && <span style={{ fontSize: 8, color: "#333" }}>{lastSync.toLocaleTimeString()}</span>}
        </div>

        {/* Sparkline */}
        <div style={{ padding: "6px 14px", borderBottom: "1px solid #161622", display: "flex", gap: 3, background: "#08080e" }}>
          {proj.weeks.map(w => { const wp = wPct(w); return <div key={w.id} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ height: 20, background: "#111118", borderRadius: 3, overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <div style={{ background: wp.p >= 100 ? "#4ADE80" : wp.p > 0 ? "#818CF8" : "#1a1a28", height: `${Math.max(wp.p, 5)}%`, transition: "height 0.3s" }} />
            </div>
            <div style={{ fontSize: 7, color: "#444", marginTop: 1 }}>W{w.num}</div>
          </div>; })}
        </div>

        {/* CONTENT */}
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px" }}>

          {/* ─── TIMELINE VIEW ─── */}
          {view === "timeline" && <div>
            {proj.weeks.map((w, wIdx) => {
              const wp = wPct(w);
              const exp = !!expWeeks[w.id];
              const vis = w.tasks.filter(matchTask);
              return (
                <div key={w.id} draggable onDragStart={() => setDrag({ type: "week", idx: wIdx })} onDragOver={e => e.preventDefault()} onDrop={() => { if (drag?.type === "week") moveWeek(drag.idx, wIdx); setDrag(null); }}
                  style={{ background: "#0D0D15", border: `1px solid ${wp.p >= 100 ? "#4ADE8030" : "#161622"}`, borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
                  <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => setExpWeeks(prev => ({ ...prev, [w.id]: !prev[w.id] }))}>
                    <span style={{ cursor: "grab", color: "#222", fontSize: 11 }} onMouseDown={e => e.stopPropagation()}>⠿</span>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: wp.p >= 100 ? "#4ADE80" : "#818CF8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: wp.p >= 100 ? "#000" : "#fff", fontSize: 12, flexShrink: 0 }}>{wp.p >= 100 ? "✓" : w.num}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: 12, color: "#eee" }}>Week {w.num}</span>
                        <span style={{ fontSize: 10, color: "#444" }}>{w.dates}</span>
                        <span style={{ marginLeft: "auto", fontSize: 9, color: wp.p >= 100 ? "#4ADE80" : "#555", fontWeight: 700 }}>{wp.p}% · {wp.d}/{wp.t}</span>
                      </div>
                      <div style={{ color: "#555", fontSize: 10, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{w.objective}</div>
                      <ProgressBar value={wp.p} h={2} style={{ marginTop: 4 }} />
                    </div>
                    <span style={{ color: "#333", fontSize: 12, transform: exp ? "rotate(180deg)" : "", transition: "transform 0.2s" }}>▾</span>
                  </div>
                  {exp && <div style={{ padding: "0 12px 10px", borderTop: "1px solid #161622" }}>
                    <div style={{ display: "flex", gap: 10, margin: "8px 0" }}>
                      <div style={{ flex: 1 }}><div style={css.lbl}>Objective</div><InlineEdit value={w.objective} onChange={v => upWeek(w.id, { objective: v })} style={{ fontSize: 11, color: "#aaa" }} /></div>
                      <div><div style={css.lbl}>Dates</div><InlineEdit value={w.dates} onChange={v => upWeek(w.id, { dates: v })} style={{ fontSize: 11, color: "#aaa" }} /></div>
                    </div>
                    {vis.length === 0 && <div style={{ color: "#333", fontSize: 11, padding: "4px 0" }}>No matching tasks</div>}
                    {vis.map(t => {
                      const st = STATUSES[t.status] || STATUSES.todo;
                      const pr = PRIOS[t.priority] || PRIOS.none;
                      const mem = getMember(t.owner);
                      const rIdx = w.tasks.indexOf(t);
                      return (
                        <div key={t.id} draggable onDragStart={e => { e.stopPropagation(); setDrag({ type: "task", wid: w.id, idx: rIdx }); }} onDragOver={e => e.preventDefault()} onDrop={e => { e.stopPropagation(); if (drag?.type === "task" && drag.wid === w.id) moveTask(w.id, drag.idx, rIdx); setDrag(null); }}
                          style={{ display: "flex", alignItems: "flex-start", gap: 7, padding: "7px 6px", borderRadius: 6, marginBottom: 3, background: "#0A0A12", border: "1px solid #12121a" }}>
                          <span style={{ cursor: "grab", color: "#222", fontSize: 9, marginTop: 3 }}>⠿</span>
                          <div onClick={() => cycleStatus(w.id, t.id, t.status)} style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${st.color}`, background: t.status === "done" ? st.color : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                            {t.status === "done" && <span style={{ color: "#000", fontSize: 9, fontWeight: 800 }}>✓</span>}
                            {t.status === "progress" && <span style={{ color: st.color, fontSize: 6 }}>●</span>}
                            {t.status === "blocked" && <span style={{ color: st.color, fontSize: 8, fontWeight: 800 }}>!</span>}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: t.status === "done" ? "#444" : "#ddd", textDecoration: t.status === "done" ? "line-through" : "none" }}>{t.title}</div>
                            {t.details && <div style={{ fontSize: 9, color: "#444", marginTop: 1 }}>{t.details}</div>}
                            <div style={{ display: "flex", gap: 3, marginTop: 4, flexWrap: "wrap" }}>
                              {mem && <span onClick={e => { e.stopPropagation(); setMemberPanel(mem.id); }} style={{ fontSize: 8, padding: "2px 6px", borderRadius: 3, background: mem.color + "15", color: mem.color, fontWeight: 600, cursor: "pointer" }}>{mem.name}</span>}
                              {pr.color !== "#555" && <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 3, background: pr.color + "15", color: pr.color }}>{pr.label}</span>}
                              {(t.tags || []).map(id => { const tg = getTag(id); return tg ? <span key={id} style={{ fontSize: 8, padding: "2px 6px", borderRadius: 3, background: tg.color + "15", color: tg.color }}>{tg.name}</span> : null; })}
                            </div>
                          </div>
                          <button onClick={() => setEditTask({ wid: w.id, task: { ...t, tags: [...(t.tags || [])] } })} style={css.btnIc} title="Edit">✎</button>
                          <button onClick={() => dupTask(w.id, t.id)} style={css.btnIc} title="Duplicate">⧉</button>
                          <button onClick={() => delTask(w.id, t.id)} style={{ ...css.btnIc, color: "#F87171" }} title="Delete">✕</button>
                        </div>
                      );
                    })}
                    <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                      <button onClick={() => addTask(w.id)} style={{ ...css.btnSm, flex: 1, justifyContent: "center" }}>+ Task</button>
                      <button onClick={() => dupWeek(w.id)} style={css.btnSm} title="Duplicate week">⧉</button>
                      <button onClick={() => setConfirmDel({ type: "week", id: w.id, label: `Week ${w.num}` })} style={{ ...css.btnSm, color: "#F87171", borderColor: "#F8717122" }}>✕</button>
                    </div>
                  </div>}
                </div>
              );
            })}
            <button onClick={addWeek} style={{ ...css.btnSm, width: "100%", justifyContent: "center", padding: 10 }}>+ Add Week</button>
          </div>}

          {/* ─── BOARD VIEW ─── */}
          {view === "board" && <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center" }}>
              <div style={{ display: "flex", gap: 2, background: "#111118", borderRadius: 6, padding: 2 }}>
                <button onClick={() => setBoardMode("overview")} style={{ ...css.btnSm, background: boardMode === "overview" ? "#1E1E2E" : "transparent", color: boardMode === "overview" ? "#eee" : "#555" }}>Overview</button>
                <button onClick={() => setBoardMode("focus")} style={{ ...css.btnSm, background: boardMode === "focus" ? "#1E1E2E" : "transparent", color: boardMode === "focus" ? "#eee" : "#555" }}>Focus</button>
              </div>
              {boardMode === "focus" && <select value={boardWeek || proj.weeks[0]?.id || ""} onChange={e => setBoardWeek(e.target.value)} style={css.inp}>
                {proj.weeks.map(w => <option key={w.id} value={w.id}>Week {w.num}: {w.dates}</option>)}
              </select>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Object.keys(STATUSES).length}, 1fr)`, gap: 8 }}>
              {Object.entries(STATUSES).map(([sk, sv]) => {
                const items = [];
                proj.weeks.forEach(w => {
                  if (boardMode === "focus" && w.id !== (boardWeek || proj.weeks[0]?.id)) return;
                  w.tasks.forEach(t => { if (t.status === sk && matchTask(t)) items.push({ ...t, wid: w.id, wNum: w.num }); });
                });
                const grouped = {};
                items.forEach(t => { if (!grouped[t.wNum]) grouped[t.wNum] = []; grouped[t.wNum].push(t); });
                return (
                  <div key={sk} style={{ background: "#0C0C14", borderRadius: 8, border: "1px solid #161622", padding: 8 }}
                    onDragOver={e => e.preventDefault()} onDrop={() => { if (drag?.type === "bt") upTask(drag.wid, drag.tid, { status: sk }); setDrag(null); }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8, padding: "0 2px" }}>
                      <span style={{ width: 6, height: 6, borderRadius: 2, background: sv.color }} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: sv.color }}>{sv.label}</span>
                      <span style={{ fontSize: 9, color: "#444", marginLeft: "auto" }}>{items.length}</span>
                    </div>
                    {boardMode === "overview" ? Object.entries(grouped).sort((a, b) => a[0] - b[0]).map(([wn, ts]) => (
                      <div key={wn}>
                        <div style={{ fontSize: 8, color: "#444", padding: "3px 2px", fontWeight: 700 }}>Week {wn}</div>
                        {ts.map(t => { const mem = getMember(t.owner); return (
                          <div key={t.id} draggable onDragStart={() => setDrag({ type: "bt", wid: t.wid, tid: t.id })} style={{ background: "#111118", borderRadius: 6, padding: "7px 8px", marginBottom: 4, cursor: "grab", border: "1px solid #1a1a2822" }}>
                            <div style={{ fontSize: 10, fontWeight: 600, color: "#ccc" }}>{t.title}</div>
                            <div style={{ display: "flex", gap: 3, marginTop: 3 }}>
                              {mem && <span style={{ fontSize: 8, color: mem.color }}>{mem.name}</span>}
                            </div>
                          </div>
                        ); })}
                      </div>
                    )) : items.map(t => { const mem = getMember(t.owner); return (
                      <div key={t.id} draggable onDragStart={() => setDrag({ type: "bt", wid: t.wid, tid: t.id })} style={{ background: "#111118", borderRadius: 6, padding: "7px 8px", marginBottom: 4, cursor: "grab" }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: "#ccc" }}>{t.title}</div>
                        {mem && <div style={{ fontSize: 8, color: mem.color, marginTop: 2 }}>{mem.name}</div>}
                      </div>
                    ); })}
                  </div>
                );
              })}
            </div>
          </div>}

          {/* ─── TEAM VIEW ─── */}
          {view === "team" && <div>
            <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
              {proj.team.map(m => {
                const s = memStats(m.id);
                return (
                  <div key={m.id} onClick={() => setTeamView(m.id)} style={{ background: teamView === m.id ? "#161622" : "#0D0D15", border: `1px solid ${teamView === m.id ? m.color + "44" : "#161622"}`, borderRadius: 10, padding: "10px 14px", cursor: "pointer", minWidth: 120 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: m.color }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: teamView === m.id ? "#eee" : "#777" }}>{m.name}</span>
                    </div>
                    <div style={{ fontSize: 9, color: "#555", marginTop: 2 }}>{m.role}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5 }}>
                      <ProgressBar value={s.p} color={m.color} h={3} style={{ flex: 1 }} />
                      <span style={{ fontSize: 9, fontWeight: 700, color: m.color }}>{s.p}%</span>
                    </div>
                    <div style={{ fontSize: 8, color: "#444", marginTop: 1 }}>{s.d}/{s.t} done</div>
                  </div>
                );
              })}
            </div>
            {teamView && (() => {
              const m = getMember(teamView);
              const s = memStats(teamView);
              if (!m) return null;
              return (
                <div style={{ background: "#0D0D15", border: "1px solid #161622", borderRadius: 12, padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: m.color + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: m.color }}>{m.name[0]}</span>
                    </div>
                    <div><div style={{ fontSize: 14, fontWeight: 700 }}>{m.name}</div><div style={{ fontSize: 10, color: "#666" }}>{m.role}</div></div>
                    <div style={{ marginLeft: "auto", textAlign: "right" }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: m.color }}>{s.p}%</div>
                      <div style={{ fontSize: 9, color: "#555" }}>{s.d}/{s.t} complete</div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                    <div style={{ background: "#0A0A10", borderRadius: 8, padding: 10 }}>
                      <div style={css.lbl}>By Status</div>
                      {Object.entries(STATUSES).map(([k, v]) => (
                        <div key={k} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                          <span style={{ width: 5, height: 5, borderRadius: 1, background: v.color }} />
                          <span style={{ fontSize: 10, color: "#888", flex: 1 }}>{v.label}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: v.color }}>{s.byStatus[k]}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: "#0A0A10", borderRadius: 8, padding: 10 }}>
                      <div style={css.lbl}>By Priority</div>
                      {Object.entries(PRIOS).filter(([k]) => k !== "none").map(([k, v]) => (
                        <div key={k} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: v.color }} />
                          <span style={{ fontSize: 10, color: "#888", flex: 1 }}>{v.label}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: v.color }}>{s.byPrio[k]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={css.lbl}>Tasks ({s.t})</div>
                  {s.tasks.map(t => {
                    const st = STATUSES[t.status]; const w = proj.weeks.find(w => w.tasks.some(wt => wt.id === t.id));
                    return (
                      <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", borderRadius: 6, marginBottom: 2, background: "#0A0A10" }}>
                        <div onClick={() => { if (w) cycleStatus(w.id, t.id, t.status); }} style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${st.color}`, background: t.status === "done" ? st.color : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {t.status === "done" && <span style={{ color: "#000", fontSize: 8, fontWeight: 800 }}>✓</span>}
                        </div>
                        <div style={{ flex: 1, fontSize: 11, color: t.status === "done" ? "#444" : "#ccc", textDecoration: t.status === "done" ? "line-through" : "none" }}>{t.title}</div>
                        <span style={{ fontSize: 8, color: "#444" }}>W{w?.num}</span>
                        <span style={{ fontSize: 8, padding: "1px 5px", borderRadius: 3, background: st.color + "15", color: st.color }}>{st.label}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>}
        </div>
      </div>

      {/* ═══ MEMBER QUICK PANEL ═══ */}
      {memberPanel && (() => {
        const m = getMember(memberPanel); const s = memStats(memberPanel);
        if (!m) return null;
        return (
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 300, background: "#0C0C14", borderLeft: "1px solid #1e1e30", zIndex: 90, padding: 16, overflowY: "auto", boxShadow: "-8px 0 30px #00000044" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{m.name}</span>
              <button onClick={() => setMemberPanel(null)} style={css.btnIc}>✕</button>
            </div>
            <div style={{ fontSize: 10, color: "#666", marginBottom: 8 }}>{m.role}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
              <ProgressBar value={s.p} color={m.color} h={5} style={{ flex: 1 }} />
              <span style={{ fontSize: 14, fontWeight: 800, color: m.color }}>{s.p}%</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4, marginBottom: 12 }}>
              {Object.entries(STATUSES).map(([k, v]) => (
                <div key={k} style={{ textAlign: "center", padding: "6px 2px", background: "#111118", borderRadius: 5 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: v.color }}>{s.byStatus[k]}</div>
                  <div style={{ fontSize: 7, color: "#444" }}>{v.label}</div>
                </div>
              ))}
            </div>
            <div style={css.lbl}>Tasks</div>
            {s.tasks.slice(0, 20).map(t => {
              const st = STATUSES[t.status];
              return <div key={t.id} style={{ padding: "5px 0", borderBottom: "1px solid #12121a" }}>
                <div style={{ fontSize: 10, color: t.status === "done" ? "#444" : "#bbb", textDecoration: t.status === "done" ? "line-through" : "none" }}>{t.title}</div>
                <span style={{ fontSize: 8, color: st.color }}>{st.label}</span>
              </div>;
            })}
          </div>
        );
      })()}

      {/* ═══ EDIT TASK MODAL ═══ */}
      {editTask && (() => {
        const t = editTask.task;
        const set = (k, v) => setEditTask({ ...editTask, task: { ...t, [k]: v } });
        return (
          <Modal title="Edit Task" onClose={() => setEditTask(null)} onSave={() => { upTask(editTask.wid, t.id, t); setEditTask(null); }}>
            <div style={css.lbl}>Title</div>
            <input value={t.title} onChange={e => set("title", e.target.value)} style={css.inp} />
            <div style={css.lbl}>Details</div>
            <textarea value={t.details || ""} onChange={e => set("details", e.target.value)} rows={3} style={{ ...css.inp, resize: "vertical" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div><div style={css.lbl}>Owner</div><select value={t.owner} onChange={e => set("owner", e.target.value)} style={css.inp}><option value="">Unassigned</option>{proj.team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
              <div><div style={css.lbl}>Status</div><select value={t.status} onChange={e => set("status", e.target.value)} style={css.inp}>{Object.entries(STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div><div style={css.lbl}>Priority</div><select value={t.priority} onChange={e => set("priority", e.target.value)} style={css.inp}>{Object.entries(PRIOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
              <div><div style={css.lbl}>Tags</div><div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                {proj.tags.map(tg => { const on = (t.tags || []).includes(tg.id); return <span key={tg.id} onClick={() => set("tags", on ? t.tags.filter(x => x !== tg.id) : [...(t.tags || []), tg.id])} style={{ fontSize: 9, padding: "3px 7px", borderRadius: 4, cursor: "pointer", background: on ? tg.color + "22" : "#111118", color: on ? tg.color : "#555", border: `1px solid ${on ? tg.color + "44" : "#1e1e30"}` }}>{tg.name}</span>; })}
              </div></div>
            </div>
          </Modal>
        );
      })()}

      {/* ═══ AI TASK CREATOR ═══ */}
      {showAI && <Modal title="✦ AI Task Creator" onClose={() => { setShowAI(false); setAiResult(null); setAiText(""); }}>
        <div style={{ fontSize: 11, color: "#777", marginBottom: 8, lineHeight: 1.5 }}>Type or paste text from Whispr Flow. Claude will parse it into a structured task.</div>
        <textarea value={aiText} onChange={e => setAiText(e.target.value)} placeholder="e.g. Christian needs to set up GHL webhooks by Friday, high priority..." rows={3} style={{ ...css.inp, resize: "vertical" }} />
        <button onClick={parseAI} disabled={aiLoading || !aiText.trim()} style={{ ...css.btn, width: "100%", marginTop: 8, opacity: aiLoading ? 0.5 : 1 }}>{aiLoading ? "Analyzing..." : "Parse with AI"}</button>
        {aiResult && <div style={{ marginTop: 12, background: "#0D0D15", borderRadius: 10, padding: 12, border: "1px solid #1e1e30" }}>
          <div style={css.lbl}>Preview</div>
          <input value={aiResult.title} onChange={e => setAiResult({ ...aiResult, title: e.target.value })} style={{ ...css.inp, marginBottom: 6 }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <select value={aiResult.owner} onChange={e => setAiResult({ ...aiResult, owner: e.target.value })} style={css.inp}><option value="">Unassigned</option>{proj.team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
            <select value={aiResult.priority} onChange={e => setAiResult({ ...aiResult, priority: e.target.value })} style={css.inp}>{Object.entries(PRIOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
          </div>
          <div style={{ display: "flex", gap: 3, flexWrap: "wrap", margin: "6px 0" }}>
            {proj.tags.map(tg => { const on = (aiResult.tags || []).includes(tg.id); return <span key={tg.id} onClick={() => setAiResult({ ...aiResult, tags: on ? aiResult.tags.filter(x => x !== tg.id) : [...(aiResult.tags || []), tg.id] })} style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, cursor: "pointer", background: on ? tg.color + "22" : "#111118", color: on ? tg.color : "#555" }}>{tg.name}</span>; })}
          </div>
          <input value={aiResult.details || ""} onChange={e => setAiResult({ ...aiResult, details: e.target.value })} placeholder="Details..." style={{ ...css.inp, marginBottom: 6 }} />
          <select value={aiWeek || proj.weeks[0]?.id || ""} onChange={e => setAiWeek(e.target.value)} style={{ ...css.inp, marginBottom: 8 }}>
            {proj.weeks.map(w => <option key={w.id} value={w.id}>Week {w.num}: {w.dates}</option>)}
          </select>
          <button onClick={confirmAI} style={{ ...css.btn, width: "100%" }}>Add Task</button>
        </div>}
      </Modal>}

      {/* ═══ SETTINGS ═══ */}
      {showSettings && <Modal title="Settings" onClose={() => setShowSettings(false)} wide>
        <div style={{ display: "flex", gap: 2, marginBottom: 12, background: "#0A0A10", borderRadius: 6, padding: 2 }}>
          {["general", "team", "tags"].map(t => <button key={t} onClick={() => setSettingsTab(t)} style={{ ...css.btnSm, flex: 1, justifyContent: "center", textTransform: "capitalize", background: settingsTab === t ? "#1E1E2E" : "transparent", color: settingsTab === t ? "#eee" : "#555" }}>{t}</button>)}
        </div>
        {settingsTab === "general" && <div>
          <div style={css.lbl}>Project Name</div><input value={proj.name} onChange={e => up(p => { p.name = e.target.value; return p; })} style={css.inp} />
          <div style={css.lbl}>Description</div><input value={proj.desc} onChange={e => up(p => { p.desc = e.target.value; return p; })} style={css.inp} />
          <div style={{ marginTop: 20 }}>
            {confirmDel?.type !== "project" ? <button onClick={() => setConfirmDel({ type: "project", id: proj.id, label: proj.name })} style={{ ...css.btnSm, color: "#F87171", borderColor: "#F8717133", width: "100%", justifyContent: "center" }}>Delete Project</button>
            : <div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 11, color: "#F87171" }}>Delete?</span>
              <button onClick={() => delProject(confirmDel.id)} style={{ ...css.btnSm, background: "#F8717122", color: "#F87171", borderColor: "#F87171" }}>Yes</button>
              <button onClick={() => setConfirmDel(null)} style={css.btnSm}>Cancel</button>
            </div>}
          </div>
        </div>}
        {settingsTab === "team" && <div>
          {proj.team.map(m => <div key={m.id} style={{ display: "flex", gap: 6, alignItems: "center", padding: 8, background: "#0D0D15", borderRadius: 8, marginBottom: 5 }}>
            <input type="color" value={m.color} onChange={e => upMember(m.id, { color: e.target.value })} style={{ width: 26, height: 26, border: "none", background: "none", cursor: "pointer", borderRadius: 4 }} />
            <input value={m.name} onChange={e => upMember(m.id, { name: e.target.value })} placeholder="Name" style={{ ...css.inp, flex: 1 }} />
            <input value={m.role} onChange={e => upMember(m.id, { role: e.target.value })} placeholder="Role" style={{ ...css.inp, flex: 1 }} />
            <button onClick={() => delMember(m.id)} style={{ ...css.btnIc, color: "#F87171" }}>✕</button>
          </div>)}
          <button onClick={addMember} style={{ ...css.btnSm, width: "100%", justifyContent: "center", marginTop: 4 }}>+ Add Member</button>
        </div>}
        {settingsTab === "tags" && <div>
          {proj.tags.map(tg => {
            const s = tagPct(tg.id);
            return <div key={tg.id} style={{ display: "flex", gap: 6, alignItems: "center", padding: 8, background: "#0D0D15", borderRadius: 8, marginBottom: 5 }}>
              <input type="color" value={tg.color} onChange={e => upTag(tg.id, { color: e.target.value })} style={{ width: 26, height: 26, border: "none", background: "none", cursor: "pointer", borderRadius: 4 }} />
              <input value={tg.name} onChange={e => upTag(tg.id, { name: e.target.value })} style={{ ...css.inp, flex: 1 }} />
              <span style={{ fontSize: 9, color: "#555", whiteSpace: "nowrap" }}>{s.d}/{s.t}</span>
              <button onClick={() => delTag(tg.id)} style={{ ...css.btnIc, color: "#F87171" }}>✕</button>
            </div>;
          })}
          <button onClick={addTag} style={{ ...css.btnSm, width: "100%", justifyContent: "center", marginTop: 4 }}>+ Add Tag</button>
        </div>}
      </Modal>}

      {/* ═══ CONFIRM DELETE WEEK ═══ */}
      {confirmDel?.type === "week" && <Modal title="Delete Week" onClose={() => setConfirmDel(null)} onSave={() => { delWeek(confirmDel.id); setConfirmDel(null); }} saveLabel="Delete" saveColor="#F87171">
        <div style={{ color: "#ccc", fontSize: 13 }}>Delete <strong>{confirmDel.label}</strong> and all tasks?</div>
      </Modal>}
    </div>
  );
}
