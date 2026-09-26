import { useMemo, useState } from 'react';
import { AlertTriangle, CalendarClock, CheckCircle2, Download, Eye, Lock, Plus, Printer, RotateCcw, Target, Trash2, Unlock, Users } from 'lucide-react';
import { useStore } from '../../store.jsx';
import socket from '../../socket.js';
import { ACTION_STATUS, CRITERION_STATUS, HORIZONS, HORIZON_DAYS, REVIEW_CRITERIA, REVIEW_SCALE } from '../../planning/constants.js';
import { successSummary, printSheet, buildSheetHtml, sheetFileName } from '../../planning/sheet.js';
import { successToCsv } from '../../planning/exporters.js';
import { downloadFile, formatDate, sortByPos } from '../../planning/utils.js';
import { AutoField } from '../ui/Overlay.jsx';

const f1 = (x) => (x == null ? '·' : x.toFixed(1).replace('.', ','));

function addDays(dateStr, n) {
  if (!dateStr) return '';
  const d = new Date(`${dateStr}T00:00`);
  if (Number.isNaN(d.getTime())) return '';
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Date de fin du temps collectif : dernier jour daté, sinon la date du cadrage
export function sessionEndDate(state) {
  const dated = sortByPos(state.agendaDays).map(d => d.date).filter(Boolean).sort();
  return dated[dated.length - 1] || state.space?.session_date_end || state.space?.session_date || '';
}

function Kpi({ value, label, sub, color }) {
  return (
    <div className="rounded-card p-4 elevation-1" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="font-display font-bold text-[26px] leading-none" style={{ color: color || 'var(--color-text)' }}>
        {value === '·' || value === '· → ·' ? <span className="text-body font-semibold" style={{ color: 'var(--color-text-muted)' }}>À mesurer</span> : value}
      </div>
      <div className="text-caption font-semibold uppercase tracking-wide mt-1.5" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
      {sub && <div className="text-caption mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{sub}</div>}
    </div>
  );
}

function StatusSelect({ value, options, onChange, disabled }) {
  const cur = options[value] || Object.values(options)[0];
  return (
    <select value={value} disabled={disabled} onChange={e => onChange(e.target.value)}
      className="text-caption font-bold rounded-full px-2.5 py-1 cursor-pointer border-0 text-white"
      style={{ backgroundColor: cur.color }} aria-label="Statut">
      {Object.entries(options).map(([k, o]) => <option key={k} value={k} style={{ color: '#000', backgroundColor: '#fff' }}>{o.label}</option>)}
    </select>
  );
}

// Distribution d'un vote
function Distribution({ votes, max, color = '#F2C245' }) {
  const counts = Array.from({ length: max }, (_, i) => votes.filter(v => v.value === i + 1).length);
  const top = Math.max(1, ...counts);
  return (
    <div>
      <div className="flex items-end gap-1 h-20">
        {counts.map((n, i) => (
          <div key={i} className="flex-1 rounded-t transition-all" title={`${i + 1} : ${n} vote${n > 1 ? 's' : ''}`}
            style={{ height: `${Math.max(4, (n / top) * 100)}%`, backgroundColor: n ? color : 'var(--color-surface-alt)' }} />
        ))}
      </div>
      <div className="flex gap-1 mt-1">
        {counts.map((n, i) => <span key={i} className="flex-1 text-center text-[10px] tabular-nums" style={{ color: 'var(--color-text-muted)' }}>{i + 1}</span>)}
      </div>
    </div>
  );
}

// Carte de vote pour un participant (aussi utilisée en bandeau flottant)
export function VoteCard({ kind, compact = false }) {
  const { state } = useStore();
  const max = kind === 'roti' ? 5 : 10;
  const mine = state.success.votes.find(v => v.kind === kind && v.pseudo === state.pseudo);
  const question = kind === 'roti'
    ? 'Le temps passé valait-il le coup ? (1 : pas du tout, 5 : largement)'
    : (state.success.scaleQuestion || state.planning?.scale_question || (state.planning?.question ? `Sur « ${state.planning.question} », où en est le groupe ?` : 'Où en est le groupe sur le sujet ?'));
  const label = kind === 'avant' ? 'Avant' : kind === 'apres' ? 'Après' : 'ROTI';
  return (
    <div className={compact ? '' : 'rounded-card p-4'} style={compact ? undefined : { border: '1.5px solid var(--color-accent)', backgroundColor: 'rgba(242,194,69,0.06)' }}>
      <p className="text-caption font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-accent-dark)' }}>Vote {label} ouvert</p>
      <p className="text-body-sm font-medium mb-2">{question}</p>
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: max }, (_, i) => i + 1).map(n => (
          <button key={n} type="button" onClick={() => socket.emit('success:vote', { kind, value: n })}
            className="w-9 h-9 rounded-btn font-bold text-body-sm transition-all"
            style={{ backgroundColor: mine?.value === n ? '#141E37' : 'var(--color-surface)', color: mine?.value === n ? '#F2C245' : 'var(--color-text)', border: '1px solid var(--color-border)' }}
            aria-pressed={mine?.value === n}>{n}</button>
        ))}
      </div>
      {kind !== 'roti' && <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-muted)' }}>1 : on part de loin · 10 : on y est</p>}
      {mine && <p className="text-caption mt-1.5" style={{ color: 'var(--color-success)' }}>Vote enregistré : {mine.value}. Vous pouvez le changer.</p>}
    </div>
  );
}

