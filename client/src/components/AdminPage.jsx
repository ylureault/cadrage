import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, ChevronDown, Download, LogOut, RefreshCw, Search } from 'lucide-react';
import Logo from './brand/Logo.jsx';
import { EVENT_TYPES } from '../planning/constants.js';
import { downloadFile } from '../planning/utils.js';

const BASE = import.meta.env.DEV ? 'http://localhost:3001' : '';
const TOKEN_KEY = 'insuffle-admin-token';
const TYPE_LABEL = Object.fromEntries(EVENT_TYPES.map(t => [t.key, t.label]));

// Dates SQLite en UTC (« 2026-09-27 09:12:00 »)
const parse = (s) => (s ? new Date(`${s.replace(' ', 'T')}${s.length <= 10 ? 'T12:00:00' : 'Z'}`) : null);
function relative(s) {
  const d = parse(s);
  if (!d || Number.isNaN(d.getTime())) return '';
  const min = Math.round((Date.now() - d.getTime()) / 60000);
  if (min < 2) return 'à l\'instant';
  if (min < 60) return `il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.round(h / 24);
  if (j < 31) return `il y a ${j} j`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}
const fmtDate = (s) => { const d = parse(s); return d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : ''; };

const csvCell = (v) => { let t = String(v ?? ''); if (/^[=+\-@\t\r]/.test(t)) t = `'${t}`; return `"${t.replace(/"/g, '""')}"`; };

export default function AdminPage() {
  const [token, setToken] = useState(() => { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; } });
  const [draft, setDraft] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [demos, setDemos] = useState(false);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    const m = document.createElement('meta');
    m.name = 'robots'; m.content = 'noindex, nofollow';
    document.head.appendChild(m);
    document.title = 'Qui utilise l\'outil | Insuffle Cadrage';
    return () => m.remove();
  }, []);

  async function load(t = token) {
    if (!t) return;
    setLoading(true); setError('');
    try {
      const res = await fetch(`${BASE}/api/admin/usage`, { headers: { Authorization: `Bearer ${t}` } });
      if (res.status === 401) throw new Error('Jeton refusé.');
      if (res.status === 404) throw new Error('Vue désactivée : définissez ADMIN_TOKEN sur le serveur, puis redémarrez-le.');
      if (!res.ok) throw new Error('Serveur indisponible.');
      setData(await res.json());
      try { localStorage.setItem(TOKEN_KEY, t); } catch { /* stockage indisponible */ }
      setToken(t);
    } catch (e) {
      setError(e.message); setData(null);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const rows = useMemo(() => {
    if (!data) return [];
    const s = q.trim().toLowerCase();
    return data.spaces.filter(r => (demos || !r.demo) && (!s || [r.client, r.sponsor, r.facilitator, r.id, ...r.members.map(m => m.pseudo)].some(v => String(v || '').toLowerCase().includes(s))));
  }, [data, q, demos]);

  function logout() { try { localStorage.removeItem(TOKEN_KEY); } catch { /* stockage indisponible */ } setToken(''); setData(null); }

  function exportCsv() {
    const head = ['Cadrage', 'Sponsor', 'Facilitateur', 'Type', 'Séance', 'Créé', 'Dernière activité', 'Personnes', 'Pseudos', 'Séquences', 'Jours', 'Votes', 'Démo', 'Lien'];
    const lines = [head.map(csvCell).join(';')];
    for (const r of rows) lines.push([r.client, r.sponsor, r.facilitator, TYPE_LABEL[r.event_type] || r.event_type, r.session_date, r.created_at, r.last_activity, r.participants, r.members.map(m => m.pseudo).join(', '), r.sequences, r.days, r.votes, r.demo ? 'oui' : '', `${window.location.origin}/${r.id}`].map(csvCell).join(';'));
    downloadFile(`utilisateurs-cadrage-${new Date().toISOString().slice(0, 10)}.csv`, '﻿' + lines.join('\n'), 'text/csv;charset=utf-8');
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text)' }}>
      <header className="px-4 md:px-8 h-14 flex items-center gap-3" style={{ backgroundColor: '#141E37' }}>
        <a href="/" aria-label="Accueil"><Logo height={22} color="#F2C245" /></a>
        <span className="text-white/40">|</span>
        <span className="text-white font-semibold text-body-sm">Qui utilise l'outil</span>
        <span className="flex-1" />
        {data && (
          <>
            <button type="button" onClick={() => load()} className="text-white/70 hover:text-white p-2" aria-label="Actualiser"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></button>
            <button type="button" onClick={logout} className="text-white/70 hover:text-white p-2" aria-label="Se déconnecter"><LogOut size={16} /></button>
          </>
        )}
      </header>

      {!data ? (
        <form className="max-w-sm mx-auto mt-24 px-4" onSubmit={(e) => { e.preventDefault(); load(draft.trim()); }}>
          <h1 className="font-display font-bold text-[22px] mb-2">Accès exploitant</h1>
          <p className="text-body-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>Saisissez la valeur d'ADMIN_TOKEN définie sur le serveur.</p>
          <input type="password" className="input-field w-full mb-3" value={draft} onChange={e => setDraft(e.target.value)} placeholder="Jeton" autoFocus autoComplete="current-password" />
          {error && <p className="text-caption mb-3" role="alert" style={{ color: 'var(--color-danger, #DC2626)' }}>{error}</p>}
          <button type="submit" className="btn-primary w-full justify-center" disabled={loading || !draft.trim()}>{loading ? 'Vérification…' : 'Entrer'}</button>
        </form>
      ) : (
        <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 grid gap-6">
          <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3" aria-label="Chiffres clés">
            <Tile label="Cadrages" value={data.totals.cadrages} />
            <Tile label="Créés, 7 jours" value={data.totals.crees_7j} />
            <Tile label="Créés, 30 jours" value={data.totals.crees_30j} />
            <Tile label="Actifs, 7 jours" value={data.totals.actifs_7j} />
            <Tile label="Actifs, 30 jours" value={data.totals.actifs_30j} />
            <Tile label="Personnes (pseudos)" value={data.totals.personnes} />
            <Tile label="Avec un déroulé" value={data.totals.conçus} />
            <Tile label="Démos ouvertes" value={data.totals.demos} />
          </section>

          <section className="grid lg:grid-cols-[2fr_1fr] gap-4">
            <Weeks weeks={data.weeks} />
            <div className="rounded-card p-4" style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-1)' }}>
              <h2 className="font-display font-semibold text-body-sm mb-3">Par type de temps</h2>
              <div className="grid gap-2">
                {Object.entries(data.by_type).sort((a, b) => b[1] - a[1]).map(([k, n]) => (
                  <div key={k} className="flex items-center gap-2 text-caption">
                    <span className="w-36 truncate">{TYPE_LABEL[k] || k}</span>
                    <span className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
                      <span className="block h-full rounded-full" style={{ width: `${(n / Math.max(1, data.totals.cadrages)) * 100}%`, backgroundColor: '#141E37' }} />
                    </span>
                    <span className="w-6 text-right font-semibold tabular-nums">{n}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-card overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-1)' }}>
            <div className="flex flex-wrap items-center gap-3 p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h2 className="font-display font-semibold text-body-sm mr-auto">{rows.length} cadrage{rows.length > 1 ? 's' : ''}</h2>
              <label className="flex items-center gap-2 text-caption"><input type="checkbox" checked={demos} onChange={e => setDemos(e.target.checked)} /> Inclure les copies de démo</label>
              <span className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-40" />
                <input className="input-field !pl-8 w-56" value={q} onChange={e => setQ(e.target.value)} placeholder="Client, facilitateur, pseudo" aria-label="Rechercher" />
              </span>
              <button type="button" onClick={exportCsv} className="btn-ghost text-body-sm flex items-center gap-1.5" style={{ border: '1px solid var(--color-border)' }}><Download size={15} /> CSV</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-caption">
                <thead>
                  <tr className="text-left" style={{ color: 'var(--color-text-muted)' }}>
                    {['Cadrage', 'Facilitateur', 'Type', 'Séance', 'Créé', 'Dernière activité', 'Personnes', 'Contenu', ''].map(h => <th key={h} className="px-4 py-2.5 font-semibold whitespace-nowrap">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <Row key={r.id} r={r} open={open === r.id} onToggle={() => setOpen(open === r.id ? null : r.id)} />
                  ))}
                  {!rows.length && <tr><td colSpan={9} className="px-4 py-10 text-center" style={{ color: 'var(--color-text-muted)' }}>Aucun cadrage pour l'instant.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
          <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>
            Ce que les gens ont saisi : nom du client, du facilitateur, pseudos. Pas d'e-mail, pas de compte. Pour l'audience anonyme (pages, sources, clics), voir Google Analytics.
          </p>
        </main>
      )}
    </div>
  );
}

function Tile({ label, value }) {
  return (
    <div className="rounded-card p-4" style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-1)' }}>
      <p className="font-display font-bold text-[26px] leading-none tabular-nums">{value}</p>
      <p className="text-caption mt-1.5" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
    </div>
  );
}

