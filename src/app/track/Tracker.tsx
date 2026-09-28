"use client"; // Owner-only tracker UI. Key gate → fetch → status board + CSV export.
import { useEffect, useState } from "react";

type Row = Record<string, string>;
const STATUSES = ["new", "contacted", "matched", "closed", "dead"] as const;
const statusKey = (tab: string, id: string) => `tc-status:${tab}:${id}`;

const waNum = (p: string) => {
  const d = (p || "").replace(/\D/g, "");
  if (d.startsWith("233")) return d;
  if (d.startsWith("0")) return "233" + d.slice(1);
  return d;
};

export default function Tracker() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<"leads" | "partners">("leads");
  const [rows, setRows] = useState<Row[]>([]);
  const [states, setStates] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const k = sessionStorage.getItem("tc-key");
    if (k) { setKey(k); void load(tab, k); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load(t: string, k: string) {
    setMsg("Loading…");
    try {
      const res = await fetch(`/api/${t}`, { headers: { Authorization: `Bearer ${k}` } });
      if (res.status === 401) { setAuthed(false); setMsg("Wrong key."); return; }
      const data = await res.json();
      setRows(data.rows ?? []);
      sessionStorage.setItem("tc-key", k);
      setAuthed(true);
      setMsg((data.rows ?? []).length === 0 ? "No rows yet — submissions will appear here." : "");
    } catch {
      setMsg("Load failed — check connection and retry.");
    }
  }

  function statusOf(r: Row) {
    return states[statusKey(tab, String(r.id ?? r.phone ?? r._at))] ?? String(r.status ?? "new");
  }
  function setStatus(r: Row, s: string) {
    const k = statusKey(tab, String(r.id ?? r.phone ?? r._at));
    const next = { ...states, [k]: s };
    setStates(next);
    try { localStorage.setItem("tc-statuses", JSON.stringify(next)); } catch { /* private mode */ }
  }
  useEffect(() => {
    try { setStates(JSON.parse(localStorage.getItem("tc-statuses") || "{}")); } catch { /* empty */ }
  }, []);

  function csv() {
    if (rows.length === 0) return;
    const cols = Object.keys(rows[0]).filter((c) => c !== "website");
    const q = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const blob = new Blob([[["tracker_status", ...cols].join(","), ...rows.map((r) => [statusOf(r), ...cols.map((c) => q(r[c]))].join(","))].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `truecost-${tab}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-sm py-16 text-center">
        <h1 className="font-display text-3xl text-ink">🔒 Owner access</h1>
        <p className="mt-2 text-sm text-slate-600">Enter your tracker key (set the tracker access secret in Netlify).</p>
        <input type="password" value={key} onChange={(e) => setKey(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load(tab, key)}
          placeholder="Tracker key" className="mt-4 w-full rounded-lg border border-slate-300 px-4 py-2.5" />
        <button onClick={() => load(tab, key)} className="btn-primary mt-2 w-full rounded-lg bg-ink px-4 py-2.5 font-bold text-gold">Unlock</button>
        {msg && <p className="mt-2 text-sm text-red-600">{msg}</p>}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-ink">Lead tracker <span className="text-base font-normal text-slate-500">({rows.length})</span></h1>
        <div className="flex gap-2">
          <button onClick={() => load(tab, key)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold">↻ Refresh</button>
          <button onClick={csv} disabled={rows.length === 0} className="rounded-lg bg-ink px-4 py-2 text-sm font-bold text-gold disabled:opacity-50">⬇ CSV</button>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        {(["leads", "partners"] as const).map((t) => (
          <button key={t} onClick={() => { setTab(t); void load(t, key); }}
            className={`rounded-full px-5 py-2 text-sm font-bold capitalize ${tab === t ? "bg-ink text-gold" : "border border-slate-300"}`}>
            {t === "leads" ? "🏠 Renters" : "🤝 Partners"}
          </button>
        ))}
      </div>
      {msg && <p className="mt-4 text-sm text-slate-600">{msg}</p>}
      <div className="mt-4 space-y-3">
        {rows.map((r, i) => (
          <article key={String(r.id ?? i)} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-bold text-ink">{String(r.name ?? "—")} <span className="font-normal text-slate-500">· {String(r.phone ?? "")}</span></p>
              <select value={statusOf(r)} onChange={(e) => setStatus(r, e.target.value)}
                className="rounded-full border border-slate-300 px-3 py-1 text-xs font-bold" aria-label="Lead status">
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              {tab === "leads"
                ? <>📍 {String(r.area_slug ?? "")} · 💰 {String(r.budget_range ?? "")}</>
                : <>🏷️ {String(r.role ?? "agent")} · 📍 {String(r.area_slug ?? "")} · 🏠 {String(r.property_type ?? "")}{r.price ? <> · {String(r.price)}</> : null}</>}
            </p>
            {tab === "partners" && r.description ? <p className="mt-1 text-xs text-slate-500">{String(r.description).slice(0, 160)}</p> : null}
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <a className="rounded-full bg-[#25D366] px-3 py-1.5 font-bold text-ink" target="_blank" rel="noreferrer"
                href={`https://wa.me/${waNum(String(r.phone ?? ""))}?text=${encodeURIComponent(`Hi ${String(r.name ?? "").split(" ")[0] || "there"} — this is TrueCost. `)}`}>WhatsApp →</a>
              <a className="rounded-full border border-slate-300 px-3 py-1.5 font-bold" href={`tel:${String(r.phone ?? "")}`}>Call</a>
              <span className="px-1 py-1.5 text-slate-400">{String(r.created_at ?? r._at ?? "").slice(0, 16).replace("T", " ")}</span>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
