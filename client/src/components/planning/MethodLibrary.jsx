import { useMemo, useState } from 'react';
import { Monitor, Plus, Search, Sparkles } from 'lucide-react';
import { suggestMethods } from '../../planning/suggestions.js';
import { useStore } from '../../store.jsx';
import { usePlanning } from '../../planning/usePlanning.js';
import { METHODS, METHOD_CATEGORIES, methodToSequence } from '../../planning/methods.js';
import { DIAMOND, KINDS } from '../../planning/constants.js';
import { fmtDur, sortByPos, dayLabel } from '../../planning/utils.js';
import { Modal } from '../ui/Overlay.jsx';

export default function MethodLibrary({ onClose, targetDayId = undefined }) {
  const { state, dispatch } = useStore();
  const actions = usePlanning();
  const days = sortByPos(state.agendaDays);
  const [dayId, setDayId] = useState(targetDayId !== undefined ? targetDayId : (days[0]?.id ?? null));
  const [cat, setCat] = useState('');
  const [q, setQ] = useState('');
  const [distanciel, setDistanciel] = useState(false);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return METHODS.filter(m => (!cat || m.cat === cat)
      && (!distanciel || m.distanciel)
      && (!needle || [m.name, m.intention, m.format, m.consignes].join(' ').toLowerCase().includes(needle)));
  }, [cat, q, distanciel]);

  const suggestions = useMemo(() => suggestMethods({ axes: state.axes, axesFinal: state.axesFinal, situation: state.planning?.situation })
    .filter(x => !distanciel || x.method.distanciel).slice(0, 6), [state.axes, state.axesFinal, state.planning?.situation, distanciel]);
  const showSuggestions = !q.trim() && !cat && suggestions.length > 0;

  function add(m) {
    actions.addSequence(dayId || null, null, methodToSequence(m));
    const where = dayId ? dayLabel(days.find(d => d.id === dayId), days.findIndex(d => d.id === dayId)) : 'le banc';
    dispatch({ type: 'ADD_NOTIFICATION', notification: { message: `« ${m.name} » ajouté à ${where}`, type: 'success' } });
  }

  return (
    <Modal title="Bibliothèque de méthodes" width={980} onClose={onClose}
      subtitle="Chaque méthode pré-remplit la séquence. Ajustez l'intention et le format aux mots du client.">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
          <input className="input-field w-full !pl-9" placeholder="Chercher : décision, conflit, futur, vote…" value={q} onChange={e => setQ(e.target.value)} autoFocus />
        </div>
        <label className="flex items-center gap-1.5 text-body-sm cursor-pointer">
          <input type="checkbox" checked={distanciel} onChange={e => setDistanciel(e.target.checked)} /> <Monitor size={14} /> Compatible visio
        </label>
        <label className="flex items-center gap-2 text-body-sm">
          Ajouter à
          <select className="input-field" value={dayId ?? ''} onChange={e => setDayId(e.target.value || null)}>
            {days.map((d, i) => <option key={d.id} value={d.id}>{dayLabel(d, i)}</option>)}
            <option value="">Le banc (à placer)</option>
          </select>
        </label>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button onClick={() => setCat('')} className="px-3 py-1 rounded-full text-caption font-semibold"
          style={{ backgroundColor: !cat ? 'var(--color-primary)' : 'var(--color-surface-alt)', color: !cat ? 'var(--color-surface)' : 'var(--color-text-muted)' }}>Tout</button>
        {METHOD_CATEGORIES.map(c => (
          <button key={c.key} onClick={() => setCat(c.key)} title={c.hint} className="px-3 py-1 rounded-full text-caption font-semibold"
            style={{ backgroundColor: cat === c.key ? 'var(--color-primary)' : 'var(--color-surface-alt)', color: cat === c.key ? 'var(--color-surface)' : 'var(--color-text-muted)' }}>{c.label}</button>
        ))}
      </div>
      {showSuggestions && (
        <section className="mb-6 rounded-2xl p-4" style={{ backgroundColor: 'var(--color-accent-soft)' }}>
          <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-accent-dark)' }}><Sparkles size={14} /> Suggéré par votre cadrage</p>
          <p className="text-caption mb-3" style={{ color: 'var(--color-text-muted)' }}>Tiré des 8 polarités et de la situation du collectif. Une piste, pas un verdict.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {suggestions.map(({ method: m, raisons }) => (
              <div key={m.key} className="rounded-xl p-3 flex flex-col gap-1.5" style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-1)' }}>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-body-sm leading-snug">{m.name}</span>
                  <span className="text-caption font-semibold shrink-0" style={{ color: 'var(--color-text-muted)' }}>{fmtDur(m.duration)}</span>
                </div>
                <div className="flex flex-wrap gap-1">{raisons.map(r => <span key={r} className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md" style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}>{r}</span>)}</div>
                {m.intention && <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>{m.intention}</p>}
                <button onClick={() => add(m)} disabled={actions.archived} className="btn-outline !h-8 text-[12px] self-start mt-auto"><Plus size={13} /> Ajouter</button>
              </div>
            ))}
          </div>
        </section>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {list.map(m => (
          <article key={m.key} className="rounded-card p-3.5 flex flex-col gap-1.5 transition-shadow hover:elevation-2"
            style={{ border: '1px solid var(--color-border)', borderLeft: `4px solid ${m.kind === 'apport' ? '#F2C245' : m.kind === 'pause' ? '#c4c4c4' : 'var(--color-ink)'}`, backgroundColor: m.kind === 'apport' ? 'rgba(242,194,69,0.06)' : 'var(--color-surface)' }}>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display font-semibold text-body-sm leading-snug">{m.name}</h3>
              <span className="text-caption shrink-0 font-semibold" style={{ color: 'var(--color-text-muted)' }}>{fmtDur(m.duration)}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}>{KINDS[m.kind].label}</span>
              {m.diamond && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold text-white" style={{ backgroundColor: DIAMOND[m.diamond].color }}>{DIAMOND[m.diamond].label}</span>}
              {!m.distanciel && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}>Présentiel</span>}
            </div>
            {m.intention && <p className="text-caption"><b>Intention.</b> {m.intention}</p>}
            {m.format && <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>{m.format}</p>}
            <div className="mt-auto pt-1.5">
              <button onClick={() => add(m)} disabled={actions.archived} className="btn-ghost text-caption flex items-center gap-1 !px-2 !py-1" style={{ border: '1px solid var(--color-border)' }}>
                <Plus size={13} /> Ajouter
              </button>
            </div>
          </article>
        ))}
        {list.length === 0 && <p className="text-body-sm col-span-full text-center py-10" style={{ color: 'var(--color-text-muted)' }}>Rien ne correspond. Essayez un autre mot.</p>}
      </div>
    </Modal>
  );
}