export default function SuccessPage() {
  const { state } = useStore();
  const S = state.success;
  const summary = useMemo(() => successSummary(S), [S]);
  const ro = !!state.archived;
  const admin = state.isFacilitator || (state.facilitators || []).length === 0;
  const endDate = sessionEndDate(state);
  const [showCards, setShowCards] = useState(false);

  const successCards = state.cards.filter(c => c.column_key === 'definir_succes');
  const existing = new Set(S.criteria.map(c => c.statement.trim()));

  const saveCriterion = (id, fields) => socket.emit('success:criterion', { id, fields });
  const saveAction = (id, fields) => socket.emit('success:action', { id, fields });
  const setOpen = (kind, open) => socket.emit('success:votes-open', { kinds: open ? [...new Set([...S.votesOpen, kind])] : S.votesOpen.filter(k => k !== kind) });

  const payload = { space: state.space, meta: state.planning, days: state.agendaDays, blocks: state.blocks, success: S };

  // Échéancier : critères et actions à regarder à chaque horizon
  const timeline = useMemo(() => HORIZONS.filter(h => h.key !== 'fin').map(h => {
    const date = endDate ? addDays(endDate, HORIZON_DAYS[h.key]) : '';
    const crit = S.criteria.filter(c => c.horizon === h.key);
    const acts = S.actions.filter(a => a.horizon === h.key && !a.due_date);
    return { ...h, date, crit, acts };
  }).filter(h => h.crit.length || h.acts.length), [S, endDate]);

  const avant = S.votes.filter(v => v.kind === 'avant');
  const apres = S.votes.filter(v => v.kind === 'apres');
  const roti = S.votes.filter(v => v.kind === 'roti');
  const delta = summary.avant && summary.apres ? summary.apres.avg - summary.avant.avg : null;
  const today = todayStr();

  return (
    <div className="max-w-[1200px] mx-auto px-3 sm:px-5 py-5 grid gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-h2 flex items-center gap-2"><Target size={22} style={{ color: 'var(--color-accent-dark)' }} /> Mesure du succès</h1>
          <p className="text-body-sm max-w-2xl mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Un atelier réussi, ce n'est pas tout le monde content et tout le monde a parlé. On définit le succès avant, on le mesure pendant, on le suit après.
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-ghost text-body-sm flex items-center gap-1.5" style={{ border: '1px solid var(--color-border)' }}
            onClick={() => downloadFile(`${sheetFileName('succes', state.space)}.csv`, successToCsv(S), 'text/csv;charset=utf-8')}><Download size={15} /> CSV</button>
          <button type="button" className="btn-ghost text-body-sm flex items-center gap-1.5" style={{ border: '1px solid var(--color-border)' }}
            onClick={() => downloadFile(`${sheetFileName('succes', state.space)}.html`, buildSheetHtml({ ...payload, variant: 'succes', mode: 'editable' }), 'text/html;charset=utf-8')}><Eye size={15} /> HTML</button>
          <button type="button" className="btn-primary text-body-sm flex items-center gap-1.5" onClick={() => printSheet({ ...payload, variant: 'succes' })}><Printer size={15} /> PDF</button>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi value={summary.score == null ? '·' : `${summary.score} %`} label="Critères atteints"
          sub={`${summary.measured} mesuré${summary.measured > 1 ? 's' : ''} sur ${summary.criteria}`}
          color={summary.score == null ? undefined : summary.score >= 75 ? 'var(--color-success)' : summary.score >= 40 ? 'var(--color-warning)' : 'var(--color-error)'} />
        <Kpi value={`${f1(summary.avant?.avg)} → ${f1(summary.apres?.avg)}`} label="Avant / Après"
          sub={delta != null ? `${delta >= 0 ? '+' : ''}${f1(delta)} point${Math.abs(delta) >= 2 ? 's' : ''} sur 10` : 'Sur une échelle de 1 à 10'}
          color={delta == null ? undefined : delta > 0 ? 'var(--color-success)' : 'var(--color-error)'} />
        <Kpi value={summary.roti ? `${f1(summary.roti.avg)} / 5` : '·'} label="ROTI" sub={summary.roti ? `${summary.roti.n} vote${summary.roti.n > 1 ? 's' : ''} · la satisfaction, pas le résultat` : 'La satisfaction, pas le résultat'} />
        <Kpi value={summary.actionRate == null ? '·' : `${summary.actionRate} %`} label="Actions faites" sub={`${summary.done} sur ${summary.actions}`} />
      </div>

      {/* ===== Critères ===== */}
      <section className="rounded-card p-5 elevation-1" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="font-display font-bold text-body">C'est un succès si et seulement si…</h2>
            <p className="text-caption mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Un critère concret et observable. À quoi verra-t-on que ça a bougé ? Quel comportement sera différent ?</p>
          </div>
          <div className="flex gap-2">
            {successCards.length > 0 && !ro && (
              <button type="button" className="btn-ghost text-caption flex items-center gap-1" style={{ border: '1px solid var(--color-border)' }} onClick={() => setShowCards(!showCards)}>
                Reprendre du cadrage ({successCards.length})
              </button>
            )}
            {!ro && <button type="button" className="btn-primary text-caption flex items-center gap-1" onClick={() => saveCriterion(null, { statement: '', horizon: 'fin' })}><Plus size={14} /> Critère</button>}
          </div>
        </div>

        {showCards && (
          <div className="rounded-card p-3 mb-4 grid gap-1.5 animate-fade-in" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
            <p className="text-caption font-semibold" style={{ color: 'var(--color-text-muted)' }}>Cartes « Définir le succès » du cadrage</p>
            {successCards.map(c => {
              const text = c.content.startsWith('[Q] ') ? c.content.slice(4).split('\n\n').slice(1).join(' ').trim() || c.content.slice(4) : c.content;
              const done = existing.has(text.trim());
              return (
                <div key={c.id} className="flex items-start gap-2 text-caption">
                  <span className="flex-1">{text}</span>
                  <button type="button" disabled={done} className="btn-ghost !py-0.5 !px-2 text-caption shrink-0" style={{ border: '1px solid var(--color-border)' }}
                    onClick={() => saveCriterion(null, { statement: text.slice(0, 500), horizon: 'fin' })}>{done ? 'Repris' : 'Reprendre'}</button>
                </div>
              );
            })}
          </div>
        )}

        {S.criteria.length === 0 && (
          <p className="text-body-sm py-6 text-center" style={{ color: 'var(--color-text-muted)' }}>
            Aucun critère. Posez la question au sponsor : « Il est 16h30, vous êtes satisfait parce que… ? »
          </p>
        )}
        <div className="grid gap-3">
          {S.criteria.map((c, i) => (
            <div key={c.id} className="rounded-card p-3 grid gap-2 md:grid-cols-[1.4fr_1.2fr_150px_auto]" style={{ border: '1px solid var(--color-border)' }}>
              <div>
                <span className="text-label font-semibold uppercase" style={{ color: 'var(--color-text-muted)' }}>Critère {i + 1}</span>
                <AutoField value={c.statement} disabled={ro} multiline rows={2} placeholder="Chaque participant repart avec une action qu'il porte lui-même."
                  onSave={v => saveCriterion(c.id, { statement: v })} />
              </div>
              <div>
                <span className="text-label font-semibold uppercase" style={{ color: 'var(--color-text-muted)' }}>Ce qu'on observe</span>
                <AutoField value={c.indicator} disabled={ro} multiline rows={2} placeholder="30 cartes d'engagement signées."
                  onSave={v => saveCriterion(c.id, { indicator: v })} />
              </div>
              <div className="grid gap-2 content-start">
                <div>
                  <span className="text-label font-semibold uppercase" style={{ color: 'var(--color-text-muted)' }}>Échéance</span>
                  <select className="input-field w-full" value={c.horizon} disabled={ro} onChange={e => saveCriterion(c.id, { horizon: e.target.value })}>
                    {HORIZONS.map(h => <option key={h.key} value={h.key}>{h.label}</option>)}
                  </select>
                </div>
                <div>
                  <span className="text-label font-semibold uppercase" style={{ color: 'var(--color-text-muted)' }}>Cible</span>
                  <AutoField value={c.target} disabled={ro} placeholder="100 %" onSave={v => saveCriterion(c.id, { target: v })} />
                </div>
              </div>
              <div className="flex md:flex-col items-start gap-2">
                <StatusSelect value={c.status} options={CRITERION_STATUS} disabled={ro} onChange={v => saveCriterion(c.id, { status: v })} />
                {!ro && <button type="button" className="p-1.5 rounded hover:bg-black/5" aria-label="Supprimer le critère" onClick={() => { if (confirm('Supprimer ce critère ?')) socket.emit('success:criterion-delete', { id: c.id }); }}><Trash2 size={14} /></button>}
              </div>
              {c.status !== 'a_mesurer' && (
                <div className="md:col-span-4">
                  <AutoField value={c.result_note} disabled={ro} placeholder="Le constat : ce qu'on a vu, avec un fait." onSave={v => saveCriterion(c.id, { result_note: v })} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ===== Avant / Après + ROTI ===== */}
      <section className="rounded-card p-5 elevation-1" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div>
            <h2 className="font-display font-bold text-body">Avant 1, après 10</h2>
            <p className="text-caption mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Le groupe se situe au début, puis à la fin, sur la même question. On mesure le déplacement, pas l'ambiance.</p>
          </div>
          <span className="text-caption flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}><Users size={13} /> Chacun vote depuis son écran, avec le lien du cadrage.</span>
        </div>
        {admin && !ro && (
          <div className="mb-4">
            <span className="text-label font-semibold uppercase" style={{ color: 'var(--color-text-muted)' }}>La question de l'échelle</span>
            <AutoField value={S.scaleQuestion} placeholder={state.planning?.question ? `Sur « ${state.planning.question} », où en est le groupe ?` : 'Où en est le groupe sur le sujet ?'}
              onSave={v => socket.emit('success:scale-question', { question: v })} />
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          {[{ kind: 'avant', label: 'Avant', list: avant, st: summary.avant, max: 10, color: '#C185BB' },
            { kind: 'apres', label: 'Après', list: apres, st: summary.apres, max: 10, color: '#8E2183' },
            { kind: 'roti', label: 'ROTI', list: roti, st: summary.roti, max: 5, color: '#F2C245' }].map(v => {
            const open = S.votesOpen.includes(v.kind);
            return (
              <div key={v.kind} className="rounded-card p-4 grid gap-3 content-start" style={{ border: `1.5px solid ${open ? 'var(--color-accent)' : 'var(--color-border)'}` }}>
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-body-sm">{v.label}</span>
                  <span className="text-caption font-semibold tabular-nums">{v.st ? `${f1(v.st.avg)} / ${v.max} · ${v.st.n} vote${v.st.n > 1 ? 's' : ''}` : 'Pas de vote'}</span>
                </div>
                <Distribution votes={v.list} max={v.max} color={v.color} />
                {open && <VoteCard kind={v.kind} compact />}
                {admin && !ro && (
                  <div className="flex flex-wrap gap-1.5">
                    <button type="button" className={`${open ? 'btn-ghost' : 'btn-primary'} text-caption flex items-center gap-1 !py-1 !px-2.5`} style={open ? { border: '1px solid var(--color-border)' } : undefined}
                      onClick={() => setOpen(v.kind, !open)}>{open ? <><Lock size={12} /> Fermer le vote</> : <><Unlock size={12} /> Ouvrir le vote</>}</button>
                    {v.list.length > 0 && (
                      <button type="button" className="btn-ghost text-caption flex items-center gap-1 !py-1 !px-2" onClick={() => { if (confirm(`Effacer les votes ${v.label} ?`)) socket.emit('success:votes-clear', { kind: v.kind }); }}>
                        <RotateCcw size={12} /> Effacer
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {delta != null && (
          <p className="text-body-sm mt-4 font-medium">
            Le groupe s'est déplacé de <b>{delta >= 0 ? '+' : ''}{f1(delta)}</b> sur 10.
            {summary.roti && ` ROTI à ${f1(summary.roti.avg)} / 5 : à lire à côté des critères, jamais à leur place.`}
          </p>
        )}
      </section>

      {/* ===== La suite ===== */}
      <section className="rounded-card p-5 elevation-1" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="font-display font-bold text-body">La suite : qui fait quoi, pour quand</h2>
            <p className="text-caption mt-0.5" style={{ color: 'var(--color-text-muted)' }}>La facilitation ne s'arrête pas au temps collectif. Une action, un nom, une date. À 72 h, 2 semaines, 1 mois.</p>
          </div>
          {!ro && <button type="button" className="btn-primary text-caption flex items-center gap-1" onClick={() => saveAction(null, { what: '', horizon: '72h', due_date: endDate ? addDays(endDate, 3) : '' })}><Plus size={14} /> Action</button>}
        </div>
        {S.actions.length === 0 && <p className="text-body-sm py-4 text-center" style={{ color: 'var(--color-text-muted)' }}>Aucune action pour l'instant.</p>}
        <div className="grid gap-2">
          {S.actions.map(a => {
            const late = a.due_date && a.due_date < today && !['fait', 'abandonne'].includes(a.status);
            return (
              <div key={a.id} className="rounded-card p-3 grid gap-2 md:grid-cols-[1.6fr_1fr_140px_150px_auto] items-start" style={{ border: `1px solid ${late ? 'var(--color-error)' : 'var(--color-border)'}` }}>
                <AutoField value={a.what} disabled={ro} placeholder="Envoyer la synthèse à toute l'entreprise" onSave={v => saveAction(a.id, { what: v })} ariaLabel="Action" />
                <AutoField value={a.who} disabled={ro} placeholder="Qui (un nom)" onSave={v => saveAction(a.id, { who: v })} ariaLabel="Qui" />
                <select className="input-field" value={a.horizon} disabled={ro} aria-label="Horizon"
                  onChange={e => saveAction(a.id, { horizon: e.target.value, due_date: endDate ? addDays(endDate, HORIZON_DAYS[e.target.value]) : a.due_date })}>
                  {HORIZONS.map(h => <option key={h.key} value={h.key}>{h.label}</option>)}
                </select>
                <input type="date" className="input-field" value={a.due_date || ''} disabled={ro} aria-label="Pour le" onChange={e => saveAction(a.id, { due_date: e.target.value })} />
                <div className="flex items-center gap-1.5">
                  <StatusSelect value={a.status} options={ACTION_STATUS} disabled={ro} onChange={v => saveAction(a.id, { status: v })} />
                  {!ro && <button type="button" className="p-1.5 rounded hover:bg-black/5" aria-label="Supprimer l'action" onClick={() => { if (confirm('Supprimer cette action ?')) socket.emit('success:action-delete', { id: a.id }); }}><Trash2 size={14} /></button>}
                </div>
                {late && <p className="md:col-span-5 text-caption flex items-center gap-1" style={{ color: 'var(--color-error)' }}><AlertTriangle size={12} /> En retard depuis le {formatDate(a.due_date, { day: 'numeric', month: 'long' })}.</p>}
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== Échéancier ===== */}
      <section className="rounded-card p-5 elevation-1" style={{ backgroundColor: 'var(--color-surface)' }}>
        <h2 className="font-display font-bold text-body flex items-center gap-2"><CalendarClock size={18} /> Les rendez-vous de suivi</h2>
        <p className="text-caption mt-0.5 mb-4" style={{ color: 'var(--color-text-muted)' }}>
          {endDate ? `Calculés à partir du ${formatDate(endDate, { day: 'numeric', month: 'long', year: 'numeric' })}, fin du temps collectif.` : 'Datez le temps collectif (fiche ou jours) pour calculer les rendez-vous.'}
          {' '}Suivi séminaire Insuffle : J+15 et J+90.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {['j15', 'j90'].concat(timeline.map(t => t.key).filter(k => !['j15', 'j90'].includes(k))).map(key => {
            const h = HORIZONS.find(x => x.key === key);
            const t = timeline.find(x => x.key === key) || { crit: [], acts: [] };
            const date = endDate ? addDays(endDate, HORIZON_DAYS[key]) : '';
            const past = date && date <= today;
            return (
              <div key={key} className="rounded-card p-3" style={{ backgroundColor: 'var(--color-surface-alt)', borderTop: `3px solid ${past ? 'var(--color-accent)' : 'var(--color-border)'}` }}>
                <p className="font-display font-bold text-body-sm">{h.label}</p>
                <p className="text-caption mb-2" style={{ color: 'var(--color-text-muted)' }}>{date ? formatDate(date, { weekday: 'short', day: 'numeric', month: 'long' }) : 'Date à confirmer'}{past ? ' · c\'est le moment' : ''}</p>
                {t.crit.map(c => <p key={c.id} className="text-caption flex gap-1"><Target size={12} className="shrink-0 mt-0.5" />{c.statement || 'Critère sans texte'}</p>)}
                {t.acts.map(a => <p key={a.id} className="text-caption flex gap-1"><CheckCircle2 size={12} className="shrink-0 mt-0.5" />{a.what || 'Action'}{a.who ? ` · ${a.who}` : ''}</p>)}
                {!t.crit.length && !t.acts.length && <p className="text-caption italic" style={{ color: 'var(--color-text-muted)' }}>Rien de prévu. Un point de suivi avec le sponsor ?</p>}
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== Regard du facilitateur ===== */}
      {admin && (
        <section className="rounded-card p-5 elevation-1" style={{ backgroundColor: 'var(--color-surface)' }}>
          <h2 className="font-display font-bold text-body">Le regard du facilitateur</h2>
          <p className="text-caption mt-0.5 mb-4" style={{ color: 'var(--color-text-muted)' }}>La grille d'observation d'Insuffle Académie, pour soi. Réservée aux facilitateurs du cadrage.</p>
          <div className="grid gap-2">
            {REVIEW_CRITERIA.map(rc => {
              const r = S.review.find(x => x.criterion === rc.key) || { score: 0, note: '' };
              return (
                <div key={rc.key} className="grid md:grid-cols-[220px_auto_1fr] gap-2 items-center py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <div>
                    <p className="font-semibold text-body-sm">{rc.label}</p>
                    <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>{rc.question}</p>
                  </div>
                  <div className="flex gap-1">
                    {REVIEW_SCALE.slice(1).map((lbl, i) => (
                      <button key={lbl} type="button" disabled={ro} title={lbl}
                        onClick={() => socket.emit('success:review', { criterion: rc.key, score: r.score === i + 1 ? 0 : i + 1, note: r.note })}
                        className="px-2 py-1 rounded-btn text-caption font-semibold"
                        style={{ backgroundColor: r.score === i + 1 ? '#8E2183' : 'var(--color-surface-alt)', color: r.score === i + 1 ? '#fff' : 'var(--color-text-muted)' }}>{lbl}</button>
                    ))}
                  </div>
                  <AutoField value={r.note} disabled={ro} placeholder="Ce que j'ai vu, ce que je change la prochaine fois." onSave={v => socket.emit('success:review', { criterion: rc.key, score: r.score, note: v })} />
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
