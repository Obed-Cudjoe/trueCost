"use client"; // Owner-only tracker UI. Key gate → fetch → status board, review actions, CSV export.
import { useEffect, useState } from "react";

type Row = Record<string, string>;
type Tab = "leads" | "partners" | "reports";
const STATUSES = ["new", "contacted", "matched", "closed", "dead"] as const;
const statusKey = (tab: string, id: string) => `tc-status:${tab}:${id}`;

const REPORT_ACTIONS: { id: string; label: string; className: string }[] = [
  { id: "approved", label: "✓ Approve", className: "bg-green-600 text-white" },
  { id: "rejected", label: "✕ Reject", className: "bg-red-600 text-white" },
  { id: "needs_clarification", label: "? Clarify", className: "bg-amber-500 text-ink" },
];

const REPORT_TONE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-900",
  approved: "bg-green-100 text-green-900",
  rejected: "bg-slate-200 text-slate-700",
  needs_clarification: "bg-amber-100 text-amber-900",
};

const waNum = (p: string) => {
  const d = (p || "").replace(/\D/g, "");
  if (d.startsWith("233")) return d;
  if (d.startsWith("0")) return "233" + d.slice(1);
  return d;
};

export default function Tracker() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>("leads");
  const [rows, setRows] = useState<Row[]>([]);
  const [states, setStates] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    const k = sessionStorage.getItem("tc-key");
    if (k) {
      setKey(k);
      void load(tab, k);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load(t: string, k: string) {
    setMsg("Loading…");
    try {
      const endpoint = t === "reports" ? "/api/reports" : `/api/${t}`;
      const res = await fetch(endpoint, { headers: { Authorization: `Bearer ${k}` } });
      if (res.status === 401) {
        setAuthed(false);
        setMsg("Wrong key.");
        return;
      }
      const data = await res.json();
      setRows(data.rows ?? []);
      sessionStorage.setItem("tc-key", k);
      setAuthed(true);
      setMsg((data.rows ?? []).length === 0 ? "No rows yet — submissions will appear here." : "");
    } catch {
      setMsg("Load failed — check connection and retry.");
    }
  }

  async function review(id: string, status: string) {
    setBusyId(id);
    try {
      const res = await fetch("/api/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) {
        setMsg("Could not update that report. Review it again.");
        return;
      }
      setMsg("");
      await load("reports", key);
    } catch {
      setMsg("Update failed — check connection and retry.");
    } finally {
      setBusyId("");
    }
  }

  function statusOf(r: Row) {
    return states[statusKey(tab, String(r.id ?? r.phone ?? r._at))] ?? String(r.status ?? "new");
  }
  function setStatus(r: Row, s: string) {
    const k = statusKey(tab, String(r.id ?? r.phone ?? r._at));
    const next = { ...states, [k]: s };
    setStates(next);
    try {
      localStorage.setItem("tc-statuses", JSON.stringify(next));
    } catch {
      /* private mode */
    }
  }
  useEffect(() => {
    try {
      setStates(JSON.parse(localStorage.getItem("tc-statuses") || "{}"));
    } catch {
      /* empty */
    }
  }, []);

  function csv() {
    if (rows.length === 0) return;
    const cols = Object.keys(rows[0]).filter((c) => c !== "website");
    const q = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const blob = new Blob(
      [[["tracker_status", ...cols].join(","), ...rows.map((r) => [statusOf(r), ...cols.map((c) => q(r[c]))].join(","))].join("\n")],
      { type: "text/csv" },
    );
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
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(tab, key)}
          placeholder="Tracker key"
          className="mt-4 w-full rounded-lg border border-slate-300 px-4 py-2.5"
        />
        <button onClick={() => load(tab, key)} className="btn-primary mt-2 w-full rounded-lg bg-ink px-4 py-2.5 font-bold text-gold">
          Unlock
        </button>
        {msg && <p className="mt-2 text-sm text-red-600">{msg}</p>}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-ink">
          Lead tracker <span className="text-base font-normal text-slate-500">({rows.length})</span>
        </h1>
        <div className="flex gap-2">
          <button onClick={() => load(tab, key)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold">
            ↻ Refresh
          </button>
          <button onClick={csv} disabled={rows.length === 0} className="rounded-lg bg-ink px-4 py-2 text-sm font-bold text-gold disabled:opacity-50">
            ⬇ CSV
          </button>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        {(
          [
            { id: "leads", label: "🏠 Renters" },
            { id: "partners", label: "🤝 Partners" },
            { id: "reports", label: "📣 Price reports" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id);
              void load(t.id, key);
            }}
            className={`rounded-full px-5 py-2 text-sm font-bold ${tab === t.id ? "bg-ink text-gold" : "border border-slate-300"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {msg && <p className="mt-4 text-sm text-slate-600">{msg}</p>}

      {tab === "reports" && (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          Review queue. A report is <b>pending</b> until you approve it. Approved reports appear on the area page as renter-reported
          observations — never as a verified benchmark — so only approve what you are comfortable showing with the date and basis attached.
        </p>
      )}

      <div className="mt-4 space-y-3">
        {rows.map((r, i) => {
          const id = String(r.id ?? i);
          if (tab === "reports") {
            const status = String(r.status ?? "pending");
            return (
              <article key={id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-ink">
                    {String(r.room_type ?? "—")} · 📍 {String(r.area_slug ?? "")}
                  </p>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${REPORT_TONE[status] ?? "bg-slate-200 text-slate-700"}`}>
                    {status.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  💰 GH₵{String(r.observed_rent ?? "")} per month · seen {String(r.observed_on ?? "").slice(0, 10)} · basis{" "}
                  {String(r.basis ?? "unknown")}
                </p>
                {r.source_context ? <p className="mt-1 text-xs text-slate-500">Context: {String(r.source_context).slice(0, 200)}</p> : null}
                {r.contact ? <p className="mt-1 text-xs text-slate-500">Contact (private): {String(r.contact)}</p> : null}
                {r.review_note ? <p className="mt-1 text-xs text-slate-500">Note: {String(r.review_note).slice(0, 200)}</p> : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  {REPORT_ACTIONS.map((action) => (
                    <button
                      key={action.id}
                      type="button"
                      disabled={busyId === id || status === action.id}
                      onClick={() => review(id, action.id)}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold disabled:opacity-40 ${action.className}`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Submitted {String(r.created_at ?? r._at ?? "").slice(0, 16).replace("T", " ")}
                  {r.reviewed_at ? ` · reviewed ${String(r.reviewed_at).slice(0, 10)}` : ""}
                </p>
              </article>
            );
          }
          return (
            <article key={id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-bold text-ink">
                  {String(r.name ?? "—")} <span className="font-normal text-slate-500">· {String(r.phone ?? "")}</span>
                </p>
                <select
                  value={statusOf(r)}
                  onChange={(e) => setStatus(r, e.target.value)}
                  className="rounded-full border border-slate-300 px-3 py-1 text-xs font-bold"
                  aria-label="Lead status"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                {tab === "leads" ? (
                  <>
                    📍 {String(r.area_slug ?? "")} · 💰 {String(r.budget_range ?? "")}
                  </>
                ) : (
                  <>
                    🏷️ {String(r.role ?? "agent")} · 📍 {String(r.area_slug ?? "")} · 🏠 {String(r.property_type ?? "")}
                    {r.price ? <> · {String(r.price)}</> : null}
                  </>
                )}
              </p>
              {tab === "partners" && r.description ? <p className="mt-1 text-xs text-slate-500">{String(r.description).slice(0, 160)}</p> : null}
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <a
                  className="rounded-full bg-[#25D366] px-3 py-1.5 font-bold text-ink"
                  target="_blank"
                  rel="noreferrer"
                  href={`https://wa.me/${waNum(String(r.phone ?? ""))}?text=${encodeURIComponent(`Hi ${String(r.name ?? "").split(" ")[0] || "there"} — this is TrueCost. `)}`}
                >
                  WhatsApp →
                </a>
                <a className="rounded-full border border-slate-300 px-3 py-1.5 font-bold" href={`tel:${String(r.phone ?? "")}`}>
                  Call
                </a>
                <span className="px-1 py-1.5 text-slate-400">{String(r.created_at ?? r._at ?? "").slice(0, 16).replace("T", " ")}</span>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