function Weeks({ weeks }) {
  const max = Math.max(1, ...weeks.map(w => w.count));
  const [hover, setHover] = useState(null);
  return (
    <div className="rounded-card p-4" style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-1)' }}>
      <h2 className="font-display font-semibold text-body-sm mb-1">Cadrages créés par semaine</h2>
      <p className="text-caption mb-4" style={{ color: 'var(--color-text-muted)' }}>
        {hover != null ? `Semaine du ${fmtDate(weeks[hover].from)} : ${weeks[hover].count} cadrage${weeks[hover].count > 1 ? 's' : ''}` : '12 dernières semaines, hors démos'}
      </p>
      <div className="flex items-end gap-[2px] h-32" onMouseLeave={() => setHover(null)} role="img" aria-label={weeks.map(w => `${fmtDate(w.from)} : ${w.count}`).join(', ')}>
        {weeks.map((w, i) => (
          <div key={w.from} className="flex-1 h-full flex flex-col justify-end items-center cursor-default" onMouseEnter={() => setHover(i)}>
            {(hover === i || i === weeks.length - 1) && <span className="text-[11px] font-semibold tabular-nums mb-1">{w.count}</span>}
            <span className="w-full max-w-[28px] rounded-t-[4px]" style={{ height: `${Math.max(w.count ? 4 : 1, (w.count / max) * 100)}%`, backgroundColor: hover === i ? '#141E37' : '#F2C245', opacity: w.count ? 1 : 0.35 }} />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[11px] mt-2" style={{ color: 'var(--color-text-muted)' }}>
        <span>{fmtDate(weeks[0]?.from)}</span><span>cette semaine</span>
      </div>
    </div>
  );
}

function Row({ r, open, onToggle }) {
  return (
    <>
      <tr className="border-t align-top" style={{ borderColor: 'var(--color-border)' }}>
        <td className="px-4 py-3">
          <p className="font-semibold text-body-sm">{r.client || <span style={{ color: 'var(--color-text-muted)' }}>Sans nom</span>}{r.demo && <span className="ml-2 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--color-surface-alt)' }}>démo</span>}{r.archived && <span className="ml-2 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--color-surface-alt)' }}>archivé</span>}</p>
          {r.sponsor && <p style={{ color: 'var(--color-text-muted)' }}>Sponsor : {r.sponsor}</p>}
        </td>
        <td className="px-4 py-3">{r.facilitator || r.facilitators.join(', ') || '·'}</td>
        <td className="px-4 py-3 whitespace-nowrap">{TYPE_LABEL[r.event_type] || '·'}</td>
        <td className="px-4 py-3 whitespace-nowrap">{fmtDate(r.session_date) || '·'}</td>
        <td className="px-4 py-3 whitespace-nowrap">{fmtDate(r.created_at)}</td>
        <td className="px-4 py-3 whitespace-nowrap">{relative(r.last_activity)}</td>
        <td className="px-4 py-3">
          <button type="button" onClick={onToggle} className="flex items-center gap-1 font-semibold hover:underline" aria-expanded={open} disabled={!r.participants}>
            {r.participants} {r.participants > 0 && <ChevronDown size={13} className={open ? 'rotate-180' : ''} />}
          </button>
        </td>
        <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-text-muted)' }}>{r.sequences} séq. · {r.days} j · {r.votes} votes</td>
        <td className="px-4 py-3"><a href={`/${r.id}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1 font-semibold hover:underline" style={{ color: 'var(--color-accent-dark)' }}>Ouvrir <ArrowUpRight size={13} /></a></td>
      </tr>
      {open && (
        <tr style={{ backgroundColor: 'var(--color-surface-alt)' }}>
          <td colSpan={9} className="px-4 py-3">
            <div className="flex flex-wrap gap-2">
              {r.members.map(m => (
                <span key={m.pseudo} className="px-2.5 py-1 rounded-full" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <b>{m.pseudo}</b>{r.facilitators.includes(m.pseudo) && ' · facilitateur'} <span style={{ color: 'var(--color-text-muted)' }}>· {m.visits} visite{m.visits > 1 ? 's' : ''} · {relative(m.last_seen)}</span>
                </span>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
